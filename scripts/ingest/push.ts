import {readFile} from 'node:fs/promises'
import {writeClient} from './lib/sanity'

async function main() {
  const docs: {_id: string; _type: string}[] = JSON.parse(await readFile('data/work/documents.json', 'utf8'))
  const client = writeClient()
  // One transaction: references are validated per transaction, so every target already exists.
  let tx = client.transaction()
  for (const d of docs) tx = tx.createOrReplace(d)
  const res = await tx.commit()
  console.log(`pushed ${res.results.length} documents in transaction ${res.transactionId}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
