import {describe, expect, it} from 'vitest'
import {cleanText} from './pdf'

describe('cleanText', () => {
  it('maps bullet glyphs and strips control, private-use and lone surrogate characters', () => {
    const dirty = 'a b\u0000cd \ud800e\t\tf\n\n\ng'
    expect(cleanText(dirty)).toBe('a- bcd e f\ng')
  })
  it('keeps valid surrogate pairs', () => {
    expect(cleanText('ok 😀')).toBe('ok 😀')
  })
})
