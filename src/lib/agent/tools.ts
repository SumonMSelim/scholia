import {tool} from 'ai'
import {z} from 'zod'
import {tavily} from '@tavily/core'
import {readClient, writeClient} from '@/lib/sanity/client'
import {TRUSTED_DOMAINS, isTrusted} from './trusted-domains'

// GROQ `match` is prefix based ("alias*" matches "aliases" and "aliasing"). A crude stem widens recall.
export function stem(word: string): string {
  const w = word.toLowerCase().replace(/[^\w]/g, '')
  const m = /^(.{4,}?)(ing|ers?|es|ed|s|ly)$/.exec(w)
  return m ? m[1] : w
}

// Exact locators from the structured dataset. The Knowledge Base explains; this tool pins the
// explanation to a lecture second, a slide number or a book page, which only works because
// transcripts, decks and chapters are stored as typed arrays, not blobs.
export const lookupSource = (courseId: string) =>
  tool({
    description:
      'Find the exact course locations (lecture timestamp, slide number, book page) that mention the given keywords. Use before citing. Hits are ranked by how many keywords they contain. Copy the returned cite strings verbatim.',
    inputSchema: z.object({
      keywords: z.array(z.string()).min(1).max(4).describe('2 to 4 distinctive single words (e.g. "aliasing", "clone"), not generic ones like "list" or "function"'),
      lecture: z.number().int().optional().describe('Restrict to one lecture number when you know it'),
      topic: z.string().optional().describe('Topic slug (from weak_topics or exam_plan) to restrict to material tagged with that topic'),
    }),
    execute: async ({keywords, lecture, topic}) => {
      // GROQ match is word-prefix based: "alias*" matches "aliasing". OR across keywords.
      const params: Record<string, string | number> = {course: courseId}
      const or = (field: string) =>
        keywords
          .map((k, i) => {
            params[`k${i}`] = `${stem(k.trim().split(/\s+/)[0])}*`
            return `${field} match $k${i}`
          })
          .join(' || ')
      const lectureFilter = lecture ? ` && number == ${Number(lecture)}` : ''
      const deckFilter = lecture ? ` && lecture->number == ${Number(lecture)}` : ''
      // Topic ids carry a per-course prefix, so resolve the slug within this course.
      const topicFilter = topic ? ` && references(*[_type=="topic" && course._ref==$course && slug.current==$topic]._id)` : ''
      if (topic) params.topic = topic.replace(/[^\w-]/g, '')
      type Lec = {lecture: number; title: string; hits: {startSec: number; endSec: number; text: string}[]}
      type Deck = {lecture: number; hits: {number: number; title: string; text: string}[]}
      type Chap = {chapter: number; chapterTitle: string; hits: {title: string; pageStart: number; pageEnd: number; text: string}[]}
      const [lecs, decks, chaps] = await Promise.all([
        readClient.fetch<Lec[]>(
          `*[_type=="lecture" && course._ref==$course${lectureFilter}]{ "lecture": number, title, "hits": segments[(${or('text')})${topicFilter}][0..29]{startSec, endSec, text} }[count(hits) > 0]`,
          params,
        ),
        readClient.fetch<Deck[]>(
          `*[_type=="slideDeck" && course._ref==$course${deckFilter}]{ "lecture": lecture->number, "hits": slides[(${or('text')})${topicFilter}][0..29]{number, title, text} }[count(hits) > 0]`,
          params,
        ),
        readClient.fetch<Chap[]>(
          `*[_type=="bookChapter" && book->course._ref==$course]{ "chapter": number, "chapterTitle": title, "hits": sections[(${or('text')})${topicFilter}][0..29]{title, pageStart, pageEnd, text} }[count(hits) > 0]`,
          params,
        ),
      ])
      const words = keywords.map((k) => stem(k.trim().split(/\s+/)[0])).filter(Boolean)
      const score = (t: string) => words.filter((w) => t.toLowerCase().includes(w)).length
      const rank = <T extends {text?: string}>(xs: T[], n: number) =>
        xs.map((x) => ({...x, score: score(x.text ?? '')})).sort((a, b) => b.score - a.score).slice(0, n)
      const segments = rank(lecs.flatMap((l) => l.hits.map((h) => ({lecture: l.lecture, title: l.title, ...h}))), 6)
      const slides = rank(decks.flatMap((d) => d.hits.map((h) => ({lecture: d.lecture, ...h}))), 5)
      const sections = rank(chaps.flatMap((c) => c.hits.map((h) => ({chapter: c.chapter, chapterTitle: c.chapterTitle, ...h}))), 5)
      const clip = (t: string) => (t.length > 400 ? `${t.slice(0, 400)}…` : t)
      return {
        lectureSegments: segments.map((s) => ({...s, text: clip(s.text), cite: `[lecture ${s.lecture} @ ${fmt(s.startSec)}]`})),
        note: segments.length + slides.length + sections.length === 0 ? 'No matches. Try other single keywords. Never invent a timestamp or page.' : 'Cite only with the cite strings above, verbatim.',
        slides: slides.map((s) => ({...s, text: clip(s.text), cite: `[slides ${s.lecture} #${s.number}]`})),
        bookSections: sections.map((s) => ({chapter: s.chapter, chapterTitle: s.chapterTitle, title: s.title, pageStart: s.pageStart, pageEnd: s.pageEnd, score: s.score, cite: `[book ch.${s.chapter} p.${s.pageStart}]`})),
      }
    },
  })

