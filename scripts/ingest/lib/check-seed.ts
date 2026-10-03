import type {CourseSeed} from '../courses/types'

// Catches authoring mistakes before they become dangling references in Sanity.
export function checkSeed(seed: CourseSeed): string[] {
  const problems: string[] = []
  const topics = new Set(seed.topics.map(([slug]) => slug))
  const objectives = new Set(seed.objectives.map(([code]) => code))
  const lectures = new Set(seed.lectures.map((l) => l.n))
  const topic = (slug: string, where: string) => topics.has(slug) || problems.push(`${where}: unknown topic "${slug}"`)

  for (const [code, , ts] of seed.objectives) ts.forEach((t) => topic(t, `objective ${code}`))
  for (const l of seed.lectures) l.topics.forEach((t) => topic(t, `lecture ${l.n}`))
  for (const [ch, ts] of Object.entries(seed.chapterTopics)) ts.forEach((t) => topic(t, `chapter ${ch}`))
  for (const a of seed.assignments) {
    a.topics.forEach((t) => topic(t, `assignment ${a.n}`))
    a.lectures.forEach((n) => lectures.has(n) || problems.push(`assignment ${a.n}: unknown lecture ${n}`))
    for (const r of a.rubric) r.topics.forEach((t) => topic(t, `assignment ${a.n} rubric ${r.key}`))
    const keys = a.rubric.map((r) => r.key)
    if (new Set(keys).size !== keys.length) problems.push(`assignment ${a.n}: duplicate rubric keys`)
  }
  for (const s of seed.submissions) {
    const a = seed.assignments.find((x) => x.n === s.assignment)
    if (!a) { problems.push(`submission for unknown assignment ${s.assignment}`); continue }
    for (const f of s.feedback) {
      const r = a.rubric.find((x) => x.key === f.criterionKey)
      if (!r) problems.push(`submission ps${s.assignment}: unknown criterion "${f.criterionKey}"`)
      else if (f.pointsAwarded > r.maxPoints) problems.push(`submission ps${s.assignment}: ${f.criterionKey} awards more than ${r.maxPoints}`)
    }
  }
  seed.examScope.topics.forEach(([t]) => topic(t, 'exam scope'))
  seed.examScope.objectives.forEach((code) => objectives.has(code) || problems.push(`exam scope: unknown objective ${code}`))
  return problems
}
