export type WeakTopicsResult = {
  submissions: {assignment: number; title: string; grade: number; maxGrade: number}[]
  topics: {topic: string; lostPoints: number; major: number; minor: number; evidence: string[]}[]
}

export function WeakTopicsPanel({result}: {result: WeakTopicsResult}) {
  const max = Math.max(1, ...result.topics.map((t) => t.lostPoints))
  return (
    <section className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <h2 className="mb-2 font-semibold">Weak topics</h2>
      <p className="mb-3 text-xs text-zinc-500">
        Points lost per topic across {result.submissions.length} graded submissions, via feedback → rubric criterion → topic.
      </p>
      <ul className="space-y-2">
        {result.topics
          .filter((t) => t.lostPoints > 0)
          .map((t) => (
            <li key={t.topic}>
              <div className="flex justify-between">
                <span>{t.topic}</span>
                <span className="tabular-nums text-zinc-500">
                  -{t.lostPoints} pts{t.major ? ` · ${t.major} major` : ''}
                </span>
              </div>
              <div className="h-1.5 rounded bg-zinc-200 dark:bg-zinc-700">
                <div className="h-1.5 rounded bg-red-500" style={{width: `${(t.lostPoints / max) * 100}%`}} />
              </div>
            </li>
          ))}
      </ul>
    </section>
  )
}
