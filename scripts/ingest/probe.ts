import {readFile, writeFile} from 'node:fs/promises'
import {dropPreamble, parseVtt, windowCues} from './lib/vtt'
import {pdfPages} from './lib/pdf'

async function main() {
  const vtt = await readFile('data/raw/lectures/lec4.vtt', 'utf8')
  const w = dropPreamble(windowCues(parseVtt(vtt)))
  console.log('lec4 windows', w.length, 'first:', JSON.stringify(w[0]).slice(0, 300))

  const slides = await pdfPages('data/raw/slides/lec4.pdf')
  console.log('lec4 slides pages', slides.length)
  console.log('slide 3:', JSON.stringify(slides[2]).slice(0, 400))

  const book = await pdfPages('data/raw/book/thinkpython2.pdf')
  console.log('book pages', book.length)
  await writeFile('data/work/book-pages.json', JSON.stringify(book, null, 1))
  const chapterStarts = book
    .map((p, i) => ({i, head: p.split('\n').slice(0, 3).join(' | ')}))
    .filter((x) => /^Chapter \d+/.test(x.head))
  console.log('chapter starts:', chapterStarts.map((c) => `${c.i}: ${c.head.slice(0, 60)}`).join('\n'))

  const ps = await pdfPages('data/raw/psets/ps2/MIT6_0001F16_Pset2.pdf')
  console.log('ps2 pages', ps.length, 'p1:', JSON.stringify(ps[0]).slice(0, 500))

}

main()
