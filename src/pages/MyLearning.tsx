import type { Page, UserProfile } from '../types'
import type { UploadedFile } from './ScanLearn'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  uploadedFile: UploadedFile | null
  uploads?: UploadedFile[]
}

const DEMO_PACKS: { name: string; subject: string; topic: string; date: string; progress: number; icon: string; color: string; bg: string }[] = []

export default function MyLearning({ navigate, user, uploadedFile, uploads }: Props) {
  const baseUploads = uploads && uploads.length ? uploads : (uploadedFile ? [uploadedFile] : [])
  const packs = baseUploads.map((file, index) => ({
    name: file.name,
    subject: file.subject,
    topic: file.topic,
    date: file.createdAt ? new Date(file.createdAt).toLocaleDateString() : (index === 0 ? 'Today' : ''),
    progress: 30,
    icon: '📄',
    color: '#4ECDC4',
    bg: 'rgba(78,205,196,.08)',
  }))

  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border" style={{ background: 'rgba(78,205,196,.1)', color: 'var(--primary)', borderColor: 'rgba(78,205,196,.2)' }}>
            📚 My Learning
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>My Learning Packs</h1>
          <p className="font-body text-sm" style={{ color: 'var(--muted-foreground)' }}>
            All your uploaded materials — ready to continue anytime
          </p>
        </div>

        {/* Upload new CTA */}
        <button
          onClick={() => navigate('scan')}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed mb-6 transition-all hover:border-primary"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(78,205,196,.1)' }}>📤</div>
          <div className="text-left">
            <p className="font-black font-display" style={{ color: 'var(--foreground)' }}>Upload new material</p>
            <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>PDF · DOCX · PPTX · Images · TXT</p>
          </div>
          <span className="ml-auto text-2xl" style={{ color: 'var(--primary)' }}>+</span>
        </button>

        {/* Pack list */}
        <div className="space-y-3">
          {packs.map((p, i) => (
            <button
              key={i}
              onClick={() => navigate('pack')}
              className="w-full rounded-2xl border p-4 flex items-center gap-4 card-lift text-left"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: p.bg }}>
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: p.bg, color: p.color }}>{p.subject}</span>
                  <span className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{p.date}</span>
                </div>
                <p className="font-black font-display truncate" style={{ color: 'var(--foreground)' }}>{p.topic}</p>
                <p className="text-xs font-body truncate mb-2" style={{ color: 'var(--muted-foreground)' }}>{p.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: p.color }}>{p.progress}%</span>
                </div>
              </div>
              <div style={{ color: 'var(--muted-foreground)' }}>›</div>
            </button>
          ))}
        </div>

        {/* Empty state if needed */}
        {packs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <p className="font-black text-xl mb-2" style={{ color: 'var(--foreground)' }}>Your learning space is waiting</p>
            <p className="text-sm font-body mb-6" style={{ color: 'var(--muted-foreground)' }}>Upload your first study material to get started</p>
            <button onClick={() => navigate('scan')} className="px-6 py-3 rounded-xl font-bold text-sm btn-press" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Upload Study Material →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
