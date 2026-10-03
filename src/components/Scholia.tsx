'use client'

import {useMemo, useState} from 'react'
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import ReactMarkdown, {type Components} from 'react-markdown'
import {MODES, MODE_LABELS, type Mode} from '@/lib/agent/prompts'
import {parseCitations, type Citation} from '@/lib/agent/citations'
import type {CourseSummary, SourceMap} from '@/lib/sanity/queries'
import {CitationPanel} from './CitationPanel'
import {WeakTopicsPanel, type WeakTopicsResult} from './WeakTopicsPanel'

const STARTERS: Record<Mode, string[]> = {
  study: ['Explain aliasing vs cloning with lists', 'What is bisection search and when does it apply?', 'Why does recursion need a base case?'],
  assignment: ['Help me start Problem Set 4 part A (permutations)', 'Review my approach for the Hangman helper functions'],
  improve: ['What should I improve before the final quiz?'],
  revise: ['Revision sheet for recursion', 'Revision sheet for the whole final quiz scope'],
  exam: ['Start a 3-question mock exam'],
}

type Props = {courses: CourseSummary[]; course: CourseSummary | null; sources: SourceMap | null}

export function Scholia({courses, course, sources}: Props) {
  const [mode, setMode] = useState<Mode>('study')
  const [input, setInput] = useState('')
  const transport = useMemo(() => new DefaultChatTransport({api: '/api/chat', fetch: fetchWithBodyHash}), [])
  const {messages, sendMessage, status, error, setMessages} = useChat({transport})
  const busy = status === 'submitted' || status === 'streaming'

  const citations = useMemo(() => collectCitations(messages), [messages])
  const verified = useMemo(() => collectVerifiedCites(messages), [messages])
  const weak = useMemo(() => findToolOutput<WeakTopicsResult>(messages, 'weak_topics'), [messages])

  const send = (text: string) => {
    if (!course || !text.trim() || busy) return
    sendMessage({text}, {body: {mode, courseId: course._id}})
    setInput('')
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    setMessages([])
  }

  if (!course) return <main className="p-8">No courses in the dataset yet.</main>

  return (
    <main className="mx-auto grid h-dvh max-w-7xl grid-rows-[auto_1fr] gap-4 p-4">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Scholia</h1>
        <form method="get" className="ml-auto">
          <select
            name="course"
            defaultValue={course._id}
            onChange={(e) => e.currentTarget.form?.submit()}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} {c.title}
              </option>
            ))}
          </select>
        </form>
        <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-800" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`rounded-md px-3 py-1 ${m === mode ? 'bg-white shadow dark:bg-zinc-700' : 'opacity-70 hover:opacity-100'}`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </nav>
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <section className="flex min-h-0 flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <strong>{MODE_LABELS[mode]}</strong> mode for {course.code}. Answers come from the course&apos;s own material and cite the exact lecture
                  moment, slide or page.
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS[mode].map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} message={m} guardCode={mode === 'assignment'} />
            ))}
            {error && <p className="text-sm text-red-600">Something went wrong: {error.message}</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'exam' ? 'Your answer…' : 'Ask about the course…'}
              className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <button disabled={busy || !input.trim()} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900">
              {busy ? '…' : 'Send'}
            </button>
          </form>
        </section>

        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <CitationPanel citations={citations} verified={verified} sources={sources} />
          {weak && <WeakTopicsPanel result={weak} />}
        </aside>
      </div>
    </main>
  )
}

// CloudFront origin access control for Lambda Function URLs requires the request body hash on POST.
async function fetchWithBodyHash(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init?.body && typeof init.body === 'string' && globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(init.body))
    const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
    init = {...init, headers: {...(init.headers as Record<string, string>), 'x-amz-content-sha256': hex}}
  }
  return fetch(input, init)
}

function Message({message, guardCode}: {message: UIMessage; guardCode: boolean}) {
  const isUser = message.role === 'user'
  return (
    <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${isUser ? 'ml-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
      {message.parts.map((part, i) => {
        if (part.type === 'text') return <Markdown key={i} text={part.text} guardCode={guardCode && !isUser} />
        if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
          const name = part.type === 'dynamic-tool' ? (part as {toolName: string}).toolName : part.type.slice(5)
          const state = (part as {state?: string}).state ?? ''
          return (
            <div key={i} className="my-1 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs opacity-70 dark:border-zinc-600">
              {toolLabel(name)}
              {state.includes('output') || state.includes('result') ? '' : '…'}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

function toolLabel(name: string) {
  const map: Record<string, string> = {
    initial_context: 'Reading knowledge base outline',
    knowledge_base_read: 'Reading knowledge base entries',
    lookup_source: 'Pinning exact sources',
    weak_topics: 'Analysing your feedback',
    exam_plan: 'Planning exam from scope',
    web_search: 'Searching trusted web sources',
    save_web_reference: 'Saving web reference',
  }
  return map[name] ?? name
}

// In Assignment mode, long code blocks are folded away. Scholia guides; the student writes the code.
const guardedComponents: Components = {
  pre: ({children}) => {
    const code = extractText(children)
    if (code.trim().split('\n').length <= 3) return <pre>{children}</pre>
    return (
      <details className="rounded-md border border-dashed border-zinc-400 p-2 text-xs dark:border-zinc-600">
        <summary className="cursor-pointer">Code withheld: try writing this step yourself first</summary>
        <pre className="mt-2">{children}</pre>
      </details>
    )
  },
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) return extractText((node as {props: {children?: React.ReactNode}}).props.children)
  return ''
}

function Markdown({text, guardCode}: {text: string; guardCode?: boolean}) {
  return (
    <div className="prose-sm space-y-2 [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black/80 [&_pre]:p-3 [&_pre]:text-zinc-100 [&_pre_code]:bg-transparent">
      <ReactMarkdown components={guardCode ? guardedComponents : undefined}>{text}</ReactMarkdown>
    </div>
  )
}

function collectCitations(messages: UIMessage[]): Citation[] {
  const seen = new Set<string>()
  const out: Citation[] = []
  for (const m of messages) {
    if (m.role !== 'assistant') continue
    for (const p of m.parts) {
      if (p.type !== 'text') continue
      for (const c of parseCitations(p.text)) {
        if (!seen.has(c.label)) {
          seen.add(c.label)
          out.push(c)
        }
      }
    }
  }
  return out
}

// Every cite string that a tool actually returned this conversation. Anything the model wrote that is not in
// this set is shown as unverified: the dataset did not back it.
function collectVerifiedCites(messages: UIMessage[]): Set<string> {
  const out = new Set<string>()
  const walk = (v: unknown) => {
    if (!v || typeof v !== 'object') return
    if (Array.isArray(v)) return v.forEach(walk)
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === 'cite' && typeof val === 'string') out.add(normalizeCite(val))
      else walk(val)
    }
  }
  for (const m of messages) for (const p of m.parts) walk((p as {output?: unknown}).output)
  return out
}

export const normalizeCite = (s: string) => s.replace(/\]\(.*$/, ']').replace(/\s+/g, ' ').toLowerCase()

function findToolOutput<T>(messages: UIMessage[], toolName: string): T | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    for (const p of messages[i].parts) {
      const part = p as {type: string; toolName?: string; state?: string; output?: unknown}
      const name = part.type === 'dynamic-tool' ? part.toolName : part.type.startsWith('tool-') ? part.type.slice(5) : undefined
      if (name === toolName && part.state === 'output-available' && part.output) return part.output as T
    }
  }
  return null
}
