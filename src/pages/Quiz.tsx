import { useEffect, useRef, useState } from 'react'
import type { Page, UserProfile } from '../types'
import Mascot from '../components/Mascot'
import { createId, readLocal, writeLocal } from '../lib/localData'
import { api } from '../lib/api'
import type { StudySession } from './StudyPlanner'
import type { UploadedFile } from './ScanLearn'
import { buildContent } from './LearningPack'

interface Props { navigate: (p: Page) => void; user: UserProfile; setUser?: (u: UserProfile) => void; uploadedFile?: UploadedFile | null }

const safeQuestions: { topic: string; q: string; opts: string[]; correct: number; exp: string; alt: string }[] = []

type State = 'answering' | 'correct' | 'incorrect' | 'finished'

/* Simple confetti burst */
function Confetti({ active }: { active: boolean }) {
  const pieces = useRef<{ x: number; y: number; color: string; delay: number; size: number }[]>([])

  if (active && pieces.current.length === 0) {
    const colors = ['#4ECDC4', '#FF6B6B', '#A78BFA', '#F59E0B', '#10B981', '#38BDF8']
    pieces.current = Array.from({ length: 28 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 40,
      color: colors[i % colors.length],
      delay: Math.random() * .5,
      size: 8 + Math.random() * 8,
    }))
  }
  if (!active) { pieces.current = []; return null }

  return (
    <>
      {pieces.current.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            borderRadius: Math.random() > .5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  )
}

