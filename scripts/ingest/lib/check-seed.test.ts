import {describe, expect, it} from 'vitest'
import {checkSeed} from './check-seed'
import {seed} from '../courses/6-0001'
import type {CourseSeed} from '../courses/types'

describe('checkSeed', () => {
  it('accepts the 6.0001 seed', () => {
    expect(checkSeed(seed)).toEqual([])
  })

  it('reports unknown topics, lectures, criteria and over-awarded points', () => {
    const a = seed.assignments[1]
    const broken: CourseSeed = {
      ...seed,
      lectures: [{...seed.lectures[0], topics: ['nope']}, ...seed.lectures.slice(1)],
      assignments: [{...a, lectures: [99]}, ...seed.assignments.filter((x) => x.n !== a.n)],
      submissions: [{...seed.submissions[0], feedback: [{criterionKey: 'missing', pointsAwarded: 1, severity: 'minor', comment: ''}, {criterionKey: 'parta', pointsAwarded: 9, severity: 'minor', comment: ''}]}],
    }
    expect(checkSeed(broken)).toEqual([
      'lecture 1: unknown topic "nope"',
      'assignment 1: unknown lecture 99',
      'submission ps1: unknown criterion "missing"',
      'submission ps1: parta awards more than 3',
    ])
  })
})
