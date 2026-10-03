import {defineField, defineType} from 'sanity'

// A timestamped slice of a lecture transcript. Citations point here: "Lecture 3, 12:40".
export const segment = defineType({
  name: 'segment',
  title: 'Transcript segment',
  type: 'object',
  fields: [
    defineField({name: 'startSec', title: 'Start (s)', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'endSec', title: 'End (s)', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'text', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({name: 'summary', type: 'string', description: 'One line, generated at ingest'}),
    defineField({name: 'topics', type: 'array', of: [{type: 'reference', to: [{type: 'topic'}]}]}),
  ],
  preview: {
    select: {start: 'startSec', text: 'text'},
    prepare: ({start, text}) => ({
      title: `${fmt(start)}  ${(text ?? '').slice(0, 80)}`,
    }),
  },
})

export function fmt(sec: number | undefined): string {
  const s = Math.max(0, Math.floor(sec ?? 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const mm = h ? String(m).padStart(2, '0') : String(m)
  return `${h ? h + ':' : ''}${mm}:${String(r).padStart(2, '0')}`
}
