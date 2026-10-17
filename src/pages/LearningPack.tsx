import { useEffect, useState } from 'react'
import type { Page, UserProfile } from '../types'
import type { UploadedFile } from './ScanLearn'
import BackButton from '../components/BackButton'
import ListenButton from '../components/preferences/ListenButton'
import { createId, readLocal, writeLocal } from '../lib/localData'
import { api } from '../lib/api'

interface Props {
  navigate: (p: Page) => void
  user: UserProfile
  uploadedFile: UploadedFile | null
  initialTab?: Tab
}

type Tab = 'lesson' | 'notes' | 'quiz' | 'flashcards' | 'videos' | 'audio' | 'ask' | 'examples' | 'practice'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'lesson',     icon: '📖', label: 'Lesson'     },
  { id: 'notes',      icon: '📝', label: 'Notes'      },
  { id: 'quiz',       icon: '❓', label: 'Quiz'       },
  { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
  { id: 'videos',     icon: '🎥', label: 'Videos'     },
  { id: 'audio',      icon: '🔊', label: 'Audio'      },
  { id: 'ask',        icon: '💬', label: 'Ask Twin'   },
  { id: 'examples',  icon: '💡', label: 'Examples'   },
  { id: 'practice',  icon: '🎯', label: 'Practice'   },
]

const VIDEO_IMAGES = [
  'photo-1581090464777-f3220bbe1b8b',
  'photo-1516321497487-e288fb19713f',
  'photo-1546410531-bb4caa6b424d',
]

interface QuizQ {
  type: 'mcq' | 'tf' | 'short'
  q: string
  options?: string[]
  answer: string
}

