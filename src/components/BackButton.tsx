import type { Page } from '../types'

interface Props {
  navigate: (p: Page) => void
  to: Page
  label?: string
}

export default function BackButton({ navigate, to, label = 'Back' }: Props) {
  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 mb-5 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 btn-press"
      style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  )
}
