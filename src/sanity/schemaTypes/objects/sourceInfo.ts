import {defineField, defineType} from 'sanity'

// Every piece of material carries a source. `kind` is what the agent checks to
// keep course material and web results apart.
export const sourceKinds = ['lecture', 'slides', 'book', 'assignment', 'submission', 'web'] as const

export const sourceInfo = defineType({
  name: 'sourceInfo',
  title: 'Source',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      type: 'string',
      options: {list: [...sourceKinds]},
      validation: (r) => r.required(),
    }),
    defineField({name: 'url', title: 'Original URL', type: 'url'}),
    defineField({name: 'license', type: 'string', description: 'e.g. CC BY-NC-SA 4.0'}),
    defineField({name: 'attribution', type: 'string', description: 'Who to credit'}),
  ],
})