export default function Quiz({ navigate, user, setUser, uploadedFile }: Props) {
  const activeFile = uploadedFile || readLocal<UploadedFile | null>('lt-active-upload', null)
  const c = buildContent(activeFile, user)
  const generatedQuestions: { topic: string; q: string; opts: string[]; correct: number; exp: string; alt: string }[] = c.quizQ
    .filter((item) => item.type !== 'short')
    .map((item) => {
      const options = item.type === 'tf' ? ['True', 'False'] : (item.options || [])
      const correctIndex = item.type === 'tf'
        ? (item.answer === 'True' ? 0 : 1)
        : Math.max(0, options.indexOf(item.answer))
      return {
        topic: c.topic,
        q: item.q,
        opts: options.length ? options : ['True', 'False'],
        correct: correctIndex,
        exp: `${item.answer} is correct. Review ${c.topic}: ${c.sourceText ? c.sourceText.slice(0, 120) : c.keyConcepts.join(', ')}.`,
        alt: `The answer follows from the reviewed material: ${item.answer}.`,
      }
    })

  const safeQuestions = generatedQuestions.length
    ? generatedQuestions
    : [{
        topic: c.topic,
        q: `Which statement best matches ${c.topic}?`,
        opts: [c.keyConcepts[0] || c.topic, 'None of the above', 'Cannot be determined', 'Unrelated concept'],
        correct: 0,
        exp: `This concept comes from ${c.fname}.`,
        alt: 'Use the uploaded notes to confirm the concept.',
      }]

  const [qi, setQi]       = useState(0)
  const [sel, setSel]     = useState<number | null>(null)
  const [state, setState] = useState<State>('answering')
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [answers, setAnswers] = useState<{ question: string; topic: string; selected: string; correct: boolean }[]>([])
  const [showAlternative, setShowAlternative] = useState(false)
  const [revisionAdded, setRevisionAdded] = useState(false)
  const [saved, setSaved] = useState(false)

  const q = safeQuestions[qi]

  const answer = (idx: number) => {
    if (state !== 'answering') return
    setSel(idx)
    setAnswers(current => [...current, { question: q.q, topic: q.topic, selected: q.opts[idx], correct: idx === q.correct }])
    if (idx === q.correct) {
      setState('correct')
      setScore(s => s + 1)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1100)
    } else {
      setState('incorrect')
      setWrong(c => c + 1)
    }
  }

  const next = () => {
    if (qi < safeQuestions.length - 1) {
      setQi(i => i + 1)
      setSel(null)
      setState('answering')
      setShowAlternative(false)
    } else {
      setState('finished')
    }
  }

  const pct = Math.round((score / safeQuestions.length) * 100)
  const great = pct >= 80

  useEffect(() => {
    if (state !== 'finished' || saved) return
    const attempts = readLocal<Record<string, unknown>[]>('lt-quiz-attempts', [])
    writeLocal('lt-quiz-attempts', [{
      id: createId('attempt'),
      subject: c.subject || activeFile?.subject || 'General',
      chapter: activeFile?.chapter || c.topic,
      score,
      total: safeQuestions.length,
      answers,
      completedAt: new Date().toISOString(),
    }, ...attempts])

    if (setUser) {
      const pct = Math.round((score / Math.max(1, safeQuestions.length)) * 100)
      const nextUnderstanding = Math.round(((user.understanding || 0) * 0.6) + (pct * 0.4))
      const nextConfidence = Math.max(0, Math.min(100, (user.aiConfidence || 0) + (pct >= 75 ? 5 : -2)))
      const missed = answers.filter((answer) => !answer.correct).length
      const nextPattern = { ...user.learningPattern }
      if (missed > 0) {
        nextPattern.text = Math.min(100, (nextPattern.text || 0) + 3)
        nextPattern.examples = Math.min(100, (nextPattern.examples || 0) + 2)
      } else {
        nextPattern.stepByStep = Math.min(100, (nextPattern.stepByStep || 0) + 2)
      }
      setUser({
        ...user,
        understanding: nextUnderstanding,
        aiConfidence: nextConfidence,
        learningPattern: nextPattern,
      })
    }

    const resultPayload = {
      id: createId('quiz'),
      userId: 'default-user',
      subjectId: c.subject || activeFile?.subject || 'General',
      chapter: activeFile?.chapter || c.topic,
      score,
      totalQuestions: safeQuestions.length,
      answers,
    }
    api.createQuizResult(resultPayload).catch(() => {})
    api.createProgress({
      userId: 'default-user',
      subjectId: c.subject || activeFile?.subject || 'General',
      chapter: activeFile?.chapter || c.topic,
      score: pct,
      completed: true,
    }).catch(() => {})

    setSaved(true)
  }, [state, saved])

  const addRevisionSession = () => {
    const sessions = readLocal<StudySession[]>('lt-study-sessions', [])
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const missed = answers.filter(answer => !answer.correct).map(answer => answer.topic)
    const session: StudySession = {
      id: createId('revision'),
      subject: c.subject || activeFile?.subject || 'General',
      topic: missed[0] || c.topic,
      date: tomorrow.toISOString().slice(0, 10),
      start: '16:00',
      minutes: 30,
      difficulty: 'difficult',
      status: 'planned',
      reason: `Prioritized because ${wrong} answered question${wrong === 1 ? '' : 's'} showed a gap in this quiz.`,
    }
    writeLocal('lt-study-sessions', [session, ...sessions])
    setRevisionAdded(true)
  }

  /* Finished screen */
  if (state === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-display" style={{ background: 'var(--background)' }}>
        <Confetti active={great} />
        <div className="max-w-md w-full text-center animate-pop">
          <Mascot size="lg" mood={great ? 'celebrating' : 'happy'} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--foreground)' }}>
            {great ? '🎉 Amazing job!' : '💙 Well done!'}
          </h1>
          <p className="font-body mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {great ? `You really understand ${c.topic} — brilliant work!` : "You're making great progress! Let's review the tricky parts."}
          </p>

          {/* Score ring */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--muted)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={great ? 'var(--primary)' : '#F59E0B'}
                strokeWidth="2.5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: great ? 'var(--primary)' : '#F59E0B' }}>{score}/{safeQuestions.length}</span>
              <span className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{pct}% correct</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-5 flex-wrap">
            {great && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold border" style={{ background: 'rgba(245,158,11,.1)', color: '#F59E0B', borderColor: 'rgba(245,158,11,.3)' }}>
                🏆 Quiz Master
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold border" style={{ background: 'rgba(78,205,196,.1)', color: 'var(--primary)', borderColor: 'rgba(78,205,196,.3)' }}>
              🌱 Biology Explorer
            </div>
          </div>

          {wrong > 0 && (
            <div className="rounded-2xl p-4 mb-5 text-left border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <p className="text-sm font-body" style={{ color: 'var(--foreground)' }}>
                <strong>Evidence-based recommendation:</strong> {wrong} answer{wrong > 1 ? 's were' : ' was'} incorrect in this attempt. Review {answers.filter(answer => !answer.correct).map(answer => answer.topic).join(', ')} before the next quiz.
              </p>
              <button onClick={addRevisionSession} disabled={revisionAdded} className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', opacity: revisionAdded ? .65 : 1 }}>
                {revisionAdded ? 'Revision session added' : 'Add revision to timetable'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('progress')} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press">
              See My Progress 🌟
            </button>
            <button
              onClick={() => { setQi(0); setSel(null); setState('answering'); setScore(0); setWrong(0); setAnswers([]); setSaved(false); setRevisionAdded(false); setShowAlternative(false) }}
              className="w-full py-3 rounded-2xl font-bold border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>
      <Confetti active={confetti} />

      <div className="max-w-xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('lesson')}
            className="w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {safeQuestions.map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{ background: i < qi ? '#10B981' : i === qi ? 'var(--primary)' : 'var(--muted)' }}
              />
            ))}
          </div>
          <span className="text-sm font-bold font-body" style={{ color: 'var(--muted-foreground)' }}>{qi + 1} / {safeQuestions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-7" style={{ background: 'var(--muted)' }}>
          <div className="progress-bar h-full" style={{ width: `${(qi / safeQuestions.length) * 100}%` }} />
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold mb-5 border"
          style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)' }}
        >
          🎯 Quick Challenge · Biology
        </div>

        {/* Question */}
        <div key={qi} className="animate-pop">
          <h2 className="text-2xl md:text-3xl font-black leading-snug mb-8" style={{ color: 'var(--foreground)' }}>
            {q.q}
          </h2>

          {/* Answer cards */}
          <div className="space-y-3 mb-6">
            {q.opts.map((opt, i) => {
              const isCorrect = i === q.correct
              const isSelected = i === sel
              let bg = 'var(--card)', border = 'var(--border)', color = 'var(--foreground)'

              if (sel !== null) {
                if (isCorrect) { bg = 'rgba(16,185,129,.1)'; border = '#10B981'; color = '#10B981' }
                else if (isSelected) { bg = 'rgba(255,107,107,.1)'; border = '#FF6B6B'; color = '#FF6B6B' }
                else { bg = 'var(--muted)'; border = 'var(--muted)'; color = 'var(--muted-foreground)' }
              }

              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={state !== 'answering'}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold text-base transition-all font-body ${state === 'answering' ? 'btn-press hover:border-primary' : ''}`}
                  style={{ background: bg, borderColor: border, color }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{
                        borderColor: sel !== null && isCorrect ? '#10B981' : sel === i && !isCorrect ? '#FF6B6B' : 'currentColor',
                        background: sel !== null && isCorrect ? '#10B981' : sel === i && !isCorrect ? '#FF6B6B' : 'transparent',
                        color: sel !== null && (isCorrect || isSelected) ? 'white' : 'currentColor',
                      }}
                    >
                      {sel !== null && isCorrect ? '✓' : sel === i && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {state === 'correct' && (
            <div className="animate-pop rounded-2xl p-5 mb-5 border" style={{ background: 'rgba(16,185,129,.08)', borderColor: 'rgba(16,185,129,.3)' }}>
              <div className="flex items-start gap-3">
                <Mascot size="sm" mood="celebrating" className="flex-shrink-0" animated={false} />
                <div>
                  <p className="font-black text-lg mb-1 font-display" style={{ color: 'var(--foreground)' }}>🎉 Awesome! You got it!</p>
                  <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{q.exp}</p>
                  <button onClick={() => setShowAlternative(!showAlternative)} className="mt-3 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                    {showAlternative ? 'Hide alternative explanation' : 'Show a different explanation'}
                  </button>
                  {showAlternative && (
                    <div className="mt-3 rounded-xl p-3 text-sm" style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
                      {q.alt}
                      <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Follow-up: Which clue in this explanation points to “{q.opts[q.correct]}”?
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {state === 'incorrect' && (
            <div className="animate-pop rounded-2xl p-5 mb-5 border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <Mascot size="sm" mood="thinking" className="flex-shrink-0" animated={false} />
                <div>
                  <p className="font-black text-lg mb-1 font-display" style={{ color: 'var(--foreground)' }}>💙 Almost! Let's understand it together.</p>
                  <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{q.exp}</p>
                </div>
              </div>
            </div>
          )}

          {state !== 'answering' && (
            <button
              onClick={next}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl btn-press animate-pop"
            >
              {qi < safeQuestions.length - 1 ? 'Next Question →' : 'See My Results 🌟'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
