import {describe, expect, it} from 'vitest'
import {stem} from './tools'

describe('stem', () => {
  it('strips common suffixes so prefix match reaches word families', () => {
    expect(stem('aliasing')).toBe('alias')
    expect(stem('aliases')).toBe('alias')
    expect(stem('cloning')).toBe('clon')
    expect(stem('lists')).toBe('list')
    expect(stem('recursion')).toBe('recursion')
    expect(stem('bisect_search1')).toBe('bisect_search1')
  })
  it('leaves short words alone', () => {
    expect(stem('sets')).toBe('sets')
    expect(stem('dict')).toBe('dict')
  })
})
