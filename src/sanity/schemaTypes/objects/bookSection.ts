import {defineField, defineType} from 'sanity'

// A section of a chapter with a page range. Citations point here: "Think Python, ch. 5, p. 42".
export const bookSection = defineType({
  name: 'bookSection',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'pageStart', type: 'number', validation: (r) => r.required().min(1)}),
    defineField({name: 'pageEnd', type: 'number', validation: (r) => r.required().min(1)}),
    defineField({name: 'text', type: 'text', rows: 6}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
  ],
  preview: {
    select: {title: 'title', a: 'pageStart', b: 'pageEnd'},
    prepare: ({title, a, b}) => ({title: `${title} (pp. ${a}-${b})`}),
  },
})
