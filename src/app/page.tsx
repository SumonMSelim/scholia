import {Scholia} from '@/components/Scholia'
import {getCourses, getSourceMap} from '@/lib/sanity/queries'

export const dynamic = 'force-dynamic'

export default async function Home({searchParams}: PageProps<'/'>) {
  const {course} = await searchParams
  const courses = await getCourses()
  const selected = courses.find((c) => c._id === course) ?? courses[0]
  const sources = selected ? await getSourceMap(selected._id) : null
  return <Scholia courses={courses} course={selected ?? null} sources={sources} />
}
