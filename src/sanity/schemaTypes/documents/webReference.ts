import {defineField, defineType} from 'sanity'

// Saved by the agent when course material did not cover a question. Always source.kind = 'web'.
// Sits in a review queue (status) before it is treated like course material.
export const webReference = defineType({
  name: 'webReference',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'url', type: 'url', validation: (r) => r.required()}),
    defineField({name: 'domain', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'trusted', type: 'boolean', description: 'Domain was on the allowlist at fetch time', initialValue: true}),
    defineField({name: 'fetchedAt', type: 'datetime', validation: (r) => r.required()}),
    defineField({name: 'query', type: 'string', description: 'Student question that triggered the search'}),
    defineField({name: 'excerpt', type: 'text', rows: 6}),
    defineField({name: 'course', type: 'reference', to: [{type: 'course'}], validation: (r) => r.required()}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: ['pending', 'approved', 'rejected']},
      initialValue: 'pending',
      validation: (r) => r.required(),
    }),
    defineField({name: 'source', type: 'sourceInfo', validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'domain'}},
})
