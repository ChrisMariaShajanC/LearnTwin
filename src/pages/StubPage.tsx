import type { Page, UserProfile } from '../types'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  page: Page
}

function BackButton({ navigate, to = 'dashboard' }: { navigate: (p: Page) => void; to?: Page }) {
  return (
    <button onClick={() => navigate(to)}
      className="flex items-center gap-2 text-sm font-semibold mb-5 group transition-opacity hover:opacity-70"
      style={{ color: 'var(--muted-foreground)', fontFamily: "'Inter',sans-serif" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Back
    </button>
  )
}

function PageShell({ title, subtitle, icon, children, navigate, backTo = 'dashboard' }: {
  title: string; subtitle: string; icon: string;
  children: React.ReactNode; navigate: (p: Page) => void; backTo?: Page
}) {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-5xl mx-auto">
        <BackButton navigate={navigate} to={backTo} />
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">{icon}</div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{title}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {children}
    </div>
  )
}

// ── Subjects ──────────────────────────────────────────────────────────────────
function SubjectsPage({ navigate }: Props) {
  const subjects: { name: string; icon: string; progress: number; color: string; topics: number }[] = []
  return (
    <PageShell title="Subjects" subtitle="Your enrolled subjects and progress overview" icon="📖" navigate={navigate}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(s => (
          <Card key={s.name} className="card-lift cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: `${s.color}20`, color: s.color }}>{s.topics} topics</span>
            </div>
            <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{s.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--muted)' }}>
                <div className="h-full rounded-full progress-bar" style={{ width: `${s.progress}%`, background: s.color }} />
              </div>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.progress}%</span>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Notes ─────────────────────────────────────────────────────────────────────
function NotesPage({ navigate }: Props) {
  const notes: { title: string; subject: string; date: string; color: string; excerpt: string }[] = []
  return (
    <PageShell title="Notes" subtitle="Your personal study notes, organised by subject" icon="📝" navigate={navigate}>
      <div className="space-y-3">
        {notes.map(n => (
          <Card key={n.title} className="card-lift cursor-pointer hover:border-primary/40">
            <div className="flex items-start gap-3">
              <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: n.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{n.title}</h3>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{n.date}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                  style={{ background: `${n.color}15`, color: n.color }}>{n.subject}</span>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{n.excerpt}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Flashcards ────────────────────────────────────────────────────────────────
function FlashcardsPage({ navigate }: Props) {
  const decks: { name: string; subject: string; cards: number; mastered: number; icon: string; color: string }[] = []
  return (
    <PageShell title="Flashcards" subtitle="Spaced-repetition decks to reinforce learning" icon="🃏" navigate={navigate}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {decks.map(d => (
          <Card key={d.name} className="card-lift cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${d.color}18` }}>{d.icon}</div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{d.name}</h3>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.subject}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.mastered}/{d.cards} mastered</span>
              <span className="text-xs font-bold" style={{ color: d.color }}>{Math.round(d.mastered / d.cards * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--muted)' }}>
              <div className="h-full rounded-full" style={{ width: `${d.mastered / d.cards * 100}%`, background: d.color }} />
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Study Plan ────────────────────────────────────────────────────────────────
function StudyPlanPage({ navigate }: Props) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const schedule: Record<string, { subject: string; time: string; color: string }[]> = {}
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short' })
  return (
    <PageShell title="Study Plan" subtitle="Your personalised weekly schedule" icon="📅" navigate={navigate}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map(day => {
          const sessions = schedule[day] ?? []
          const isToday = day === today
          return (
            <div key={day} className="rounded-xl p-3 min-h-[120px]"
              style={{
                background: isToday ? 'rgba(78,205,196,.08)' : 'var(--card)',
                border: `1px solid ${isToday ? 'var(--primary)' : 'var(--border)'}`,
              }}>
              <p className="text-xs font-black mb-2" style={{
                color: isToday ? 'var(--primary)' : 'var(--muted-foreground)',
                fontFamily: "'Inter',sans-serif",
              }}>{day}</p>
              {sessions.length === 0
                ? <p className="text-[10px]" style={{ color: 'var(--border)' }}>Rest day</p>
                : sessions.map((s, i) => (
                  <div key={i} className="mb-1.5 rounded-lg px-2 py-1.5"
                    style={{ background: `${s.color}15`, borderLeft: `3px solid ${s.color}` }}>
                    <p className="text-[10px] font-bold leading-tight" style={{ color: s.color }}>{s.subject}</p>
                    <p className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{s.time}</p>
                  </div>
                ))
              }
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}

// ── Practice Questions ────────────────────────────────────────────────────────
function PracticeQuestionsPage({ navigate }: Props) {
  const questions: { q: string; subject: string; difficulty: string; icon: string; color: string }[] = []
  const diffColor: Record<string, string> = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#F43F5E' }
  return (
    <PageShell title="Practice Questions" subtitle="Targeted questions to strengthen your understanding" icon="❓" navigate={navigate} backTo="quiz">
      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={i} className="card-lift cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="text-xl flex-shrink-0">{q.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug mb-2" style={{ color: 'var(--foreground)', fontFamily: "'Lexend',sans-serif" }}>{q.q}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${q.color}15`, color: q.color }}>{q.subject}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${diffColor[q.difficulty]}15`, color: diffColor[q.difficulty] }}>{q.difficulty}</span>
                </div>
              </div>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: 'var(--primary)' }}>
                Answer
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Twin Insights ─────────────────────────────────────────────────────────────
function TwinInsightsPage({ navigate, user }: Props) {
  const insights: { title: string; icon: string; body: string; tag: string; color: string }[] = []
  return (
    <PageShell title="Twin Insights" subtitle={`What your AI Learning Twin has learned about ${user.name}`} icon="🤖" navigate={navigate} backTo="adapted">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map(ins => (
          <Card key={ins.title}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{ins.icon}</span>
              <div className="min-w-0">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-1 inline-block"
                  style={{ background: `${ins.color}18`, color: ins.color }}>{ins.tag}</span>
                <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{ins.title}</h3>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', fontFamily: "'Lexend',sans-serif" }}>{ins.body}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Subject Performance ───────────────────────────────────────────────────────
function SubjectPerfPage({ navigate }: Props) {
  const subjects: { name: string; score: number; change: number; color: string; icon: string }[] = []
  return (
    <PageShell title="Subject Performance" subtitle="How you're performing across all subjects" icon="📊" navigate={navigate} backTo="progress">
      <div className="space-y-3">
        {subjects.map(s => (
          <Card key={s.name} className="flex items-center gap-4">
            <span className="text-2xl flex-shrink-0">{s.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{s.name}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold" style={{ color: s.change >= 0 ? '#10B981' : '#F43F5E' }}>
                    {s.change >= 0 ? '↑' : '↓'}{Math.abs(s.change)}%
                  </span>
                  <span className="text-sm font-black" style={{ color: s.color }}>{s.score}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--muted)' }}>
                <div className="h-full rounded-full transition-all duration-1000 progress-bar"
                  style={{ width: `${s.score}%`, background: s.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Topic Mastery ─────────────────────────────────────────────────────────────
function TopicMasteryPage({ navigate }: Props) {
  const topics: { name: string; subject: string; mastery: string; pct: number; color: string }[] = []
  return (
    <PageShell title="Topic Mastery" subtitle="Granular view of topic-level understanding" icon="🎯" navigate={navigate} backTo="progress">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map(t => (
          <Card key={t.name} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.color}18` }}>
              <span className="text-sm font-black" style={{ color: t.color }}>{t.pct}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)', fontFamily: "'Inter',sans-serif" }}>{t.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{t.subject}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${t.color}15`, color: t.color }}>{t.mastery}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function StubPage(props: Props) {
  switch (props.page) {
    case 'subjects':          return <SubjectsPage {...props} />
    case 'notes':             return <NotesPage {...props} />
    case 'flashcards':        return <FlashcardsPage {...props} />
    case 'studyplan':         return <StudyPlanPage {...props} />
    case 'practicequestions': return <PracticeQuestionsPage {...props} />
    case 'twininsights':      return <TwinInsightsPage {...props} />
    case 'subjectperf':       return <SubjectPerfPage {...props} />
    case 'topicmastery':      return <TopicMasteryPage {...props} />
    default:                  return null
  }
}
