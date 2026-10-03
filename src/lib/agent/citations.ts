// The agent cites with a fixed bracket syntax. These parsers turn that text into structured
// citations the UI can resolve to a lecture moment, a slide, a page, a rubric criterion or a web page.
export type Citation =
  | {kind: 'lecture'; lecture: number; sec: number; label: string}
  | {kind: 'slides'; lecture: number; slide: number; label: string}
  | {kind: 'book'; chapter: number; page: number; label: string}
  | {kind: 'assignment'; assignment: number; criterion?: string; label: string}
  | {kind: 'submission'; assignment: number; label: string}
  | {kind: 'web'; domain: string; url: string; label: string}

const RE = /\[(lecture|slides|book|assignment|submission|web)\s*:?\s*([^\]]+)\](?:\(([^)\s]+)\))?/gi

export function toSec(ts: string): number {
  const parts = ts.split(':').map(Number)
  return parts.reduce((acc, p) => acc * 60 + p, 0)
}

export function parseCitations(text: string): Citation[] {
  const out: Citation[] = []
  const seen = new Set<string>()
  for (const m of text.matchAll(RE)) {
    const label = m[0]
    const kind = m[1].toLowerCase()
    const body = m[2].trim()
    let c: Citation | null = null
    if (kind === 'lecture') {
      const mm = /^(\d+)\s*@\s*(\d{1,2}:\d{2}(?::\d{2})?)/.exec(body)
      if (mm) c = {kind, lecture: Number(mm[1]), sec: toSec(mm[2]), label}
    } else if (kind === 'slides') {
      const mm = /^(\d+)\s*#\s*(\d+)/.exec(body)
      if (mm) c = {kind, lecture: Number(mm[1]), slide: Number(mm[2]), label}
    } else if (kind === 'book') {
      const mm = /ch\.?\s*(\d+)\s*,?\s*p\.?\s*(\d+)/i.exec(body)
      if (mm) c = {kind, chapter: Number(mm[1]), page: Number(mm[2]), label}
    } else if (kind === 'assignment') {
      const mm = /^(\d+)(?:\s*:\s*([\w-]+))?/.exec(body)
      if (mm) c = {kind, assignment: Number(mm[1]), criterion: mm[2], label}
    } else if (kind === 'submission') {
      const mm = /ps\s*(\d+)/i.exec(body)
      if (mm) c = {kind, assignment: Number(mm[1]), label}
    } else if (kind === 'web') {
      const url = m[3] ?? ''
      try {
        c = {kind, domain: new URL(url).hostname, url, label}
      } catch {
        c = null
      }
    }
    if (c && !seen.has(label)) {
      seen.add(label)
      out.push(c)
    }
  }
  return out
}

export const fmtSec = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${h ? `${h}:` : ''}${h ? String(m).padStart(2, '0') : m}:${String(s).padStart(2, '0')}`
}
