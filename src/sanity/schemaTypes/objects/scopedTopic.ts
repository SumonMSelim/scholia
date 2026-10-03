import {defineField, defineType} from 'sanity'

// Exam scope entry: a topic with a weight. Mock-exam question distribution follows these weights.
export const scopedTopic = defineType({
  name: 'scopedTopic',
  type: 'object',
  fields: [
    defineField({name: 'topic', type: 'reference', to: [{type: 'topic'}], validation: (r) => r.required()}),
    defineField({
      name: 'weight',
      type: 'number',
      description: '1 (minor) to 5 (central)',
      validation: (r) => r.required().min(1).max(5).integer(),
    }),
    defineField({name: 'notes', type: 'string', description: 'e.g. "no recursion proofs"'}),
  ],
  preview: {
    select: {title: 'topic.title', weight: 'weight'},
    prepare: ({title, weight}) => ({title: `${title} (weight ${weight})`}),
  },
})
