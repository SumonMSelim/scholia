'use client'

// No React state: the icon follows the data-theme attribute through the `dark:` variant.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }
  return (
    <button type="button" onClick={toggle} aria-label="Toggle colour theme" className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-muted hover:text-fg">
      <span className="dark:hidden">☾</span>
      <span className="hidden dark:inline">☀</span>
    </button>
  )
}
