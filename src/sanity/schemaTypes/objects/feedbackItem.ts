import {defineField, defineType} from 'sanity'

export const feedbackItem = defineType({
  name: 'feedbackItem',
  type: 'object',
  fields: [
    defineField({
      name: 'criterionKey',
      title: 'Rubric criterion key',
      type: 'string',
      description: '_key of the rubricCriterion in the related assignment',
      validation: (r) => r.required(),
    }),
    defineField({name: 'pointsAwarded', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({
      name: 'severity',
      type: 'string',
      options: {list: ['strength', 'minor', 'major']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'comment', type: 'text', rows: 3, validation: (r) => r.required()}),
  ],
  preview: {
    select: {sev: 'severity', comment: 'comment', pts: 'pointsAwarded'},
    prepare: ({sev, comment, pts}) => ({title: `[${sev}] ${pts} pts: ${(comment ?? '').slice(0, 70)}`}),
  },
})
