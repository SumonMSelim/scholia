import {defineField, defineType} from 'sanity'

export const book = defineType({
  name: 'book',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'authors', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'edition', type: 'string'}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'edition'}},
})
