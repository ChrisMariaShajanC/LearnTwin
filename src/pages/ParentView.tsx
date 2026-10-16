import type { Page, UserProfile } from '../types'
import BackButton from '../components/BackButton'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
}

export default function ParentView({ navigate, user }: Props) {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display">
      {/* Top bar – separate from child nav */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-lg">✨</div>
          <div>
            <span className="font-black text-foreground">LearnTwin</span>
            <span className="ml-2 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Parent View</span>
          </div>
        </div>
        <button
          onClick={() => navigate('dashboard')}
          className="px-3 py-1.5 text-sm font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all"
        >
          Switch to {user.name}'s View →
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <BackButton navigate={navigate} to="dashboard" label="Dashboard" />
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
            {user.name}'s Progress 👨‍👩‍👧
          </h1>
          <p className="text-muted-foreground font-body">
            Here's how {user.name} is doing — updated in real time as they learn.
          </p>
        </div>

        {/* Overall score */}
        <div
          className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #A78BFA 100%)' }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
          <div className="relative z-10 grid md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: `${user.understanding}%`, label: 'Overall understanding', icon: '⭐' },
              { value: `${user.streak} days`, label: 'Learning streak', icon: '🏆' },
              { value: `${user.lessonsCompleted}`, label: 'Lessons completed', icon: '📚' },
              { value: '162 min', label: 'This week', icon: '⏱️' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-white/70 text-xs font-body mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Insight */}
        <div className="bg-card rounded-3xl border border-border p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-lavender/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🧠</div>
            <div>
              <h2 className="font-black text-foreground mb-1">AI Learning Insight</h2>
              <p className="text-muted-foreground font-body leading-relaxed">
                "{user.name} currently shows <strong className="text-foreground">stronger comprehension</strong> with visual explanations and shorter content sections.
                Audio support has improved quiz performance by an estimated <strong className="text-foreground">12%</strong> over the past two weeks."
              </p>
            </div>
          </div>
        </div>

        {/* What helps / what needs support */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
            <h3 className="font-black text-foreground mb-4">What helps {user.name} learn best</h3>
            <div className="space-y-2">
              {[
                '✓ Visual explanations and diagrams',
                '✓ Short, focused learning sections',
                '✓ Real-life examples alongside theory',
                '✓ Audio read-aloud support',
                '✓ Step-by-step guidance',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-body text-foreground bg-emerald/5 border border-emerald/20 rounded-xl px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
            <h3 className="font-black text-foreground mb-4">Areas needing more support</h3>
            <div className="space-y-2">
              {['Dense text passages without visual aids', 'Complex vocabulary in isolation', 'Long-form written assessments'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-body text-foreground bg-goldenrod/5 border border-goldenrod/20 rounded-xl px-3 py-2">
                  <span className="text-goldenrod">⚠️</span> {item}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-muted rounded-xl p-3 text-sm font-body text-muted-foreground">
              <strong className="text-foreground">Suggested support:</strong> Present new concepts in smaller sections and reinforce with examples. LearnTwin is already doing this automatically.
            </div>
          </div>
        </div>

        {/* Subject progress */}
        <div className="bg-card rounded-3xl border border-border p-6 mb-6 shadow-sm">
          <h3 className="font-black text-foreground mb-5">Subject performance</h3>
          <div className="space-y-4">
            {[
              { name: 'Physics', emoji: '⚡', score: 91, trend: '+8%', up: true },
              { name: 'Biology', emoji: '🧬', score: 82, trend: '+5%', up: true },
              { name: 'Mathematics', emoji: '🔢', score: 71, trend: '+2%', up: true },
              { name: 'English', emoji: '📚', score: 58, trend: '-1%', up: false },
              { name: 'Geography', emoji: '🌍', score: 44, trend: '+3%', up: true },
            ].map((sub) => (
              <div key={sub.name} className="flex items-center gap-4">
                <span className="text-xl w-8 text-center">{sub.emoji}</span>
                <span className="w-24 text-sm font-bold text-foreground">{sub.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="progress-bar h-full" style={{ width: `${sub.score}%` }} />
                </div>
                <span className="text-sm font-black text-foreground w-10 text-right">{sub.score}%</span>
                <span className={`text-xs font-bold w-10 text-right ${sub.up ? 'text-emerald' : 'text-accent'}`}>
                  {sub.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility profile */}
        <div className="bg-card rounded-3xl border border-border p-6 mb-6 shadow-sm">
          <h3 className="font-black text-foreground mb-4">Accessibility Profile in use</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Font', value: 'Lexend', icon: '🔤' },
              { label: 'Text size', value: 'Large', icon: '📏' },
              { label: 'Line spacing', value: 'Relaxed', icon: '↕️' },
              { label: 'Theme', value: 'Warm light', icon: '🎨' },
              { label: 'Audio support', value: 'Enabled', icon: '🎧' },
              { label: 'High contrast', value: 'On', icon: '👁️' },
            ].map((p) => (
              <div key={p.label} className="bg-muted rounded-2xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs text-muted-foreground font-body">{p.label}</span>
                </div>
                <div className="font-bold text-foreground text-sm">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('reports')}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm btn-press shadow-lg"
          >
            📋 View Full Report
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-card border border-border text-foreground rounded-xl font-bold text-sm hover:border-primary transition-all">
            📄 Export PDF
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-card border border-border text-foreground rounded-xl font-bold text-sm hover:border-primary transition-all">
            👩‍🏫 Share with Teacher
          </button>
        </div>
      </div>
    </div>
  )
}
