// Web fallback is restricted to these domains. Anything else is never shown.
export const TRUSTED_DOMAINS = [
  'docs.python.org',
  'python.org',
  'ocw.mit.edu',
  'greenteapress.com',
  'wikipedia.org',
  'realpython.com',
  'peps.python.org',
  'khanacademy.org',
  'cs.stanford.edu',
  'web.stanford.edu',
  'cs.berkeley.edu',
  'inst.eecs.berkeley.edu',
  'mit.edu',
]

export function isTrusted(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return TRUSTED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))
  } catch {
    return false
  }
}
