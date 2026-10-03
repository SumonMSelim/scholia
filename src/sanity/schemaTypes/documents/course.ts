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
    defineField({
      name: 'contextEndpoint',
      title: 'Context MCP endpoint',
      type: 'url',
      description: "Sanity Context MCP endpoint serving this course's Knowledge Base. Empty: the app's default endpoint.",
    }),
    defineField({
      name: 'starters',
      title: 'Starter questions',
      type: 'object',
      description: 'Suggested first questions per mode, shown in the empty chat.',
      fields: ['study', 'assignment', 'improve', 'revise', 'exam'].map((mode) =>
        defineField({name: mode, type: 'array', of: [{type: 'string'}]}),
      ),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'code'}},
})
