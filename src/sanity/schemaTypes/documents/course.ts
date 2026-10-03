import {defineField, defineType} from 'sanity'

export const course = defineType({
  name: 'course',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'code', type: 'string', description: 'e.g. 6.0001', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'code'}, validation: (r) => r.required()}),
    defineField({name: 'institution', type: 'string'}),
    defineField({name: 'term', type: 'string', description: 'e.g. Fall 2016'}),
    defineField({name: 'description', type: 'text', rows: 4}),
    defineField({name: 'source', type: 'sourceInfo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'code'}},
})