export function buildContent(file: UploadedFile | null, user: UserProfile) {
  const aiPack: any = file?.aiPack || null
  const topic: string   = aiPack?.topic || file?.topic || 'Your Topic'
  const subject: string = aiPack?.subject || file?.subject || 'General'
  const fname   = file?.name    || 'document.pdf'
  const concepts: string[] = Array.isArray(aiPack?.keyConcepts) && aiPack.keyConcepts.length ? aiPack.keyConcepts : (file?.keyConcepts || [])
  const vocab: string[]    = Array.isArray(aiPack?.vocabulary) && aiPack.vocabulary.length ? aiPack.vocabulary : (file?.vocab || [])
  const sourceText = file?.extractedText?.trim() || ''
  const sourceSentences = sourceText.split(/(?<=[.!?])\s+/).filter(Boolean)

  const fallbackConcepts = concepts.length ? concepts : [topic]
  const validSentences = sourceSentences.filter((sentence) => sentence.split(/\s+/).length >= 6)

  const lesson = aiPack?.lesson
    ? String(aiPack.lesson)
    : sourceText
      ? `
**Reviewed source summary**

${sourceSentences.slice(0, 4).join(' ')}

**Key ideas**

${fallbackConcepts.map((concept: any, index: any) => {
  const match = sourceSentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase()))
  return `**${index + 1}. ${concept}**\n${match || `This idea is identified from ${fname}.`}`
}).join('\n\n')}

This Learning Pack uses only the text you reviewed in ${fname}.
`.trim()
      : `
**What is ${topic}?**

${topic} is one of the most important concepts in ${subject}. Let's break it down step by step so it's easy to understand.

🌟 **The Big Idea**
Think of it this way: ${fallbackConcepts[0] || 'the main concept'} and ${fallbackConcepts[1] || 'related ideas'} work together to make something meaningful happen.

${fallbackConcepts.map((concept: any, i: any) => `**Step ${i + 1}:** ${concept}\nThis is a key idea identified for ${topic}.`).join('\n\n')}

💡 **Why does this matter?**
Understanding ${topic} helps you use the ideas in ${fname}.
`.trim()

  const notes = aiPack?.notes?.length
    ? aiPack.notes.map((note: any, i: any) => ({
        emoji: note.emoji || ['🔑', '⭐', '✅', '📌', '💎'][i % 5],
        heading: (note.heading || note.title || concepts[i] || `Key idea ${i + 1}`).replace(/[^\w\s]/g, '').trim(),
        body: note.body || note.text || sourceSentences.find((sentence) => sentence.toLowerCase().includes(String(concepts[i] || '').toLowerCase())) || 'Identified from the reviewed material.',
      }))
    : fallbackConcepts.map((concept: any, i: any) => ({
        emoji: ['🔑', '⭐', '✅', '📌', '💎'][i % 5],
        heading: concept.replace(/[^\w\s]/g, '').trim(),
        body: sourceSentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || `This term was identified in the reviewed material for ${topic}.`,
      }))

  const generatedQuiz: QuizQ[] = []
  fallbackConcepts.slice(0, 5).forEach((concept: any, index: any) => {
    const sentence = validSentences.find((item) => item.toLowerCase().includes(concept.toLowerCase()) && !generatedQuiz.some((q) => q.q.includes(item)))
    if (sentence) {
      const options = [concept, ...fallbackConcepts.filter((item) => item !== concept).slice(0, 3)]
      while (options.length < 4) options.push(`Option ${options.length + 1}`)
      generatedQuiz.push({
        type: 'mcq',
        q: `Which term best completes this idea from ${fname}? "${sentence.replace(new RegExp(concept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '____')}"`,
        options,
        answer: concept,
      })
    }
  })
  fallbackConcepts.slice(0, 3).forEach((concept) => {
    generatedQuiz.push({
      type: 'tf',
      q: `The reviewed material discusses ${concept}. True or False?`,
      answer: 'True',
    })
  })
  generatedQuiz.push({
    type: 'short',
    q: `In your own words, explain one important idea about ${topic} using the reviewed text.`,
    answer: sourceSentences[0] || `${topic} is an important idea in ${subject}.`,
  })
  const quizQ = aiPack?.quiz?.length
    ? aiPack.quiz.map((item: any) => ({
        type: item.type === 'tf' || item.type === 'short' ? item.type : 'mcq',
        q: item.q || item.question || `Question about ${topic}`,
        options: item.options || item.choices || ['True', 'False'],
        answer: item.answer || item.correctAnswer || '',
      }))
    : (generatedQuiz.length ? generatedQuiz : [{
        type: 'mcq',
        q: `Which topic is this Learning Pack about?`,
        options: [topic, 'Unrelated topic', 'No topic', 'Not stated'],
        answer: topic,
      }])

  const videos = aiPack?.videos?.length
    ? aiPack.videos.map((video: any, index: any) => ({
        title: video.title || `${topic}: ${concepts[index] || topic}`,
        desc: video.desc || video.description || sourceSentences.find((sentence) => sentence.toLowerCase().includes(String(concepts[index] || '').toLowerCase())) || `Review of ${concepts[index] || topic}.`,
        dur: video.dur || video.duration || `${2 + index}:${10 + index * 5}`,
        img: VIDEO_IMAGES[index % VIDEO_IMAGES.length],
        text: video.text || video.desc || sourceSentences.find((sentence) => sentence.toLowerCase().includes(String(concepts[index] || '').toLowerCase())) || String(concepts[index] || topic),
      }))
    : fallbackConcepts.slice(0, 3).map((concept: any, index: any) => ({
        title: `${topic}: ${concept}`,
        desc: sourceSentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || `Review of ${concept}.`,
        dur: `${2 + index}:${10 + index * 5}`,
        img: VIDEO_IMAGES[index % VIDEO_IMAGES.length],
        text: sourceSentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || concept,
      }))

  const examples = aiPack?.examples?.length
    ? aiPack.examples.map((example: any, index: any) => ({
        emoji: (typeof example === 'string' ? ['🌍', '🔬', '📱'][index % 3] : example.emoji) || ['🌍', '🔬', '📱'][index % 3],
        title: (typeof example === 'string' ? `Example ${index + 1}` : (example.title || `${(example.concept || concepts[index] || topic)} in context`)),
        body: (typeof example === 'string' ? example : (example.body || example.text || `${example.concept || concepts[index] || topic} is part of ${topic}.`)),
      }))
    : fallbackConcepts.slice(0, 3).map((concept: any, index: any) => ({
        emoji: ['🌍', '🔬', '📱'][index % 3],
        title: `${concept} in context`,
        body: sourceSentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || `${concept} is part of ${topic}.`,
      }))

  const practiceQs = aiPack?.practiceQuestions?.length
    ? aiPack.practiceQuestions.map((item: any) => String(item))
    : (aiPack?.practiceQs?.length ? aiPack.practiceQs.map((item: any) => String(item)) : [
        `Summarize ${topic} in two sentences using only the reviewed text.`,
        ...fallbackConcepts.slice(0, 4).map((concept: any) => `Explain ${concept} in your own words.`),
        `List one question you still have about ${fname}.`,
      ])

  return { lesson, notes, quizQ, videos, examples, practiceQs, topic, fname, subject, keyConcepts: fallbackConcepts, vocab: fallbackConcepts.slice(0, 5), sourceText, sourceSentences }
}

