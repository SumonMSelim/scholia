import {readClient} from './client'

export type CourseSummary = {_id: string; title: string; code: string; institution?: string; term?: string}
export type SourceMap = {
  lectures: {number: number; title: string; videoUrl?: string}[]
  slidesUrl?: string
  bookUrl?: string
  bookTitle?: string
  assignments: {number: number; title: string; url?: string; rubric: {key: string; title: string}[]}[]
}

export const getCourses = () =>
  readClient.fetch<CourseSummary[]>(`*[_type=="course"] | order(code) {_id, title, code, institution, term}`)

export const getSourceMap = (courseId: string) =>
  readClient.fetch<SourceMap>(
    `{
      "lectures": *[_type=="lecture" && course._ref==$id] | order(number) {number, title, videoUrl},
      "slidesUrl": *[_type=="slideDeck" && course._ref==$id][0].source.url,
      "bookUrl": *[_type=="book" && course._ref==$id][0].source.url,
      "bookTitle": *[_type=="book" && course._ref==$id][0].title,
      "assignments": *[_type=="assignment" && course._ref==$id] | order(number) {number, title, "url": source.url, "rubric": rubric[]{"key": _key, title}}
    }`,
    {id: courseId},
  )
