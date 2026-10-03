import {defineField, defineType} from 'sanity'

// The student's own work and the grader's feedback. Fictional in the demo dataset.
export const submission = defineType({
  name: 'submission',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'assignment', type: 'reference', to: [{type: 'assignment'}], validation: (r) => r.required()}),
    defineField({name: 'submittedAt', type: 'datetime'}),
    defineField({name: 'grade', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'maxGrade', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'content', type: 'text', rows: 10, description: 'What was handed in'}),
    defineField({name: 'overallComment', type: 'text', rows: 3}),
    defineField({name: 'feedback', type: 'array', of: [{type: 'feedbackItem'}]}),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  preview: {
    select: {title: 'title', grade: 'grade', max: 'maxGrade'},
    prepare: ({title, grade, max}) => ({title, subtitle: `${grade}/${max}`}),
  },
})
