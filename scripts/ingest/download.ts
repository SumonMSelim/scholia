// Downloads a course's openly licensed material into data/raw/<course>/ (gitignored). Idempotent.
// Usage: npx tsx scripts/ingest/download.ts <course dir, e.g. 6-0001>
import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import {courseFromArgs} from './courses'

const OCW = 'https://ocw.mit.edu'

const page = async (url: string) => (await fetch(url)).text()
const first = (html: string, re: RegExp) => re.exec(html)?.[0]

async function fetchTo(url: string, path: string) {
  if (existsSync(path)) return
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  await writeFile(path, Buffer.from(await res.arrayBuffer()))
}

async function main() {
  const seed = await courseFromArgs()
  const raw = `data/raw/${seed.dir}`
  const coursePath = new URL(seed.ocwUrl).pathname
  const resource = (slug: string) => `${seed.ocwUrl}resources/${slug}/`
  const fileOn = (html: string, ext: string) => first(html, new RegExp(`${coursePath}[^"']*\\.${ext}`))
  for (const d of ['lectures', 'slides', 'psets', 'book']) await mkdir(`${raw}/${d}`, {recursive: true})

  const index: string[] = []
  for (const lec of seed.lectures) {
    const url = resource(lec.resource)
    const html = await page(url)
    const vtt = fileOn(html, 'vtt')
    const yt = first(html, /youtube\.com\/embed\/[A-Za-z0-9_-]+/)?.split('/').pop() ?? ''
    if (vtt) await fetchTo(OCW + vtt, `${raw}/lectures/lec${lec.n}.vtt`)
    index.push([lec.n, yt, '', url].join('\t'))
    const pdf = lec.slides ? fileOn(await page(resource(lec.slides)), 'pdf') : undefined
    if (pdf) await fetchTo(OCW + pdf, `${raw}/slides/lec${lec.n}.pdf`)
    console.log(`lecture ${lec.n}: vtt=${vtt ? 'ok' : 'MISSING'} slides=${pdf ? 'ok' : lec.slides ? 'MISSING' : 'none'} yt=${yt || 'MISSING'}`)
  }
  await writeFile(`${raw}/lectures/index.tsv`, index.join('\n') + '\n')

  for (const a of seed.assignments) {
    const html = await page(resource(a.resource))
    const pdf = fileOn(html, 'pdf')
    const zip = pdf ? undefined : fileOn(html, 'zip')
    if (pdf) await fetchTo(OCW + pdf, `${raw}/psets/ps${a.n}.pdf`)
    if (zip) {
      await fetchTo(OCW + zip, `${raw}/psets/ps${a.n}.zip`)
      execFileSync('unzip', ['-o', '-q', `${raw}/psets/ps${a.n}.zip`, '-d', `${raw}/psets/ps${a.n}`])
    }
    console.log(`assignment ${a.n}: ${pdf ? 'pdf' : zip ? 'zip' : 'MISSING'} (expects psets/${a.file}: ${existsSync(`${raw}/psets/${a.file}`) ? 'ok' : 'MISSING'})`)
  }

  await fetchTo(seed.book.pdfUrl, `${raw}/book/book.pdf`)
  console.log('book: ok')
}
main().catch((e) => { console.error(e); process.exit(1) })
