import {defineField, defineType} from 'sanity'

export const slide = defineType({
  name: 'slide',
  type: 'object',
  fields: [
    defineField({name: 'number', type: 'number', validation: (r) => r.required().min(1)}),
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'text', type: 'text', rows: 4}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
  ],
  preview: {
    select: {number: 'number', title: 'title', text: 'text'},
    prepare: ({number, title, text}) => ({title: `Slide ${number}: ${title ?? (text ?? '').slice(0, 60)}`}),
  },
})