export default function LearningPack({ navigate, user, uploadedFile, initialTab = 'lesson' }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizChecked, setQuizChecked] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [cardsDone, setCardsDone] = useState<number[]>([])
  const [askMessages, setAskMessages] = useState<{role:'user'|'twin';text:string}[]>([
    { role: 'twin', text: uploadedFile?.extractedText
      ? `Hi ${user.name}. I can look up answers in the reviewed text from ${uploadedFile.name}. This is local note lookup, not a connected AI service.`
      : 'No uploaded note is active. Upload or select material before asking a grounded question.' }
  ])
  const [askInput, setAskInput] = useState('')

  const c = buildContent(uploadedFile, user)
  const USER_ID = 'default-user'

  useEffect(() => {
    if (playingVideo === null) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      return
    }
    if (!('speechSynthesis' in window)) return
    const video = c.videos[playingVideo]
    if (!video) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(video.text || video.desc || c.topic)
    utterance.rate = 0.9
    utterance.onend = () => setPlayingVideo(null)
    window.speechSynthesis.speak(utterance)
  }, [playingVideo])

  const correctCount = c.quizQ.filter((q: any, i: any) => quizAnswers[i] === q.answer).length

  const groundedReply = (question: string) => {
    if (!c.sourceText) return 'I do not have source material for this question. Upload notes first so I can cite the available text.'
    const terms = question.toLowerCase().match(/[a-z]{4,}/g) || []
    const ranked = c.sourceSentences
      .map(sentence => ({ sentence, score: terms.filter(term => sentence.toLowerCase().includes(term)).length }))
      .sort((a, b) => b.score - a.score)
    const evidence = ranked[0]?.sentence || c.sourceSentences[0]
    return `From your uploaded note: “${evidence}”\n\nSource: ${c.fname}${uploadedFile?.chapter ? ` · ${uploadedFile.chapter}` : ''}`
  }

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setAudioPlaying(false)
      return
    }
    const text = c.sourceText || c.lesson.replace(/\*\*/g, '')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.onend = () => setAudioPlaying(false)
    utterance.onerror = () => setAudioPlaying(false)
    window.speechSynthesis.speak(utterance)
    setAudioPlaying(true)
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 font-display" style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-6">
          <BackButton navigate={navigate} to="scan" label="Upload Material" />
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4 border"
            style={{ background: 'rgba(78,205,196,.1)', color: 'var(--primary)', borderColor: 'rgba(78,205,196,.2)' }}
          >
            ✨ Learning Pack
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--foreground)' }}>
            {c.topic}
          </h1>
            <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
              From <strong>{c.fname}</strong> · personalized for {user.name}
            </p>
            <div className="mt-3"><ListenButton text={c.lesson.replace(/\*\*/g, '')} lang={user.accessibility?.audioEnabled ? 'en' : 'en'} /></div>
          <p className="mt-2 text-xs rounded-lg border px-3 py-2" style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            Local prototype mode. Notes and source lookup use reviewed text; generative AI is not connected.
          </p>
        </div>

        {/* Visual learner banner */}
        {user.learningPattern.visual >= 80 && (
          <div
            className="flex items-center gap-3 rounded-2xl border p-3 mb-5 text-sm font-body"
            style={{ background: 'rgba(167,139,250,.08)', borderColor: 'rgba(167,139,250,.25)' }}
          >
            <span className="text-xl">👁</span>
            <span style={{ color: 'var(--foreground)' }}>
              We found <strong>visual explanations</strong> for you — perfect for your Learning Twin!
            </span>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition-all"
              style={
                activeTab === t.id
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
              }
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── LESSON ── */}
        {activeTab === 'lesson' && (
          <div
            className="rounded-3xl border p-6 shadow-sm animate-pop"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>Simplified Lesson</h2>
            </div>
            <div
              className="prose prose-sm max-w-none font-body leading-relaxed space-y-4 learning-text"
              style={{ color: 'var(--foreground)', fontSize: user.accessibility.fontSize === 'xl' ? '1.1rem' : user.accessibility.fontSize === 'large' ? '1rem' : '.9rem', lineHeight: user.accessibility.lineSpacing === 'loose' ? '2' : user.accessibility.lineSpacing === 'relaxed' ? '1.75' : '1.5' }}
            >
              {c.lesson.split('\n\n').map((para: any, i: any) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </div>
            <button
              onClick={() => navigate('pack')}
            >
              Open Full Lesson
            </button>

            <button
              onClick={() => navigate('visualstudio')}
              className="mt-5 px-5 py-2.5 rounded-xl font-bold text-sm btn-press"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Visualize this topic 🎨
            </button>
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'notes' && (
          <div className="space-y-3 animate-pop">
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--foreground)' }}>📝 Easy Notes</h2>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Key points from {c.fname} — made simple:
            </p>
            {c.notes.map((n: any, i: any) => (
              <div
                key={i}
                className="flex gap-3 rounded-2xl border p-4"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <span className="text-2xl flex-shrink-0">{n.emoji}</span>
                <div>
                  <p className="font-black mb-1 font-display" style={{ color: 'var(--foreground)' }}>{n.heading}</p>
                  <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QUIZ ── */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 animate-pop">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>❓ AI Quiz</h2>
              <span className="text-xs font-bold rounded-full px-3 py-1" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                {c.quizQ.length} questions
              </span>
            </div>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Based on <strong>{c.fname}</strong> — adapted to your Learning Twin:
            </p>

            {c.quizQ.map((q: any, i: any) => (
              <div
                key={i}
                className="rounded-2xl border p-5"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {i + 1}
                  </div>
                  <p className="font-bold text-sm font-body leading-relaxed flex-1" style={{ color: 'var(--foreground)' }}>
                    {q.q}
                    <span
                      className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{ background: q.type === 'mcq' ? 'rgba(78,205,196,.15)' : q.type === 'tf' ? 'rgba(167,139,250,.15)' : 'rgba(245,158,11,.15)', color: q.type === 'mcq' ? 'var(--primary)' : q.type === 'tf' ? '#A78BFA' : '#F59E0B' }}
                    >
                      {q.type === 'mcq' ? 'MCQ' : q.type === 'tf' ? 'True/False' : 'Short'}
                    </span>
                  </p>
                </div>

                {q.type === 'mcq' && (
                  <div className="space-y-2 ml-10">
                    {q.options!.map((opt: any) => (
                      <button
                        key={opt}
                        onClick={() => !quizChecked && setQuizAnswers(a => ({ ...a, [i]: opt }))}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-body border-2 transition-all"
                        style={{
                          borderColor: quizAnswers[i] === opt ? 'var(--primary)' : 'var(--border)',
                          background: quizChecked && opt === q.answer ? 'rgba(16,185,129,.1)' : quizAnswers[i] === opt ? 'rgba(78,205,196,.08)' : 'var(--muted)',
                          color: 'var(--foreground)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'tf' && (
                  <div className="flex gap-2 ml-10">
                    {['True', 'False'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => !quizChecked && setQuizAnswers(a => ({ ...a, [i]: opt }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                        style={{
                          borderColor: quizAnswers[i] === opt ? 'var(--primary)' : 'var(--border)',
                          background: quizAnswers[i] === opt ? 'rgba(78,205,196,.1)' : 'var(--muted)',
                          color: 'var(--foreground)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'short' && (
                  <textarea
                    className="w-full ml-10 px-3 py-2.5 rounded-xl text-sm font-body border-2 resize-none"
                    style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', width: 'calc(100% - 2.5rem)', marginLeft: '2.5rem' }}
                    rows={3}
                    placeholder="Write your answer here…"
                    value={quizAnswers[i] || ''}
                    onChange={e => setQuizAnswers(a => ({ ...a, [i]: e.target.value }))}
                  />
                )}

                {quizChecked && q.type !== 'short' && (
                  <p className="ml-10 mt-2 text-xs font-body font-semibold" style={{ color: quizAnswers[i] === q.answer ? '#10B981' : '#FF6B6B' }}>
                    {quizAnswers[i] === q.answer ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
                  </p>
                )}
              </div>
            ))}

            {!quizChecked ? (
              <button
                onClick={() => {
                  setQuizChecked(true)
                  const checked = c.quizQ.filter((q: any) => q.type !== 'short').length
                  const correct = c.quizQ.filter((q: any, i: any) => q.type !== 'short' && quizAnswers[i] === q.answer).length
                  const payload = {
                    id: createId('quiz'),
                    userId: USER_ID,
                    subjectId: uploadedFile?.subjectId || c.subject,
                    chapter: uploadedFile?.chapter,
                    score: correct,
                    totalQuestions: checked,
                    answers: c.quizQ.map((q: any, i: any) => ({ question: q.q, selected: quizAnswers[i] || '', correct: quizAnswers[i] === q.answer })),
                  }
                  writeLocal('lt-quiz-attempts', [payload, ...readLocal('lt-quiz-attempts', [])])
                  api.createQuizResult(payload).catch(() => {})
                }}
                className="w-full py-4 rounded-2xl font-black text-lg btn-press shadow-lg"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Check Answers ✅
              </button>
            ) : (
              <div
                className="rounded-2xl border p-5 text-center animate-pop"
                style={{ background: 'rgba(16,185,129,.08)', borderColor: 'rgba(16,185,129,.3)' }}
              >
                <div className="text-4xl mb-2">{correctCount >= 3 ? '🎉' : '📚'}</div>
                <p className="font-black text-xl font-display mb-1" style={{ color: 'var(--foreground)' }}>
                  {correctCount} / {c.quizQ.filter((q: any) => q.type !== 'short').length} correct!
                </p>
                <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                  {correctCount >= 3 ? "Amazing job, you're getting it!" : 'Keep going — every question makes you smarter!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VIDEOS ── */}
        {activeTab === 'videos' && (
          <div className="space-y-4 animate-pop">
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--foreground)' }}>🎥 Video Classes</h2>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Recommended for {c.topic} — matched to your learning style:
            </p>

            {/* Video player modal */}
            {playingVideo !== null && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}
              >
                <div
                  className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-3">▶</div>
                      <p className="font-bold">{c.videos[playingVideo].title}</p>
                      <p className="text-sm opacity-70 mt-1">{c.videos[playingVideo].dur}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-lg mb-1 font-display" style={{ color: 'var(--foreground)' }}>
                      {c.videos[playingVideo].title}
                    </h3>
                    <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
                      {c.videos[playingVideo].desc}
                    </p>
                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="w-full py-3 rounded-xl font-bold text-sm btn-press"
                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {c.videos.map((v: any, i: any) => (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden card-lift"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/${v.img}?w=600&h=180&fit=crop&auto=format`}
                    alt={v.title}
                    className="w-full h-36 object-cover"
                  />
                  <button
                    onClick={() => setPlayingVideo(i)}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,.35)' }}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform">
                      ▶
                    </div>
                  </button>
                  <div
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: 'rgba(0,0,0,.7)', color: 'white' }}
                  >
                    {v.dur}
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-black font-display mb-1" style={{ color: 'var(--foreground)' }}>{v.title}</p>
                    <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{v.desc}</p>
                  </div>
                  <button
                    onClick={() => setPlayingVideo(i)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold btn-press"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FLASHCARDS ── */}
        {activeTab === 'flashcards' && (() => {
          const cards = [
            ...c.keyConcepts.map((k, i) => ({
              q: `What is ${k.replace(/[^\w\s]/g, '').trim()}?`,
              a: `${k.replace(/[^\w\s]/g, '').trim()} is a key part of ${c.topic}. ${c.notes[i]?.body || 'It plays an important role in the process.'}`,
            })),
            ...c.vocab.map(v => ({
              q: `Define: ${v}`,
              a: `${v} — a key vocabulary term in ${c.topic}. Understanding this word helps with ${c.subject}.`,
            })),
          ]
          const card = cards[cardIndex % cards.length]
          return (
            <div className="animate-pop">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>🃏 Flashcards</h2>
                <span className="text-xs font-bold rounded-full px-3 py-1" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  {cardIndex % cards.length + 1} / {cards.length}
                </span>
              </div>

              {/* Card */}
              <button
                onClick={() => setCardFlipped(!cardFlipped)}
                className="w-full rounded-3xl border p-8 text-center mb-4 min-h-40 flex flex-col items-center justify-center transition-all card-lift shadow-sm"
                style={{
                  background: cardFlipped ? 'linear-gradient(135deg,var(--primary),#3ABDB5)' : 'var(--card)',
                  borderColor: cardFlipped ? 'var(--primary)' : 'var(--border)',
                  color: cardFlipped ? 'white' : 'var(--foreground)',
                }}
              >
                <div className="text-3xl mb-3">{cardFlipped ? '✅' : '🃏'}</div>
                <p className="font-black text-lg font-display leading-snug">
                  {cardFlipped ? card.a : card.q}
                </p>
                <p className="text-sm mt-3 opacity-70">
                  {cardFlipped ? 'Tap to see question' : 'Tap to reveal answer'}
                </p>
              </button>

              {/* Controls */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => { setCardIndex(Math.max(0, cardIndex - 1)); setCardFlipped(false) }}
                  disabled={cardIndex === 0}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border btn-press disabled:opacity-40"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm btn-press"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  Flip
                </button>
                <button
                  onClick={() => {
                    setCardsDone(d => [...d, cardIndex])
                    setCardIndex(cardIndex + 1)
                    setCardFlipped(false)
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border btn-press"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  Next →
                </button>
              </div>

              {/* Shuffle */}
              <button
                onClick={() => { setCardIndex(Math.floor(Math.random() * cards.length)); setCardFlipped(false) }}
                className="w-full py-2.5 text-sm font-bold rounded-xl border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}
              >
                🔀 Shuffle
              </button>

              {cardsDone.length > 0 && (
                <p className="text-center text-xs font-body mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  {cardsDone.length} card{cardsDone.length > 1 ? 's' : ''} reviewed ✅
                </p>
              )}
            </div>
          )
        })()}

        {/* ── ASK TWIN ── */}
        {activeTab === 'ask' && (
          <div className="flex flex-col animate-pop" style={{ height: 'calc(100vh - 280px)', minHeight: 400 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'rgba(78,205,196,.15)' }}>🧠</div>
              <div>
                <h2 className="font-black" style={{ color: 'var(--foreground)' }}>Ask Twin</h2>
                <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>About {c.topic} · Personalised for your level</p>
              </div>
            </div>

            {/* Quick prompts */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {['Explain this simply', 'Give me an example', 'Quiz me', 'Explain step by step', 'Why does this matter?'].map(p => (
                <button
                  key={p}
                  onClick={async () => {
                    const userMsg = { role: 'user' as const, text: p }
                    setAskMessages(m => [...m, userMsg])
                    setAskInput('')
                    try {
                      const history = askMessages.map((message) => ({ role: message.role === 'user' ? 'user' as const : 'assistant' as const, content: message.text }))
                      const result = await api.ai({ system: `You are LearnTwin. Answer only from this source text. If the answer is not in the source, say that clearly. Source:\\n${c.sourceText}`, messages: [...history, { role: 'user', content: p }], maxTokens: 500 })
                      setAskMessages(m => [...m, { role: 'twin' as const, text: result.text }])
                    } catch {
                      setAskMessages(m => [...m, { role: 'twin' as const, text: groundedReply(p) }])
                    }
                  }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border"
                  style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--secondary-foreground)', whiteSpace: 'nowrap' }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
              {askMessages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: m.role === 'twin' ? 'linear-gradient(135deg,var(--primary),#3ABDB5)' : 'var(--muted)',
                      color: m.role === 'twin' ? 'white' : 'var(--foreground)',
                    }}
                  >
                    {m.role === 'twin' ? '🧠' : user.name[0]}
                  </div>
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body leading-relaxed"
                    style={{
                      background: m.role === 'twin' ? 'var(--card)' : 'var(--primary)',
                      color: m.role === 'twin' ? 'var(--foreground)' : 'var(--primary-foreground)',
                      borderRadius: m.role === 'twin' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                      border: m.role === 'twin' ? '1px solid var(--border)' : 'none',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={askInput}
                onChange={e => setAskInput(e.target.value)}
                onKeyDown={async e => {
                    if (e.key === 'Enter' && askInput.trim()) {
                      const question = askInput.trim()
                      const userMsg = { role: 'user' as const, text: question }
                      setAskMessages(m => [...m, userMsg])
                      setAskInput('')
                      try {
                        const history = askMessages.map((message) => ({ role: message.role === 'user' ? 'user' as const : 'assistant' as const, content: message.text }))
                        const result = await api.ai({ system: `You are LearnTwin. Answer only from this source text. If the answer is not in the source, say that clearly. Source:\\n${c.sourceText}`, messages: [...history, { role: 'user', content: question }], maxTokens: 500 })
                        setAskMessages(m => [...m, { role: 'twin' as const, text: result.text }])
                      } catch {
                        setAskMessages(m => [...m, { role: 'twin' as const, text: groundedReply(question) }])
                      }
                    }
                }}
                placeholder={`Ask about ${c.topic}…`}
                className="flex-1 px-4 py-3 rounded-2xl border-2 text-sm font-body"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', outline: 'none' }}
              />
              <button
                  onClick={async () => {
                    if (!askInput.trim()) return
                    const question = askInput.trim()
                    const userMsg = { role: 'user' as const, text: question }
                    setAskMessages(m => [...m, userMsg])
                    setAskInput('')
                    try {
                      const result = await api.ai({ prompt: `Use only this source text:\\n${c.sourceText}\\n\\nQuestion: ${question}`, maxTokens: 400 })
                      setAskMessages(m => [...m, { role: 'twin' as const, text: result.text }])
                    } catch {
                      setAskMessages(m => [...m, { role: 'twin' as const, text: groundedReply(question) }])
                    }
                  }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center btn-press flex-shrink-0"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* ── AUDIO ── */}
        {activeTab === 'audio' && (
          <div className="space-y-4 animate-pop">
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--foreground)' }}>🔊 Audio Explanation</h2>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Listen to {c.topic} explained in a clear, friendly voice:
            </p>
            <div
              className="rounded-3xl border p-6 text-center"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="text-6xl mb-4">{audioPlaying ? '⏸' : '🎵'}</div>
              <p className="font-black text-xl font-display mb-1" style={{ color: 'var(--foreground)' }}>
                {c.topic} — Audio Lesson
              </p>
              <p className="text-sm font-body mb-6" style={{ color: 'var(--muted-foreground)' }}>
                {user.accessibility.audioEnabled ? 'Audio support is enabled for your profile' : 'Tap to listen'}
              </p>

              {/* Audio waveform visual */}
              <div className="flex items-end justify-center gap-1 h-12 mb-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-full transition-all"
                    style={{
                      height: audioPlaying ? `${20 + Math.abs(Math.sin(i * 0.8)) * 30}px` : '8px',
                      background: 'var(--primary)',
                      opacity: audioPlaying ? 1 : 0.4,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={toggleAudio}
                className="px-8 py-3.5 rounded-2xl font-black text-lg btn-press shadow-lg"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {audioPlaying ? 'Pause reading' : 'Read reviewed text aloud'}
              </button>

              {audioPlaying && (
                <p className="text-xs font-body mt-4 animate-pulse" style={{ color: 'var(--muted-foreground)' }}>
                  Browser text-to-speech is reading the reviewed source text.
                </p>
              )}
            </div>

            <div className="space-y-2">
              {['Introduction', 'Key concepts', 'Summary & review'].map((section, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-2xl border"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <span className="text-xl">🎧</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm font-display" style={{ color: 'var(--foreground)' }}>{section}</p>
                    <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>{[2, 4, 3][i]}:{['14', '38', '02'][i]} min</p>
                  </div>
                  <button
                    onClick={toggleAudio}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >▶</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXAMPLES ── */}
        {activeTab === 'examples' && (
          <div className="space-y-4 animate-pop">
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--foreground)' }}>💡 Real Examples</h2>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              See {c.topic} in the real world:
            </p>
            {c.examples.map((ex: any, i: any) => (
              <div
                key={i}
                className="rounded-2xl border p-5"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="text-3xl mb-3">{ex.emoji}</div>
                <h3 className="font-black mb-2 font-display" style={{ color: 'var(--foreground)' }}>{ex.title}</h3>
                <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{ex.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── PRACTICE ── */}
        {activeTab === 'practice' && (
          <div className="space-y-4 animate-pop">
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--foreground)' }}>🎯 Practice Questions</h2>
            <p className="text-sm font-body mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Try these to help remember {c.topic}:
            </p>
            {c.practiceQs.map((q: any, i: any) => (
              <div
                key={i}
                className="rounded-2xl border p-5"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: 'rgba(78,205,196,.15)', color: 'var(--primary)' }}
                  >
                    {i + 1}
                  </div>
                  <p className="font-body text-sm leading-relaxed flex-1 pt-1" style={{ color: 'var(--foreground)' }}>{q}</p>
                </div>
                <textarea
                  className="w-full mt-3 ml-11 px-3 py-2.5 rounded-xl text-sm font-body border-2 resize-none"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)', width: 'calc(100% - 2.75rem)', marginLeft: '2.75rem' }}
                  rows={2}
                  placeholder="Your answer…"
                />
              </div>
            ))}
            <button
              onClick={() => navigate('quiz')}
              className="w-full py-4 rounded-2xl font-black text-base btn-press shadow-lg"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Take Full Quiz 🎯
            </button>
            <button
              onClick={() => navigate('visualstudio')}
              className="w-full py-3 rounded-2xl font-bold text-base border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              Visualize this topic 🎨
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
