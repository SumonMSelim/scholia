'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, type UIMessage} from 'ai'
import ReactMarkdown, {defaultUrlTransform, type Components} from 'react-markdown'
import {MODES, MODE_LABELS, type Mode} from '@/lib/agent/prompts'
import {parseCitations, type Citation} from '@/lib/agent/citations'
import {resolveCitation} from '@/lib/agent/resolve'
import type {CourseSummary, SourceMap} from '@/lib/sanity/queries'
import {CitationChip} from './CitationChip'
import {CitationPanel} from './CitationPanel'
import {ThemeToggle} from './ThemeToggle'
import {WeakTopicsPanel, type WeakTopicsResult} from './WeakTopicsPanel'

const STARTERS: Record<Mode, string[]> = {
  study: ['Explain aliasing vs cloning with lists', 'What is bisection search and when does it apply?', 'Why does recursion need a base case?', 'What is the complexity of bisect_search1 with list slicing?'],
  assignment: ['Help me start Problem Set 4 part A (permutations)', 'Review my approach for the Hangman helper functions'],
  improve: ['What should I improve before the final quiz?'],
  revise: ['Revision sheet for recursion', 'Revision sheet for the whole final quiz scope'],
  exam: ['Start a 3-question mock exam'],
}

const MODE_HINT: Record<Mode, string> = {
  study: 'Explanations built from the course, cited to the lecture second, slide or page.',
  assignment: 'Step-by-step help under the rubric. Scholia guides; you write the code.',
  improve: 'Weak topics from your graded feedback, with exactly what to revisit.',
  revise: 'A compact revision sheet, every point linked to its source.',
  exam: 'Questions weighted by the exam scope, one at a time, graded with citations.',
}

type Props = {courses: CourseSummary[]; course: CourseSummary | null; sources: SourceMap | null}

export function Scholia({courses, course, sources}: Props) {
  const [mode, setMode] = useState<Mode>('study')
  const [input, setInput] = useState('')
  const transport = useMemo(() => new DefaultChatTransport({api: '/api/chat', fetch: fetchWithBodyHash}), [])
  const {messages, sendMessage, status, error, setMessages} = useChat({transport})
  const busy = status === 'submitted' || status === 'streaming'
  const scrollRef = useRef<HTMLDivElement>(null)

  const citations = useMemo(() => collectCitations(messages), [messages])
  const verified = useMemo(() => collectVerifiedCites(messages), [messages])
  const weak = useMemo(() => findToolOutput<WeakTopicsResult>(messages, 'weak_topics'), [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight})
  }, [messages])

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
    <main className="mx-auto flex h-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-4">
      <header className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-accent-fg">S</span>
          <h1 className="text-lg font-semibold tracking-tight">Scholia</h1>
        </div>
        <form method="get" className="min-w-0 flex-1 sm:order-none sm:ml-2 sm:max-w-md">
          <label className="sr-only" htmlFor="course">
            Course
          </label>
          <select
            id="course"
            name="course"
            defaultValue={course._id}
            onChange={(e) => e.currentTarget.form?.submit()}
            className="w-full truncate rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} · {c.title}
              </option>
            ))}
          </select>
        </form>
        <ThemeToggle />
        <nav className="-mx-3 flex w-[calc(100%+1.5rem)] gap-1 overflow-x-auto px-3 pb-1 sm:mx-0 sm:ml-auto sm:w-auto sm:px-0 sm:pb-0" aria-label="Mode">
          <div className="flex gap-1 rounded-lg bg-surface-2 p-1 text-sm">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={m === mode}
                className={`whitespace-nowrap rounded-md px-3 py-1 transition-colors ${m === mode ? 'bg-surface shadow-sm' : 'text-muted hover:text-fg'}`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface">
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3 text-sm text-muted">
                <p>
                  <strong className="text-fg">{MODE_LABELS[mode]}.</strong> {MODE_HINT[mode]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS[mode].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-left text-fg hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} message={m} guardCode={mode === 'assignment'} sources={sources} verified={verified} />
            ))}
            {busy && messages.at(-1)?.role === 'user' && <p className="text-sm text-muted">Reading the course…</p>}
            {error && <p className="text-sm text-danger">Something went wrong: {error.message}</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'exam' ? 'Your answer…' : 'Ask about the course…'}
              aria-label="Message"
              className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={busy || !input.trim()} className="rounded-md bg-user px-4 py-2 text-sm font-medium text-user-fg disabled:opacity-40">
              {busy ? '…' : 'Send'}
            </button>
          </form>
        </section>

        <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto">
          <CitationPanel citations={citations} verified={verified} sources={sources} />
          {weak && <WeakTopicsPanel result={weak} />}
          <p className="px-1 text-xs text-muted">
            {course.institution} {course.code}, {course.term}. Content lives in a Sanity Knowledge Base; every citation resolves to a typed document.
          </p>
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

