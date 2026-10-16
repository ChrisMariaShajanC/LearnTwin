import { useState } from 'react'
import type { Page, UserProfile } from '../types'
import BackButton from '../components/BackButton'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  topic?: string
}

interface Video {
  id: string
  title: string
  desc: string
  subject: string
  duration: string
  img: string
  level: string
}

const ALL_VIDEOS: Video[] = []

const SUBJECTS = ['All', 'Biology', 'Maths', 'Physics', 'English', 'Geography']

export default function Videos({ navigate, user, topic }: Props) {
  const [activeSubject, setActiveSubject] = useState('All')
  const [playing, setPlaying]             = useState<string | null>(null)
  const [search, setSearch]               = useState(topic || '')

  const filtered = ALL_VIDEOS.filter(v => {
    const matchSubj = activeSubject === 'All' || v.subject === activeSubject
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.subject.toLowerCase().includes(search.toLowerCase())
    return matchSubj && matchSearch
  })

  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>

      {/* Video player modal */}
      {playing && (() => {
        const v = ALL_VIDEOS.find(x => x.id === playing)!
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-pop" style={{ background: 'var(--card)' }}>
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <img src={`https://images.unsplash.com/${v.img}?w=640&h=360&fit=crop&auto=format`} alt={v.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="relative text-center text-white p-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl mx-auto mb-3">▶</div>
                  <p className="font-black text-lg">{v.title}</p>
                  <p className="text-sm opacity-70 mt-1">{v.subject} · {v.duration}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-lg mb-1 font-display" style={{ color: 'var(--foreground)' }}>{v.title}</h3>
                <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>{v.desc}</p>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                    ▶ Play
                  </button>
                  <button onClick={() => setPlaying(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-6">
          <BackButton navigate={navigate} to="pack" label="Learning Pack" />
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border" style={{ background: 'rgba(167,139,250,.1)', color: '#A78BFA', borderColor: 'rgba(167,139,250,.2)' }}>
            🎥 Video Learning
          </div>
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>Learn With Videos</h1>
          <p className="font-body text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {user.learningPattern.visual >= 80
              ? `We found visual video explanations for you, ${user.name} — perfect for your learning style!`
              : `Recommended videos based on your Learning Twin, ${user.name}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 text-sm font-body"
            style={{ background: 'var(--card)', borderColor: search ? 'var(--primary)' : 'var(--border)', color: 'var(--foreground)', outline: 'none' }}
          />
        </div>

        {/* Subject filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSubject(s)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={activeSubject === s
                ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Recommended banner */}
        {user.learningPattern.visual >= 80 && (
          <div className="flex items-center gap-3 rounded-2xl border p-3 mb-5 text-sm font-body" style={{ background: 'rgba(167,139,250,.06)', borderColor: 'rgba(167,139,250,.2)' }}>
            <span className="text-xl">👁</span>
            <span style={{ color: 'var(--foreground)' }}>
              <strong>Visual learner detected.</strong> These videos use diagrams and animations — matched to your Learning Twin.
            </span>
          </div>
        )}

        {/* Video grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🎥</div>
            <p className="font-black text-lg" style={{ color: 'var(--foreground)' }}>No videos found</p>
            <p className="text-sm font-body mt-1" style={{ color: 'var(--muted-foreground)' }}>Try a different search or subject</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(v => (
              <div key={v.id} className="rounded-2xl border overflow-hidden card-lift" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="relative">
                  <img src={`https://images.unsplash.com/${v.img}?w=500&h=180&fit=crop&auto=format`} alt={v.title} className="w-full h-36 object-cover" />
                  <button onClick={() => setPlaying(v.id)} className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.35)' }}>
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform">▶</div>
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(0,0,0,.7)', color: 'white' }}>{v.duration}</div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'rgba(78,205,196,.9)', color: 'white' }}>{v.subject}</div>
                </div>
                <div className="p-4">
                  <p className="font-black font-display mb-1 leading-snug" style={{ color: 'var(--foreground)' }}>{v.title}</p>
                  <p className="text-xs font-body mb-3" style={{ color: 'var(--muted-foreground)' }}>{v.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{v.level}</span>
                    <button onClick={() => setPlaying(v.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black btn-press" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                      ▶ Play
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
