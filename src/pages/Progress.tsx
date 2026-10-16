import type { Page, UserProfile } from '../types'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
}

const subjects: { name: string; emoji: string; progress: number; color: string; topics: number; done: number }[] = []

const achievements: { icon: string; name: string; desc: string; earned: boolean; color: string }[] = []

const weekData: { day: string; minutes: number; color: string }[] = []

export default function Progress({ navigate, user }: Props) {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 font-display">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-goldenrod/10 text-goldenrod rounded-full px-4 py-1.5 text-sm font-bold mb-3 border border-goldenrod/20">
            🌟 My Learning Journey
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            You're doing great, {user.name}!
          </h1>
          <p className="text-muted-foreground font-body mt-1">Keep it up — every lesson makes you smarter.</p>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏆', value: `${user.streak}`, unit: 'days', label: 'Learning streak', color: 'text-goldenrod' },
            { icon: '⭐', value: `${user.understanding}%`, unit: '', label: 'Understanding', color: 'text-primary' },
            { icon: '📚', value: `${user.lessonsCompleted}`, unit: '', label: 'Lessons done', color: 'text-lavender' },
            { icon: '⏱️', value: '0', unit: 'min', label: 'This week', color: 'text-coral' },

          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm card-hover text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-black ${stat.color}`}>
                {stat.value}<span className="text-sm font-semibold ml-0.5">{stat.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground font-body mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Weekly activity chart */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-foreground text-lg">This week's activity</h3>
            <span className="text-sm text-muted-foreground font-body">0 min total</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex items-end" style={{ height: '72px' }}>
                  <div
                    className={`w-full rounded-t-xl transition-all ${d.minutes > 0 ? 'bg-primary' : 'bg-muted'}`}
                    style={{ height: d.minutes > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-body">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <h3 className="font-black text-foreground text-lg mb-4">Subjects</h3>
          <div className="space-y-4">
            {subjects.map((sub) => (
              <div key={sub.name} className="bg-card rounded-2xl border border-border p-4 shadow-sm card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                    {sub.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-foreground">{sub.name}</span>
                      <span className="font-black text-foreground">{sub.progress}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      {sub.done} of {sub.topics} topics completed
                    </div>
                  </div>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${sub.color} transition-all duration-1000`}
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="font-black text-foreground text-lg mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.name}
                className={`bg-card rounded-2xl border p-4 text-center transition-all ${
                  ach.earned
                    ? 'border-goldenrod/40 shadow-sm card-hover'
                    : 'border-border opacity-50'
                }`}
              >
                <div className={`text-3xl mb-2 ${!ach.earned && 'grayscale'}`}>{ach.icon}</div>
                <p className="font-black text-foreground text-sm mb-1 font-display">{ach.name}</p>
                <p className="text-xs text-muted-foreground font-body leading-snug">{ach.desc}</p>
                {ach.earned && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-goldenrod/10 text-goldenrod rounded-full px-2 py-0.5 text-xs font-bold">
                    ✓ Earned
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-lavender/20 flex items-center justify-center text-xl flex-shrink-0">🧠</div>
            <div>
              <p className="font-black text-foreground font-display mb-1">AI Insight</p>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                "You understand concepts <strong className="text-foreground">47% better</strong> when examples are included. Your Physics score jumped from 72% to 91% after we added more visual examples!"
              </p>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('reports')}
            className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press"
          >
            📋 View Full Report
          </button>
          <button
            onClick={() => navigate('radar')}
            className="flex-1 py-4 bg-card border-2 border-border text-foreground rounded-2xl font-black text-lg hover:border-primary transition-all"
          >
            🔎 Difficulty Radar
          </button>
        </div>
      </div>
    </div>
  )
}
