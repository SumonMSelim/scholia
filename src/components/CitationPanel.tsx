import {fmtSec, type Citation} from '@/lib/agent/citations'
import type {SourceMap} from '@/lib/sanity/queries'

const normalize = (s: string) => s.replace(/\]\(.*$/, ']').replace(/\s+/g, ' ').toLowerCase()

export function CitationPanel({citations, verified, sources}: {citations: Citation[]; verified: Set<string>; sources: SourceMap | null}) {
  const course = citations.filter((c) => c.kind !== 'web')
  const web = citations.filter((c) => c.kind === 'web')
  const isVerified = (c: Citation) => c.kind === 'submission' || c.kind === 'assignment' || verified.has(normalize(c.label))
  return (
    <section className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <h2 className="mb-2 font-semibold">Course sources</h2>
      {course.length === 0 ? (
        <p className="text-zinc-500">Citations from lectures, slides, the textbook and your assignments appear here.</p>
      ) : (
        <ul className="space-y-2">
          {course.map((c) => (
            <li key={c.label}>
              {renderCourse(c, sources)}
              {!isVerified(c) && (
                <span className="ml-2 rounded bg-amber-100 px-1 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200" title="The model wrote this location but no lookup returned it">
                  unverified
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {web.length > 0 && (
        <>
          <h2 className="mt-4 mb-2 font-semibold text-amber-700 dark:text-amber-400">Outside course material</h2>
          <ul className="space-y-2">
            {web.map((c) =>
              c.kind === 'web' ? (
                <li key={c.label}>
                  <a href={c.url} target="_blank" rel="noreferrer" className="underline">
                    {c.domain}
                  </a>
                  <span className="ml-2 rounded bg-amber-100 px-1 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200">web</span>
                </li>
              ) : null,
            )}
          </ul>
        </>
      )}
    </section>
  )
}

function renderCourse(c: Citation, s: SourceMap | null) {
  const Tag = ({children}: {children: string}) => (
    <span className="mr-2 rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-700">{children}</span>
  )
  switch (c.kind) {
    case 'lecture': {
      const lec = s?.lectures.find((l) => l.number === c.lecture)
      const href = lec?.videoUrl ? `${lec.videoUrl}&t=${c.sec}s` : undefined
      return (
        <>
          <Tag>lecture</Tag>
          <Link href={href}>
            Lecture {c.lecture} at {fmtSec(c.sec)}
          </Link>
          {lec && <div className="text-xs text-zinc-500">{lec.title}</div>}
        </>
      )
    }
    case 'slides': {
      const lec = s?.lectures.find((l) => l.number === c.lecture)
      return (
        <>
          <Tag>slide</Tag>
          <Link href={s?.slidesUrl}>
            Lecture {c.lecture} slides, slide {c.slide}
          </Link>
          {lec && <div className="text-xs text-zinc-500">{lec.title}</div>}
        </>
      )
    }
    case 'book':
      return (
        <>
          <Tag>book</Tag>
          <Link href={s?.bookUrl}>
            {s?.bookTitle ?? 'Textbook'}, chapter {c.chapter}, p. {c.page}
          </Link>
        </>
      )
    case 'assignment': {
      const a = s?.assignments.find((x) => x.number === c.assignment)
      const crit = a?.rubric.find((r) => r.key === c.criterion)
      return (
        <>
          <Tag>rubric</Tag>
          <Link href={a?.url}>{a?.title ?? `Assignment ${c.assignment}`}</Link>
          {crit && <div className="text-xs text-zinc-500">Criterion: {crit.title}</div>}
        </>
      )
    }
    case 'submission':
      return (
        <>
          <Tag>your work</Tag>Submission for problem set {c.assignment}
        </>
      )
    default:
      return null
  }
}

function Link({href, children}: {href?: string; children: React.ReactNode}) {
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {children}
    </a>
  ) : (
    <span>{children}</span>
  )
}
