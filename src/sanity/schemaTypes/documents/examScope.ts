import {defineField, defineType} from 'sanity'

export const examScope = defineType({
  name: 'examScope',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'examDate', type: 'date'}),
    defineField({name: 'format', type: 'text', rows: 3, description: 'e.g. 90 min, closed book, 3 coding + 5 short answer'}),
    defineField({name: 'topics', type: 'array', of: [{type: 'scopedTopic'}], validation: (r) => r.required().min(1)}),
    defineField({
      name: 'objectives',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'learningObjective'}]}],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'examDate'}},
})
