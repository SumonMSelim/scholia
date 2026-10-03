// Turns raw course material + seed.ts into Sanity documents (data/work/documents.json).
// Deterministic _ids so re-running replaces instead of duplicating.
import {readFile, writeFile} from 'node:fs/promises'
import {dropPreamble, parseVtt, windowCues} from './lib/vtt'
import {cleanText, pdfPages} from './lib/pdf'
import * as seed from './seed'
import type {TopicId} from './seed'

type Doc = Record<string, unknown> & {_id: string; _type: string}
const RAW = 'data/raw'
const key = (prefix: string, i: number) => `${prefix}${i}`
const ref = (id: string) => ({_type: 'reference', _ref: id})
const refs = (ids: readonly TopicId[]) => ids.map((t, i) => ({...seed.topicRef(t), _key: key('t', i)}))
const courseRef = ref(seed.course._id)
const ocwSource = (url: string) => ({
  _type: 'sourceInfo', kind: 'lecture', url, license: seed.LICENSE_OCW, attribution: 'MIT OpenCourseWare, 6.0001 Fall 2016',
})

async function main() {
  const docs: Doc[] = []

  docs.push({
    ...seed.course, _type: 'course', slug: {_type: 'slug', current: '6-0001'},
    source: {...ocwSource(seed.OCW_URL), kind: 'lecture'},
  })

  for (const [idx, [id, title, description]] of seed.topics.entries()) {
    const los = seed.objectives.filter(([, , ts]) => ts.includes(id)).map(([code], i) => ({...ref(`lo-${code}`), _key: key('o', i)}))
    docs.push({_id: `topic-${id}`, _type: 'topic', title, description, order: idx + 1, course: courseRef, slug: {_type: 'slug', current: id}, objectives: los})
  }
  for (const [code, statement] of seed.objectives) docs.push({_id: `lo-${code}`, _type: 'learningObjective', code, statement, course: courseRef})

  const index = (await readFile(`${RAW}/lectures/index.tsv`, 'utf8')).trim().split('\n').map((l) => l.split('\t'))
  for (const lec of seed.lectures) {
    const [, yt, , page] = index.find((r) => Number(r[0]) === lec.n)!
    const windows = dropPreamble(windowCues(parseVtt(await readFile(`${RAW}/lectures/lec${lec.n}.vtt`, 'utf8'))))
    const segments = windows.map((w, i) => ({
      _type: 'segment', _key: key('s', i), startSec: Math.round(w.startSec), endSec: Math.round(w.endSec), text: cleanText(w.text), topics: refs(lec.topics),
    }))
    docs.push({
      _id: `lecture-${lec.n}`, _type: 'lecture', title: lec.title, number: lec.n, course: courseRef,
      durationSec: segments.at(-1)?.endSec, videoUrl: `https://www.youtube.com/watch?v=${yt}`, topics: refs(lec.topics), segments,
      source: ocwSource(page),
    })
    const pages = await pdfPages(`${RAW}/slides/lec${lec.n}.pdf`)
    const slides = pages.map((text, i) => {
      const lines = text.split('\n').filter((l) => l.trim() && !/^6\.0001 LECTURE \d+ ?\d*$/i.test(l.trim()))
      return {_type: 'slide', _key: key('p', i), number: i + 1, title: lines[0]?.slice(0, 80), text: lines.join('\n'), topics: refs(lec.topics)}
    })
    docs.push({
      _id: `slides-${lec.n}`, _type: 'slideDeck', title: `Lecture ${lec.n} slides: ${lec.title}`, course: courseRef, lecture: ref(`lecture-${lec.n}`), slides,
      source: {...ocwSource(`${seed.OCW_URL}pages/lecture-slides-code/`), kind: 'slides'},
    })
  }

  const bookPages = await pdfPages(`${RAW}/book/thinkpython2.pdf`)
  const bookSource = {_type: 'sourceInfo', kind: 'book', url: seed.book.url, license: seed.book.license, attribution: seed.book.attribution}
  docs.push({_id: seed.book._id, _type: 'book', title: seed.book.title, authors: seed.book.authors, edition: seed.book.edition, course: courseRef, source: bookSource})
  const chapterStarts = bookPages.map((p, i) => ({i, m: /^Chapter (\d+)\n(.+)/.exec(p)})).filter((x) => x.m) as {i: number; m: RegExpExecArray}[]
  for (const [ci, start] of chapterStarts.entries()) {
    const number = Number(start.m[1])
    const end = chapterStarts[ci + 1]?.i ?? bookPages.length
    const topics = seed.chapterTopics[number] ?? []
    const sections: {title: string; pageStart: number; pageEnd: number; text: string}[] = []
    let cur: {title: string; pageStart: number; pageEnd: number; lines: string[]} | null = null
    for (let i = start.i; i < end; i++) {
      const printed = i - seed.book.pageOffset
      for (const raw of bookPages[i].split('\n')) {
        const line = raw.trim()
        if (/^\d+ Chapter \d+\./.test(line) || /^\d+\.\d+\. .+ \d+$/.test(line) || /^Chapter \d+$/.test(line)) continue // running headers
        const h = /^(\d{1,2})\.(\d{1,2}) ([A-Z][^\n]{0,60})$/.exec(line)
        if (h && Number(h[1]) === number) {
          if (cur) sections.push({title: cur.title, pageStart: cur.pageStart, pageEnd: printed, text: cur.lines.join('\n')})
          cur = {title: `${h[1]}.${h[2]} ${h[3]}`, pageStart: printed, pageEnd: printed, lines: []}
        } else if (cur) cur.lines.push(line)
      }
    }
    if (cur) sections.push({title: cur.title, pageStart: cur.pageStart, pageEnd: end - 1 - seed.book.pageOffset, text: cur.lines.join('\n')})
    docs.push({
      _id: `chapter-${number}`, _type: 'bookChapter', number, title: start.m[2].trim(), book: ref(seed.book._id),
      pageStart: start.i - seed.book.pageOffset, pageEnd: end - 1 - seed.book.pageOffset, topics: refs(topics),
      sections: sections.map((s, i) => ({_type: 'bookSection', _key: key('b', i), ...s, topics: refs(topics)})),
    })
  }

  for (const a of seed.assignments) {
    const pages = await pdfPages(`${RAW}/psets/${a.file}`)
    docs.push({
      _id: `assignment-${a.n}`, _type: 'assignment', title: a.title, number: a.n, course: courseRef, dueDate: a.dueDate,
      description: pages.join('\n\n'), topics: refs(a.topics),
      relatedLectures: a.lectures.map((n, i) => ({...ref(`lecture-${n}`), _key: key('l', i)})),
      rubric: a.rubric.map((r) => ({_type: 'rubricCriterion', _key: r.key, title: r.title, description: r.description, maxPoints: r.maxPoints, topics: refs(r.topics)})),
      source: {...ocwSource(`${seed.OCW_URL}pages/assignments/`), kind: 'assignment'},
    })
  }

  for (const s of seed.submissions) {
    const a = seed.assignments.find((x) => x.n === s.assignment)!
    docs.push({
      _id: `submission-ps${s.assignment}`, _type: 'submission', title: `My submission: ${a.title}`, assignment: ref(`assignment-${s.assignment}`),
      submittedAt: s.submittedAt, grade: s.grade, maxGrade: 10, content: s.content, overallComment: s.overallComment,
      feedback: s.feedback.map((f, i) => ({_type: 'feedbackItem', _key: key('f', i), ...f})),
      source: {_type: 'sourceInfo', kind: 'submission', attribution: 'Fictional student work written for the Scholia demo'},
    })
  }

  docs.push({
    _id: seed.examScope._id, _type: 'examScope', title: seed.examScope.title, course: courseRef, examDate: seed.examScope.examDate, format: seed.examScope.format,
    topics: seed.examScope.topics.map(([t, weight, notes], i) => ({_type: 'scopedTopic', _key: key('x', i), topic: seed.topicRef(t), weight, ...(notes ? {notes} : {})})),
    objectives: seed.examScope.objectives.map((code, i) => ({...ref(`lo-${code}`), _key: key('o', i)})),
  })

  await writeFile('data/work/documents.json', JSON.stringify(docs, null, 1))
  const byType = docs.reduce<Record<string, number>>((m, d) => ((m[d._type] = (m[d._type] ?? 0) + 1), m), {})
  console.log(`${docs.length} documents`, byType)
  const size = (d: Doc) => JSON.stringify(d).length
  console.log('largest:', [...docs].sort((a, b) => size(b) - size(a)).slice(0, 5).map((d) => `${d._id} ${(size(d) / 1024).toFixed(0)}KB`).join(', '))
}
main().catch((e) => { console.error(e); process.exit(1) })
