export type WeakTopicsResult = {
  submissions: {assignment: number; title: string; grade: number; maxGrade: number}[]
  topics: {topic: string; topicSlug: string; lostPoints: number; major: number; minor: number; evidence: string[]}[]
}

export function WeakTopicsPanel({result}: {result: WeakTopicsResult}) {
  const max = Math.max(1, ...result.topics.map((t) => t.lostPoints))
  return (
    <section className="rounded-xl border border-border bg-surface p-4 text-sm">
      <h2 className="mb-1 font-semibold">Weak topics</h2>
      <p className="mb-3 text-xs text-muted">
        Points lost per topic across {result.submissions.length} graded submissions: feedback → rubric criterion → topic.
      </p>
      <ul className="space-y-2">
        {result.topics
          .filter((t) => t.lostPoints > 0)
          .map((t) => (
            <li key={t.topicSlug}>
              <div className="flex justify-between gap-2">
                <span>{t.topic}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  −{t.lostPoints} pts{t.major ? ` · ${t.major} major` : ''}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-surface-2">
                <div className="h-1.5 rounded bg-danger" style={{width: `${(t.lostPoints / max) * 100}%`}} />
              </div>
            </li>
          ))}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        {result.submissions.map((s) => (
          <li key={s.assignment}>
            PS{s.assignment}: {s.grade}/{s.maxGrade}
          </li>
        ))}
      </ul>
    </section>
  )
}
