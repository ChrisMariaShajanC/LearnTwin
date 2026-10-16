import { useState } from 'react'
import type { Page, UserProfile } from '../types'
import BackButton from '../components/BackButton'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
}

const topics: { name: string; subject: string; score: number; status: 'easy' | 'medium' | 'hard'; emoji: string; reasons: string[] }[] = []

const statusConfig = {
  easy: { label: 'Easy', dot: 'bg-emerald', bar: 'from-emerald to-primary', badge: 'bg-emerald/10 text-emerald border-emerald/30' },
  medium: { label: 'Getting there', dot: 'bg-goldenrod', bar: 'from-goldenrod to-coral', badge: 'bg-goldenrod/10 text-goldenrod border-goldenrod/30' },
  hard: { label: 'Needs practice', dot: 'bg-accent', bar: 'from-accent to-coral', badge: 'bg-accent/10 text-accent border-accent/30' },
}

export default function Radar({ navigate, user }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <BackButton navigate={navigate} to="adapted" label="Learning Twin" />
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-bold mb-3 border border-accent/20">
            🔎 Difficulty Radar
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
            I noticed a few tricky parts.
          </h1>
          <p className="text-muted-foreground font-body">
            Don't worry — that's totally normal! Here's what we'll work on together.
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-5">
          {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig[keyof typeof statusConfig]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          ))}
        </div>

        {/* Topic list */}
        <div className="space-y-3 mb-6">
          {topics.map((topic) => {
            const cfg = statusConfig[topic.status]
            const isOpen = expanded === topic.name

            return (
              <div key={topic.name} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : topic.name)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4"
                >
                  <div className="text-2xl flex-shrink-0">{topic.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-foreground">{topic.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-body">{topic.subject}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                          style={{ width: `${topic.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">{topic.score}%</span>
                    </div>
                  </div>
                  <div className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </div>
                </button>

                {isOpen && topic.reasons.length > 0 && (
                  <div className="border-t border-border px-5 py-4 animate-slide-up">
                    <p className="font-bold text-foreground mb-3 text-sm font-display">🔍 Why I noticed this was tricky:</p>
                    <div className="space-y-1.5 mb-4">
                      {topic.reasons.map((r) => (
                        <div key={r} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          {r}
                        </div>
                      ))}
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3 text-sm font-body text-foreground">
                      💙 "Let's try it in a different way — I'll use more visuals and smaller steps this time."
                    </div>
                    <button
                      onClick={() => navigate('lesson')}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black text-sm btn-press shadow-md"
                    >
                      ✨ Try Adaptive Explanation
                    </button>
                  </div>
                )}

                {isOpen && topic.reasons.length === 0 && (
                  <div className="border-t border-border px-5 py-4 animate-slide-up">
                    <div className="flex items-center gap-3 text-sm font-body">
                      <span className="text-2xl">🌟</span>
                      <p className="text-foreground">You're doing really well on this topic — keep it up!</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* AI summary */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">🧠</div>
            <div>
              <p className="font-black text-foreground font-display mb-1">LearnTwin's plan</p>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                "I've updated your upcoming lessons to include more visual explanations and step-by-step breakdowns for <strong className="text-foreground">Cell Division</strong> and <strong className="text-foreground">Shakespeare vocabulary</strong>. I'll also add more practice questions on these topics."
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('lesson')}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press"
        >
          Continue Learning →
        </button>
      </div>
    </div>
  )
}