export const weakTopics = (courseId: string) =>
  tool({
    description:
      "Aggregate the student's graded submissions: points lost per topic, derived from feedback items -> rubric criteria -> topics. Use for 'what should I improve' questions.",
    inputSchema: z.object({}),
    execute: async () => computeWeakTopics(courseId),
  })

export async function computeWeakTopics(courseId: string) {
  type Row = {
    assignment: number
    title: string
    grade: number
    maxGrade: number
    feedback: {criterionKey: string; pointsAwarded: number; severity: string; comment: string; criterion: {title: string; maxPoints: number; topics: {title: string; slug: string}[]} | null}[]
  }
  const rows = await readClient.fetch<Row[]>(
    `*[_type=="submission" && assignment->course._ref==$course] | order(assignment->number) {
      "assignment": assignment->number, "title": assignment->title, grade, maxGrade,
      feedback[]{ criterionKey, pointsAwarded, severity, comment,
        "criterion": ^.assignment->rubric[_key==^.criterionKey][0]{ title, maxPoints, "topics": topics[]->{title, "slug": slug.current} } }
    }`,
    {course: courseId},
  )
  const byTopic = new Map<string, {topic: string; topicSlug: string; lostPoints: number; major: number; minor: number; evidence: string[]}>()
  for (const r of rows) {
    for (const f of r.feedback ?? []) {
      if (!f.criterion) continue
      const lost = f.criterion.maxPoints - f.pointsAwarded
      for (const t of f.criterion.topics ?? []) {
        const e = byTopic.get(t.slug) ?? {topic: t.title, topicSlug: t.slug, lostPoints: 0, major: 0, minor: 0, evidence: []}
        e.lostPoints += lost
        if (f.severity === 'major') e.major++
        if (f.severity === 'minor') e.minor++
        if (lost > 0) e.evidence.push(`PS${r.assignment} "${f.criterion.title}" (-${lost}): ${f.comment}`)
        byTopic.set(t.slug, e)
      }
    }
  }
  const topics = [...byTopic.values()].sort((a, b) => b.lostPoints - a.lostPoints || b.major - a.major)
  return {submissions: rows.map((r) => ({assignment: r.assignment, title: r.title, grade: r.grade, maxGrade: r.maxGrade})), topics}
}

export const examPlan = (courseId: string) =>
  tool({
    description:
      'Build a mock exam plan from the exam scope: topics weighted by importance, with learning objectives and the exam format. Call once at the start of a mock exam.',
    inputSchema: z.object({questions: z.number().int().min(1).max(10).default(3)}),
    execute: async ({questions}) => {
      const scope = await readClient.fetch<{
        title: string
        format: string
        topics: {weight: number; notes?: string; topic: string; topicSlug: string; description: string; objectives: string[]}[]
      } | null>(
        `*[_type=="examScope" && course._ref==$course][0]{ title, format,
          topics[]{ weight, notes, "topic": topic->title, "topicSlug": topic->slug.current, "description": topic->description, "objectives": topic->objectives[]->statement } }`,
        {course: courseId},
      )
      if (!scope) return {error: 'No exam scope for this course'}
      // Weighted sampling without replacement: central topics come up first.
      const pool = [...scope.topics]
      const picked: typeof pool = []
      let seed = 42 + questions
      const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
      while (picked.length < questions && pool.length) {
        const total = pool.reduce((s, t) => s + t.weight, 0)
        let r = rand() * total
        const i = pool.findIndex((t) => (r -= t.weight) <= 0)
        picked.push(...pool.splice(i < 0 ? pool.length - 1 : i, 1))
      }
      return {exam: scope.title, format: scope.format, plan: picked.map((t, i) => ({question: i + 1, ...t}))}
    },
  })

export const webSearch = () =>
  tool({
    description:
      'Search trusted web sources (official Python docs, university sites, the textbook publisher) ONLY when the course material does not answer the question. Results are outside course material and must be labelled as such.',
    inputSchema: z.object({query: z.string().min(3)}),
    execute: async ({query}) => {
      const key = process.env.TAVILY_API_KEY
      if (!key) return {error: 'Web search is not configured'}
      const res = await tavily({apiKey: key}).search(query, {
        maxResults: 5,
        searchDepth: 'basic',
        includeDomains: TRUSTED_DOMAINS,
        includeDomainsMode: 'restrict',
      })
      const results = res.results.filter((r) => isTrusted(r.url)).map((r) => ({
        title: r.title,
        url: r.url,
        domain: new URL(r.url).hostname,
        snippet: r.content.slice(0, 500),
        cite: `[web: ${new URL(r.url).hostname}](${r.url})`,
      }))
      return {query, results, note: 'Outside course material. Cite with the given cite string.'}
    },
  })

export const saveWebReference = (courseId: string) =>
  tool({
    description: 'Save a useful trusted web result into the course as a pending webReference for staff review. Only after the student asks to save it.',
    inputSchema: z.object({
      title: z.string(),
      url: z.string().url(),
      excerpt: z.string().max(1500),
      query: z.string().describe('The student question that led here'),
    }),
    execute: async ({title, url, excerpt, query}) => {
      if (!isTrusted(url)) return {error: 'Domain is not on the trusted list'}
      const domain = new URL(url).hostname
      const doc = await writeClient().create({
        _type: 'webReference',
        title,
        url,
        domain,
        trusted: true,
        fetchedAt: new Date().toISOString(),
        query,
        excerpt,
        status: 'pending',
        course: {_type: 'reference', _ref: courseId},
        source: {_type: 'sourceInfo', kind: 'web', url, attribution: domain},
      })
      return {saved: true, id: doc._id, status: 'pending review'}
    },
  })

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
