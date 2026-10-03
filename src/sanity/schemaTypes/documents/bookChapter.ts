import {defineField, defineType} from 'sanity'

// One document per chapter keeps each document small while the book stays one logical source.
export const bookChapter = defineType({
  name: 'bookChapter',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'number', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'book', type: 'reference', to: [{type: 'book'}], validation: (r) => r.required()}),
    defineField({name: 'pageStart', type: 'number'}),
    defineField({name: 'pageEnd', type: 'number'}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
    defineField({name: 'sections', type: 'array', of: [{type: 'bookSection'}]}),
  ],
  orderings: [{title: 'Number', name: 'number', by: [{field: 'number', direction: 'asc'}]}],
  preview: {
    select: {number: 'number', title: 'title', book: 'book.title'},
    prepare: ({number, title, book}) => ({title: `Ch. ${number}: ${title}`, subtitle: book}),
  },
})
