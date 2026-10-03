import {defineField, defineType} from 'sanity'

// Rubric criteria live inside the assignment. Feedback items point at them by `_key`,
// and criteria point at topics. That chain is what makes weak-topic detection possible.
export const rubricCriterion = defineType({
  name: 'rubricCriterion',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'maxPoints', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
  ],
  preview: {
    select: {title: 'title', pts: 'maxPoints'},
    prepare: ({title, pts}) => ({title: `${title} (${pts} pts)`}),
  },
})
