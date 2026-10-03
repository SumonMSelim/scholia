// Step 2 acceptance checks against the live dataset.
import {writeClient} from './lib/sanity'

async function main() {
  const c = writeClient()
  const q = async (label: string, groq: string) => console.log(`\n# ${label}\n`, JSON.stringify(await c.fetch(groq), null, 1).slice(0, 900))
  await q('counts by type', `{ "total": count(*[!(_id in path("drafts.**"))]), "byType": *[!(_id in path("drafts.**"))]{_type} | order(_type) }.byType[]._type`)
  await q('segment with timestamp + topic', `*[_type=="lecture" && number==6][0]{ title, "seg": segments[10]{startSec, endSec, text, "topics": topics[]->title} }`)
  await q('slide with number', `*[_type=="slideDeck" && lecture->number==4][0]{ title, "slide": slides[4]{number, title, "topics": topics[]->title} }`)
  await q('book section with pages', `*[_type=="bookChapter" && number==11][0]{ title, pageStart, pageEnd, "section": sections[2]{title, pageStart, pageEnd}, "topics": topics[]->title }`)
  await q('feedback -> rubric criterion -> topics', `*[_type=="submission" && assignment->number==3][0]{ grade, "weak": feedback[severity=="major"]{ criterionKey, comment, "criterion": ^.assignment->rubric[_key==^.criterionKey][0]{title, "topics": topics[]->title} } }`)
  await q('exam scope weights', `*[_type=="examScope"][0]{ title, "topics": topics[weight>=5]{weight, "topic": topic->title} }`)
}
main().catch((e) => { console.error(e); process.exit(1) })