type MessageProps = {message: UIMessage; guardCode: boolean; sources: SourceMap | null; verified: Set<string>}

function Message({message, guardCode, sources, verified}: MessageProps) {
  const isUser = message.role === 'user'
  const tools = message.parts.filter((p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-'))
  return (
    <div className={`max-w-[92%] rounded-xl px-4 py-3 text-sm sm:max-w-[85%] ${isUser ? 'ml-auto bg-user text-user-fg' : 'bg-surface-2'}`}>
      {tools.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tools.map((part, i) => {
            const name = part.type === 'dynamic-tool' ? (part as {toolName: string}).toolName : part.type.slice(5)
            const state = (part as {state?: string}).state ?? ''
            const done = state.includes('output')
            return (
              <span key={i} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                {toolLabel(name)}
                {done ? '' : '…'}
              </span>
            )
          })}
        </div>
      )}
      {message.parts.map((part, i) =>
        part.type === 'text' ? (
          <Markdown key={i} text={part.text} guardCode={guardCode && !isUser} sources={sources} verified={verified} plain={isUser} />
        ) : null,
      )}
    </div>
  )
}

function toolLabel(name: string) {
  const map: Record<string, string> = {
    initial_context: 'Knowledge base outline',
    knowledge_base_search: 'Searching knowledge base',
    knowledge_base_read: 'Reading knowledge base entries',
    lookup_source: 'Pinning exact sources',
    weak_topics: 'Analysing your feedback',
    exam_plan: 'Planning exam from scope',
    web_search: 'Searching trusted web sources',
    save_web_reference: 'Saving web reference',
  }
  return map[name] ?? name
}

// Citations in the answer text become chips. Non-web citations are rewritten to `cite:` links first.
const CITE_RE = /\[(lecture|slides|book|assignment|submission)\s*:?\s*[^\]]+\](?!\()/gi

type MdProps = {text: string; guardCode: boolean; sources: SourceMap | null; verified: Set<string>; plain?: boolean}

function Markdown({text, guardCode, sources, verified, plain}: MdProps) {
  const prepared = useMemo(() => text.replace(CITE_RE, (m) => `[${m}](cite:${encodeURIComponent(m)})`), [text])
  const components = useMemo<Components>(
    () => ({
      a: ({href, children}) => {
        const label = href?.startsWith('cite:') ? decodeURIComponent(href.slice(5)) : href?.startsWith('http') ? `[web: x](${href})` : null
        const cites = label ? parseCitations(label) : []
        if (cites.length) {
          return (
            <>
              {cites.map((c) => (
                <CitationChip
                  key={c.label}
                  r={resolveCitation(c, sources)}
                  verified={c.kind === 'web' || c.kind === 'submission' || c.kind === 'assignment' || verified.has(normalizeCite(c.label))}
                  inline
                />
              ))}
            </>
          )
        }
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        )
      },
      pre: ({children}) => {
        if (!guardCode || extractText(children).trim().split('\n').length <= 3) return <pre>{children}</pre>
        return (
          <details className="rounded-md border border-dashed border-border p-2 text-xs">
            <summary className="cursor-pointer">Code withheld: try writing this step yourself first</summary>
            <div className="mt-2">
              <pre>{children}</pre>
            </div>
          </details>
        )
      },
    }),
    [guardCode, sources, verified],
  )
  if (plain) return <p className="whitespace-pre-wrap">{text}</p>
  return (
    <div className="answer">
      <ReactMarkdown components={components} urlTransform={(u) => (u.startsWith('cite:') ? u : defaultUrlTransform(u))}>
        {prepared}
      </ReactMarkdown>
    </div>
  )
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) return extractText((node as {props: {children?: React.ReactNode}}).props.children)
  return ''
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

const normalizeCite = (s: string) => s.replace(/\]\(.*$/, ']').replace(/\s+/g, ' ').toLowerCase()

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
