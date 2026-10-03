import {readFile} from 'node:fs/promises'
import {pdfPages} from './lib/pdf'

async function main() {
  const book: string[] = JSON.parse(await readFile('data/work/book-pages.json', 'utf8'))
  for (const i of [22, 23, 38, 39]) {
    const lines = book[i].split('\n')
    console.log(`idx ${i} first: ${lines[0].slice(0, 50)} | last: ${lines[lines.length - 1].slice(-40)}`)
  }
  const secs = book.flatMap((p, i) =>
    p.split('\n').filter((l) => /^\d{1,2}\.\d{1,2} [A-Z]/.test(l.trim()) && l.length < 60).map((l) => `${i}: ${l.trim()}`),
  )
  console.log('sections found', secs.length, '\n' + secs.slice(0, 25).join('\n'))
  for (const f of ['ps0/MIT6_0001F16_ProblemSet0', 'ps1', 'ps2/MIT6_0001F16_Pset2', 'ps3/MIT6_0001F16_ProblemSet3', 'ps4/MIT6_0001F16_Pset4', 'ps5/MIT6_0001F16_ps5']) {
    const pages = await pdfPages(`data/raw/psets/${f}.pdf`)
    const all = pages.join('\n')
    const parts = all.match(/^(Part|Problem) [A-Z0-9]+[:.]? [^\n]{0,60}/gm) ?? []
    console.log(`\n== ${f}: ${pages.length} pages, ${all.split(/\s+/).length} words\n${pages[0].split('\n').slice(0, 9).join(' / ').slice(0, 500)}\nparts: ${[...new Set(parts)].slice(0, 8).join(' || ')}`)
  }
}
main()
