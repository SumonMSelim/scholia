import {sourceInfo} from './objects/sourceInfo'
import {segment} from './objects/segment'
import {slide} from './objects/slide'
import {bookSection} from './objects/bookSection'
import {rubricCriterion} from './objects/rubricCriterion'
import {feedbackItem} from './objects/feedbackItem'
import {scopedTopic} from './objects/scopedTopic'
import {course} from './documents/course'
import {topic} from './documents/topic'
import {learningObjective} from './documents/learningObjective'
import {lecture} from './documents/lecture'
import {slideDeck} from './documents/slideDeck'
import {book} from './documents/book'
import {bookChapter} from './documents/bookChapter'
import {assignment} from './documents/assignment'
import {submission} from './documents/submission'
import {examScope} from './documents/examScope'
import {webReference} from './documents/webReference'

export const schemaTypes = [
  // objects
  sourceInfo,
  segment,
  slide,
  bookSection,
  rubricCriterion,
  feedbackItem,
  scopedTopic,
  // documents
  course,
  topic,
  learningObjective,
  lecture,
  slideDeck,
  book,
  bookChapter,
  assignment,
  submission,
  examScope,
  webReference,
]
