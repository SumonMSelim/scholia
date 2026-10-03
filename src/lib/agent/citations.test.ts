import {describe, expect, it} from 'vitest'
import {fmtSec, parseCitations, toSec} from './citations'

describe('parseCitations', () => {
  it('parses every citation kind and dedupes repeats', () => {
    const text = `Recursion needs a base case [lecture 6 @ 12:40] and [slides 6 #7]. See [book ch.5 p.44].
Rubric: [assignment 4: perms]. Your work: [submission ps4]. Outside course material: [web: docs.python.org](https://docs.python.org/3/tutorial/) [lecture 6 @ 12:40]`
    const c = parseCitations(text)
    expect(c.map((x) => x.kind)).toEqual(['lecture', 'slides', 'book', 'assignment', 'submission', 'web'])
    expect(c[0]).toMatchObject({lecture: 6, sec: 760})
    expect(c[1]).toMatchObject({lecture: 6, slide: 7})
    expect(c[2]).toMatchObject({chapter: 5, page: 44})
    expect(c[3]).toMatchObject({assignment: 4, criterion: 'perms'})
    expect(c[4]).toMatchObject({assignment: 4})
    expect(c[5]).toMatchObject({domain: 'docs.python.org'})
  })
  it('splits lists of timestamps and slide numbers into separate citations', () => {
    const c = parseCitations('[lecture 6 @ 4:53, 8:43] and [slides 6 #6, #21]')
    expect(c.map((x) => x.label)).toEqual(['[lecture 6 @ 4:53]', '[lecture 6 @ 8:43]', '[slides 6 #6]', '[slides 6 #21]'])
  })
  it('ignores malformed citations', () => {
    expect(parseCitations('[lecture six] [book p.3] [web: nourl]')).toEqual([])
  })
})

describe('time helpers', () => {
  it('round-trips', () => {
    expect(toSec('1:02:03')).toBe(3723)
    expect(fmtSec(3723)).toBe('1:02:03')
    expect(fmtSec(65)).toBe('1:05')
  })
})
