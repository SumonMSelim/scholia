// Shape of a course seed: what course staff author by hand. Everything else (captions, slide text,
// book text, problem set text) is downloaded and parsed by download.ts and build.ts.

export type Rubric = {key: string; title: string; description: string; maxPoints: number; topics: readonly string[]}
export type Feedback = {criterionKey: string; pointsAwarded: number; severity: 'strength' | 'minor' | 'major'; comment: string}

export type CourseSeed = {
  /** Folder name under data/raw and data/work, and the course slug. */
  dir: string
  /** Prepended to every generated _id so courses never collide. Empty for the original course. */
  idPrefix: string
  ocwUrl: string
  license: string
  attribution: string
  course: {_id: string; title: string; code: string; institution: string; term: string; description: string}
  /** [slug, title, description] */
  topics: readonly (readonly [string, string, string])[]
  /** [code, statement, topic slugs] */
  objectives: readonly [string, string, readonly string[]][]
  /** `resource` is the OCW resource page slug of the lecture video; `slides` the resource slug of its slide PDF (omit when none is published). */
  lectures: readonly {n: number; title: string; topics: readonly string[]; resource: string; slides?: string}[]
  /** Slide lines matching this are page furniture (course code, lecture number) and are dropped. */
  slideFurniture: RegExp
  book: {
    _id: string; title: string; authors: string[]; edition: string; url: string; pdfUrl: string; license: string; attribution: string
    /** PDF page index minus this offset = printed page number. */
    pageOffset: number
    /** Extra page-furniture lines to drop from book text (on top of the default running-header rules). */
    runningHeader?: RegExp
  }
  chapterTopics: Readonly<Record<number, readonly string[]>>
  /** `resource` is the OCW resource page holding the pdf or zip; `file` the pdf path under psets/ after download. */
  assignments: readonly {
    n: number; title: string; resource: string; file: string; dueDate: string
    topics: readonly string[]; lectures: readonly number[]; rubric: readonly Rubric[]
  }[]
  submissions: readonly {assignment: number; submittedAt: string; grade: number; content: string; overallComment: string; feedback: readonly Feedback[]}[]
  examScope: {
    _id: string; title: string; examDate: string; format: string
    /** [topic slug, weight 1-5, notes] */
    topics: readonly (readonly [string, number, string])[]
    objectives: readonly string[]
  }
  /** Optional Sanity Context MCP endpoint serving this course's Knowledge Base. */
  contextEndpoint?: string
  /** Suggested first questions per mode, shown in the empty chat. */
  starters: {study: string[]; assignment: string[]; improve: string[]; revise: string[]; exam: string[]}
}
