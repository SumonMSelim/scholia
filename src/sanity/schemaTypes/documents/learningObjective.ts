import {defineField, defineType} from 'sanity'

export const learningObjective = defineType({
  name: 'learningObjective',
  type: 'document',
  fields: [
    defineField({name: 'code', type: 'string', description: 'e.g. LO3', validation: (r) => r.required()}),
    defineField({name: 'statement', type: 'text', rows: 2, validation: (r) => r.required()}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'code', subtitle: 'statement'}},
})
