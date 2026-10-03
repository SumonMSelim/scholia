import {defineField, defineType} from 'sanity'

export const assignment = defineType({
  name: 'assignment',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'number', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'dueDate', type: 'date'}),
    defineField({name: 'description', type: 'text', rows: 8, description: 'Full task text'}),
    defineField({name: 'rubric', type: 'array', of: [{type: 'rubricCriterion'}]}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
    defineField({name: 'relatedLectures', type: 'array', of: [{type: 'reference', to: [{type: 'lecture'}]}]}),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  orderings: [{title: 'Number', name: 'number', by: [{field: 'number', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', number: 'number'},
    prepare: ({title, number}) => ({title: `Assignment ${number}: ${title}`}),
  },
})
