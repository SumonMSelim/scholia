export type Cue = {start: number; end: number; text: string}
export type Window = {startSec: number; endSec: number; text: string}

function toSec(ts: string): number {
  const [h, m, s] = ts.trim().split(':')
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

export function parseVtt(src: string): Cue[] {
  const cues: Cue[] = []
  const blocks = src.replace(/\r/g, '').split(/\n\n+/)
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean)
    const i = lines.findIndex((l) => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->')
    const text = lines
      .slice(i + 1)
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) cues.push({start: toSec(a), end: toSec(b.trim().split(' ')[0]), text})
  }
  return cues
}

// Group cues into windows of roughly `targetWords` words, cutting at sentence ends
// once the window is big enough. A lecture of 45 minutes yields ~40 windows.
export function windowCues(cues: Cue[], targetWords = 160, maxWords = 240): Window[] {
  const out: Window[] = []
  let cur: Cue[] = []
  let words = 0
  const flush = () => {
    if (!cur.length) return
    out.push({startSec: cur[0].start, endSec: cur[cur.length - 1].end, text: cur.map((c) => c.text).join(' ')})
    cur = []
    words = 0
  }
  for (const c of cues) {
    cur.push(c)
    words += c.text.split(/\s+/).length
    const sentenceEnd = /[.?!]["')]?$/.test(c.text)
    if ((words >= targetWords && sentenceEnd) || words >= maxWords) flush()
  }
  flush()
  return out
}

// Strip the OCW license preamble that opens every lecture video.
export function dropPreamble(windows: Window[]): Window[] {
  if (!windows.length) return windows
  const first = windows[0]
  const cut = first.text.indexOf('ocw.mit.edu.')
  if (cut < 0) return windows
  const rest = first.text.slice(cut + 'ocw.mit.edu.'.length).trim()
  return rest ? [{...first, text: rest}, ...windows.slice(1)] : windows.slice(1)
}
