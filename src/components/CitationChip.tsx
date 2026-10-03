import type {Resolved} from '@/lib/agent/resolve'

export function CitationChip({r, verified, inline}: {r: Resolved; verified: boolean; inline?: boolean}) {
  const tone = r.web ? 'border-warn/40 bg-warn-soft text-warn' : 'border-accent/30 bg-accent-soft text-accent'
  const cls = `inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 align-baseline text-[0.78em] font-medium leading-tight no-underline! ${tone} ${inline ? 'mx-0.5' : ''}`
  const body = (
    <>
      <span className="opacity-70">{r.tag}</span>
      <span className="truncate">{r.title}</span>
      {!verified && !r.web && (
        <span className="rounded bg-warn-soft px-1 text-[0.85em] text-warn" title="The model wrote this location but no lookup returned it">
          unverified
        </span>
      )}
    </>
  )
  return r.href ? (
    <a href={r.href} target="_blank" rel="noreferrer" className={cls} title={r.subtitle}>
      {body}
    </a>
  ) : (
    <span className={cls} title={r.subtitle}>
      {body}
    </span>
  )
}
