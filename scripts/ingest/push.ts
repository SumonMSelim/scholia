// Usage: npx tsx scripts/ingest/push.ts <course dir, e.g. 6-0001>
import {readFile} from 'node:fs/promises'
import {writeClient} from './lib/sanity'
import {courseFromArgs} from './courses'

async function main() {
  const seed = await courseFromArgs()
  const docs: {_id: string; _type: string}[] = JSON.parse(await readFile(`data/work/${seed.dir}.json`, 'utf8'))
  const client = writeClient()
  // One transaction: references are validated per transaction, so every target already exists.
  let tx = client.transaction()
  for (const d of docs) tx = tx.createOrReplace(d)
  const res = await tx.commit()
  console.log(`${seed.dir}: pushed ${res.results.length} documents in transaction ${res.transactionId}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
