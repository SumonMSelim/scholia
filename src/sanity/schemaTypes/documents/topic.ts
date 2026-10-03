import {defineField, defineType} from 'sanity'

export const topic = defineType({
  name: 'topic',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'order', type: 'number'}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({
      name: 'objectives',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'learningObjective'}]}],
    }),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'course.code'}},
})
