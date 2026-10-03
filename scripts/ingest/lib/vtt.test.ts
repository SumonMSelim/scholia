import {describe, expect, it} from 'vitest'
import {dropPreamble, parseVtt, windowCues} from './vtt'

const sample = `WEBVTT

00:00:00.790 --> 00:00:03.190
The following content is
provided under a Creative

00:00:03.190 --> 00:00:04.730
Commons license. Visit ocw.mit.edu.

00:01:00.000 --> 00:01:02.000
Hello class. Today

00:01:02.000 --> 00:01:05.500
we talk about functions.
`

describe('parseVtt', () => {
  it('parses cues with seconds and joined text', () => {
    const cues = parseVtt(sample)
    expect(cues).toHaveLength(4)
    expect(cues[2]).toEqual({start: 60, end: 62, text: 'Hello class. Today'})
    expect(cues[1].text).toBe('Commons license. Visit ocw.mit.edu.')
  })
})

describe('windowCues', () => {
  it('cuts at sentence end once target reached and keeps time span', () => {
    const cues = parseVtt(sample)
    const w = windowCues(cues, 6, 100)
    expect(w[0].startSec).toBe(0.79)
    expect(w[0].text).toMatch(/ocw\.mit\.edu\.$/)
    expect(w[w.length - 1].endSec).toBe(65.5)
  })
  it('never exceeds maxWords', () => {
    const cues = Array.from({length: 50}, (_, i) => ({start: i, end: i + 1, text: 'word word word word'}))
    for (const w of windowCues(cues, 20, 24)) expect(w.text.split(' ').length).toBeLessThanOrEqual(24)
  })
})

describe('dropPreamble', () => {
  it('removes the OCW license text from the first window', () => {
    const w = dropPreamble(windowCues(parseVtt(sample), 1000))
    expect(w[0].text.startsWith('Hello class')).toBe(true)
  })
})
