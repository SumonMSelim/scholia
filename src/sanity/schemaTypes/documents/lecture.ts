import {defineField, defineType} from 'sanity'

export const lecture = defineType({
  name: 'lecture',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'number', type: 'number', validation: (r) => r.required().min(1)}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'durationSec', title: 'Duration (s)', type: 'number'}),
    defineField({name: 'videoUrl', type: 'url'}),
    defineField({name: 'summary', type: 'text', rows: 3}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
    defineField({name: 'segments', type: 'array', of: [{type: 'segment'}]}),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  orderings: [{title: 'Number', name: 'number', by: [{field: 'number', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', number: 'number'},
    prepare: ({title, number}) => ({title: `Lecture ${number}: ${title}`}),
  },
})
