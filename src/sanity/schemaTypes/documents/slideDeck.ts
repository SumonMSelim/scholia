import {defineField, defineType} from 'sanity'

export const slideDeck = defineType({
  name: 'slideDeck',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'lecture', type: 'reference', to: [{type: 'lecture'}]}),
    defineField({name: 'slides', type: 'array', of: [{type: 'slide'}]}),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'lecture.title'}},
})
