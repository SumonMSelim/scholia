// Turns raw course material + a course seed into Sanity documents (data/work/<course>.json).
// Deterministic _ids so re-running replaces instead of duplicating.
// Usage: npx tsx scripts/ingest/build.ts <course dir, e.g. 6-0001>
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dropPreamble, parseVtt, windowCues} from './lib/vtt'
import {cleanText, pdfPages} from './lib/pdf'
import {courseFromArgs} from './courses'
import {checkSeed} from './lib/check-seed'
import type {CourseSeed} from './courses/types'

type Doc = Record<string, unknown> & {_id: string; _type: string}
const key = (prefix: string, i: number) => `${prefix}${i}`
const ref = (id: string) => ({_type: 'reference', _ref: id})

async function buildCourse(seed: CourseSeed): Promise<Doc[]> {
  const RAW = `data/raw/${seed.dir}`
  const id = (local: string) => `${seed.idPrefix}${local}`
  const topicRef = (slug: string) => ref(id(`topic-${slug}`))
  const refs = (slugs: readonly string[]) => slugs.map((t, i) => ({...topicRef(t), _key: key('t', i)}))
  const courseRef = ref(seed.course._id)
  const ocwSource = (url: string) => ({_type: 'sourceInfo', kind: 'lecture', url, license: seed.license, attribution: seed.attribution})
  const docs: Doc[] = []

  docs.push({
    ...seed.course, _type: 'course', slug: {_type: 'slug', current: seed.dir},
    ...(seed.contextEndpoint ? {contextEndpoint: seed.contextEndpoint} : {}),
    starters: seed.starters,
    source: {...ocwSource(seed.ocwUrl), kind: 'lecture'},
  })

  for (const [idx, [slug, title, description]] of seed.topics.entries()) {
    const los = seed.objectives.filter(([, , ts]) => ts.includes(slug)).map(([code], i) => ({...ref(id(`lo-${code}`)), _key: key('o', i)}))
    docs.push({_id: id(`topic-${slug}`), _type: 'topic', title, description, order: idx + 1, course: courseRef, slug: {_type: 'slug', current: slug}, objectives: los})
  }
  for (const [code, statement] of seed.objectives) docs.push({_id: id(`lo-${code}`), _type: 'learningObjective', code, statement, course: courseRef})

  const index = (await readFile(`${RAW}/lectures/index.tsv`, 'utf8')).trim().split('\n').map((l) => l.split('\t'))
  for (const lec of seed.lectures) {
    const [, yt, , page] = index.find((r) => Number(r[0]) === lec.n)!
    const windows = dropPreamble(windowCues(parseVtt(await readFile(`${RAW}/lectures/lec${lec.n}.vtt`, 'utf8'))))
    const segments = windows.map((w, i) => ({
      _type: 'segment', _key: key('s', i), startSec: Math.round(w.startSec), endSec: Math.round(w.endSec), text: cleanText(w.text), topics: refs(lec.topics),
    }))
    docs.push({
      _id: id(`lecture-${lec.n}`), _type: 'lecture', title: lec.title, number: lec.n, course: courseRef,
      durationSec: segments.at(-1)?.endSec, videoUrl: `https://www.youtube.com/watch?v=${yt}`, topics: refs(lec.topics), segments,
      source: ocwSource(page),
    })
    if (!lec.slides) continue
    const pages = await pdfPages(`${RAW}/slides/lec${lec.n}.pdf`)
    const slides = pages.map((text, i) => {
      const lines = text.split('\n').filter((l) => l.trim() && !seed.slideFurniture.test(l.trim()))
      return {_type: 'slide', _key: key('p', i), number: i + 1, title: lines[0]?.slice(0, 80), text: lines.join('\n'), topics: refs(lec.topics)}
    }).filter((s) => s.text) // footer-only or image-only pages; numbers stay the PDF page numbers
    docs.push({
      _id: id(`slides-${lec.n}`), _type: 'slideDeck', title: `Lecture ${lec.n} slides: ${lec.title}`, course: courseRef, lecture: ref(id(`lecture-${lec.n}`)), slides,
      source: {...ocwSource(`${seed.ocwUrl}pages/lecture-slides-code/`), kind: 'slides'},
    })
  }

  const {book} = seed
  const bookPages = await pdfPages(`${RAW}/book/book.pdf`)
  const bookSource = {_type: 'sourceInfo', kind: 'book', url: book.url, license: book.license, attribution: book.attribution}
  docs.push({_id: book._id, _type: 'book', title: book.title, authors: book.authors, edition: book.edition, course: courseRef, source: bookSource})
  const chapterStarts = bookPages.map((p, i) => ({i, m: /^Chapter (\d+)\n(.+)/.exec(p)})).filter((x) => x.m) as {i: number; m: RegExpExecArray}[]
  for (const [ci, start] of chapterStarts.entries()) {
    const number = Number(start.m[1])
    const end = chapterStarts[ci + 1]?.i ?? bookPages.length
    const topics = seed.chapterTopics[number] ?? []
    const sections: {title: string; pageStart: number; pageEnd: number; text: string}[] = []
    let cur: {title: string; pageStart: number; pageEnd: number; lines: string[]} | null = null
    for (let i = start.i; i < end; i++) {
      const printed = i - book.pageOffset
      for (const raw of bookPages[i].split('\n')) {
        const line = raw.trim()
        if (/^\d+ Chapter \d+\./.test(line) || /^\d+\.\d+\. .+ \d+$/.test(line) || /^Chapter \d+$/.test(line) || book.runningHeader?.test(line)) continue // running headers
        const h = /^(\d{1,2})\.(\d{1,2}) ([A-Z][^\n]{0,60})$/.exec(line)
        if (h && Number(h[1]) === number) {
          if (cur) sections.push({title: cur.title, pageStart: cur.pageStart, pageEnd: printed, text: cur.lines.join('\n')})
          cur = {title: `${h[1]}.${h[2]} ${h[3]}`, pageStart: printed, pageEnd: printed, lines: []}
        } else if (cur) cur.lines.push(line)
      }
    }
    if (cur) sections.push({title: cur.title, pageStart: cur.pageStart, pageEnd: end - 1 - book.pageOffset, text: cur.lines.join('\n')})
    docs.push({
      _id: id(`chapter-${number}`), _type: 'bookChapter', number, title: start.m[2].trim(), book: ref(book._id),
      pageStart: start.i - book.pageOffset, pageEnd: end - 1 - book.pageOffset, topics: refs(topics),
      sections: sections.map((s, i) => ({_type: 'bookSection', _key: key('b', i), ...s, topics: refs(topics)})),
    })
  }

  for (const a of seed.assignments) {
    const pages = await pdfPages(`${RAW}/psets/${a.file}`)
    docs.push({
      _id: id(`assignment-${a.n}`), _type: 'assignment', title: a.title, number: a.n, course: courseRef, dueDate: a.dueDate,
      description: pages.join('\n\n'), topics: refs(a.topics),
      relatedLectures: a.lectures.map((n, i) => ({...ref(id(`lecture-${n}`)), _key: key('l', i)})),
      rubric: a.rubric.map((r) => ({_type: 'rubricCriterion', _key: r.key, title: r.title, description: r.description, maxPoints: r.maxPoints, topics: refs(r.topics)})),
      source: {...ocwSource(`${seed.ocwUrl}pages/assignments/`), kind: 'assignment'},
    })
  }

  for (const s of seed.submissions) {
    const a = seed.assignments.find((x) => x.n === s.assignment)!
    docs.push({
      _id: id(`submission-ps${s.assignment}`), _type: 'submission', title: `My submission: ${a.title}`, assignment: ref(id(`assignment-${s.assignment}`)),
      submittedAt: s.submittedAt, grade: s.grade, maxGrade: 10, content: s.content, overallComment: s.overallComment,
      feedback: s.feedback.map((f, i) => ({_type: 'feedbackItem', _key: key('f', i), ...f})),
      source: {_type: 'sourceInfo', kind: 'submission', attribution: 'Fictional student work written for the Scholia demo'},
    })
  }

  const {examScope} = seed
  docs.push({
    _id: examScope._id, _type: 'examScope', title: examScope.title, course: courseRef, examDate: examScope.examDate, format: examScope.format,
    topics: examScope.topics.map(([t, weight, notes], i) => ({_type: 'scopedTopic', _key: key('x', i), topic: topicRef(t), weight, ...(notes ? {notes} : {})})),
    objectives: examScope.objectives.map((code, i) => ({...ref(id(`lo-${code}`)), _key: key('o', i)})),
  })
  return docs
}

async function main() {
  const seed = await courseFromArgs()
  const problems = checkSeed(seed)
  if (problems.length) throw new Error(`Seed ${seed.dir} has problems:\n- ${problems.join('\n- ')}`)
  const docs = await buildCourse(seed)
  await mkdir('data/work', {recursive: true})
  await writeFile(`data/work/${seed.dir}.json`, JSON.stringify(docs, null, 1))
  const byType = docs.reduce<Record<string, number>>((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {})
  console.log(`${seed.dir}: ${docs.length} documents`, byType)
  const size = (d: Doc) => JSON.stringify(d).length
  console.log('largest:', [...docs].sort((a, b) => size(b) - size(a)).slice(0, 5).map((d) => `${d._id} ${(size(d) / 1024).toFixed(0)}KB`).join(', '))
}
main().catch((e) => { console.error(e); process.exit(1) })
