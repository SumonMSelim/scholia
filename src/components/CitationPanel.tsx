import {type Citation} from '@/lib/agent/citations'
import {resolveCitation} from '@/lib/agent/resolve'
import type {SourceMap} from '@/lib/sanity/queries'
import {CitationChip} from './CitationChip'

const normalize = (s: string) => s.replace(/\]\(.*$/, ']').replace(/\s+/g, ' ').toLowerCase()

export function CitationPanel({citations, verified, sources}: {citations: Citation[]; verified: Set<string>; sources: SourceMap | null}) {
  const course = citations.filter((c) => c.kind !== 'web')
  const web = citations.filter((c) => c.kind === 'web')
  const isVerified = (c: Citation) => c.kind === 'submission' || c.kind === 'assignment' || verified.has(normalize(c.label))
  return (
    <section className="rounded-xl border border-border bg-surface p-4 text-sm">
      <h2 className="mb-1 font-semibold">Course sources</h2>
      {course.length === 0 ? (
        <p className="text-muted">Citations from lectures, slides, the textbook and your assignments appear here, each resolved to the exact place.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {course.map((c) => {
            const r = resolveCitation(c, sources)
            return (
              <li key={c.label} className="flex flex-col items-start gap-0.5">
                <CitationChip r={r} verified={isVerified(c)} />
                {r.subtitle && <span className="pl-1 text-xs text-muted">{r.subtitle}</span>}
              </li>
            )
          })}
        </ul>
      )}
      {web.length > 0 && (
        <>
          <h2 className="mt-4 mb-1 font-semibold text-warn">Outside course material</h2>
          <p className="mb-2 text-xs text-muted">Trusted web sources only. Not part of the course.</p>
          <ul className="space-y-2">
            {web.map((c) => (
              <li key={c.label}>
                <CitationChip r={resolveCitation(c, sources)} verified />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
