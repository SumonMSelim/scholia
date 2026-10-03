import {fmtSec, type Citation} from './citations'
import type {SourceMap} from '@/lib/sanity/queries'

export type Resolved = {tag: string; title: string; subtitle?: string; href?: string; web?: boolean}

// Turns a parsed citation into something a human can click. Lecture links land on the exact second.
export function resolveCitation(c: Citation, s: SourceMap | null): Resolved {
  switch (c.kind) {
    case 'lecture': {
      const lec = s?.lectures.find((l) => l.number === c.lecture)
      return {
        tag: 'lecture',
        title: `Lecture ${c.lecture} · ${fmtSec(c.sec)}`,
        subtitle: lec?.title,
        href: lec?.videoUrl ? `${lec.videoUrl}&t=${c.sec}s` : undefined,
      }
    }
    case 'slides': {
      const lec = s?.lectures.find((l) => l.number === c.lecture)
      return {tag: 'slide', title: `Lecture ${c.lecture} · slide ${c.slide}`, subtitle: lec?.title, href: s?.slidesUrl}
    }
    case 'book':
      return {tag: 'book', title: `Ch. ${c.chapter} · p. ${c.page}`, subtitle: s?.bookTitle ?? 'Textbook', href: s?.bookUrl}
    case 'assignment': {
      const a = s?.assignments.find((x) => x.number === c.assignment)
      const crit = a?.rubric.find((r) => r.key === c.criterion)
      return {tag: 'rubric', title: a?.title ?? `Assignment ${c.assignment}`, subtitle: crit ? `Criterion: ${crit.title}` : undefined, href: a?.url}
    }
    case 'submission':
      return {tag: 'your work', title: `Your submission, problem set ${c.assignment}`}
    case 'web':
      return {tag: 'web', title: c.domain, href: c.url, web: true}
  }
}
