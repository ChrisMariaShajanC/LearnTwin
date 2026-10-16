import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import db from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const generateId = (prefix) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

// ── User Routes ──

app.get('/api/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(parseUser(user))
})

app.post('/api/user', (req, res) => {
  const user = req.body
  const id = user.id || generateId('user')
  db.prepare(`
    INSERT INTO users (id, name, grade, education_level, stream, education, selected_subjects, role, avatar, accessibility, learning_pattern, ai_confidence, streak, lessons_completed, understanding, xp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, user.name, user.grade, user.educationLevel, user.stream || null,
    JSON.stringify(user.education || {}),
    JSON.stringify(user.selectedSubjects || []),
    user.role || 'student', user.avatar || null,
    JSON.stringify(user.accessibility || {}),
    JSON.stringify(user.learningPattern || {}),
    user.aiConfidence || 0, user.streak || 0, user.lessonsCompleted || 0,
    user.understanding || 0, user.xp || 0
  )
  res.json({ id, ...user })
})

app.put('/api/user/:id', (req, res) => {
  const user = req.body
  db.prepare(`
    UPDATE users SET name=?, grade=?, education_level=?, stream=?, education=?, selected_subjects=?, role=?, avatar=?, accessibility=?, learning_pattern=?, ai_confidence=?, streak=?, lessons_completed=?, understanding=?, xp=?, updated_at=datetime('now')
    WHERE id = ?
  `).run(
    user.name, user.grade, user.educationLevel, user.stream || null,
    JSON.stringify(user.education || {}),
    JSON.stringify(user.selectedSubjects || []),
    user.role || 'student', user.avatar || null,
    JSON.stringify(user.accessibility || {}),
    JSON.stringify(user.learningPattern || {}),
    user.aiConfidence || 0, user.streak || 0, user.lessonsCompleted || 0,
    user.understanding || 0, user.xp || 0, req.params.id
  )
  res.json({ id: req.params.id, ...user })
})

// ── Upload Routes ──

app.get('/api/uploads', (req, res) => {
  const userId = req.query.userId
  const uploads = userId
    ? db.prepare('SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC').all(userId)
    : db.prepare('SELECT * FROM uploads ORDER BY created_at DESC').all()
  res.json(uploads.map(parseUpload))
})

app.post('/api/uploads', (req, res) => {
  const upload = req.body
  const id = upload.id || generateId('upload')
  db.prepare(`
    INSERT INTO uploads (id, user_id, filename, topic, subject_id, chapter, content, file_type, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, upload.userId || null, upload.filename || null, upload.topic || null,
    upload.subjectId || null, upload.chapter || null, upload.content || null,
    upload.fileType || null, upload.fileSize || 0
  )
  res.json({ id, ...upload })
})

app.delete('/api/uploads/:id', (req, res) => {
  db.prepare('DELETE FROM uploads WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── Custom Subjects Routes ──

app.get('/api/custom-subjects', (req, res) => {
  const userId = req.query.userId
  const subjects = userId
    ? db.prepare('SELECT * FROM custom_subjects WHERE user_id = ?').all(userId)
    : db.prepare('SELECT * FROM custom_subjects').all()
  res.json(subjects.map(parseCustomSubject))
})

app.post('/api/custom-subjects', (req, res) => {
  const subject = req.body
  const id = subject.id || generateId('subject')
  db.prepare(`
    INSERT INTO custom_subjects (id, user_id, name, icon, color, chapters)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, subject.userId || null, subject.name, subject.icon, subject.color, JSON.stringify(subject.chapters || []))
  res.json({ id, ...subject })
})

app.delete('/api/custom-subjects/:id', (req, res) => {
  db.prepare('DELETE FROM custom_subjects WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ── Progress Routes ──

app.get('/api/progress', (req, res) => {
  const userId = req.query.userId
  const progress = userId
    ? db.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY created_at DESC').all(userId)
    : db.prepare('SELECT * FROM progress ORDER BY created_at DESC').all()
  res.json(progress)
})

app.post('/api/progress', (req, res) => {
  const entry = req.body
  const id = entry.id || generateId('progress')
  db.prepare(`
    INSERT INTO progress (id, user_id, subject_id, chapter, lesson_id, score, completed, time_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, entry.userId || null, entry.subjectId || null, entry.chapter || null,
    entry.lessonId || null, entry.score || 0, entry.completed ? 1 : 0, entry.timeSpent || 0
  )
  res.json({ id, ...entry })
})

// ── Quiz Results Routes ──

app.get('/api/quiz-results', (req, res) => {
  const userId = req.query.userId
  const results = userId
    ? db.prepare('SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC').all(userId)
    : db.prepare('SELECT * FROM quiz_results ORDER BY created_at DESC').all()
  res.json(results.map(r => ({ ...r, answers: JSON.parse(r.answers || '[]') })))
})

app.post('/api/quiz-results', (req, res) => {
  const result = req.body
  const id = result.id || generateId('quiz')
  db.prepare(`
    INSERT INTO quiz_results (id, user_id, subject_id, chapter, score, total_questions, answers)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, result.userId || null, result.subjectId || null, result.chapter || null,
    result.score || 0, result.totalQuestions || 0, JSON.stringify(result.answers || [])
  )
  res.json({ id, ...result })
})

// ── Stats Route ──

app.get('/api/stats/:userId', (req, res) => {
  const userId = req.params.userId
  const progress = db.prepare('SELECT COUNT(*) as count, AVG(score) as avgScore FROM progress WHERE user_id = ? AND completed = 1').get(userId)
  const quizAvg = db.prepare('SELECT AVG(score * 1.0 / total_questions) as avgQuiz FROM quiz_results WHERE user_id = ?').get(userId)
  const uploads = db.prepare('SELECT COUNT(*) as count FROM uploads WHERE user_id = ?').get(userId)
  res.json({
    lessonsCompleted: progress?.count || 0,
    averageScore: Math.round(progress?.avgScore || 0),
    averageQuizScore: Math.round((quizAvg?.avgQuiz || 0) * 100),
    totalUploads: uploads?.count || 0
  })
})

// ── Helper functions ──

function parseUser(row) {
  if (!row) return null
  return {
    ...row,
    education: JSON.parse(row.education || '{}'),
    selectedSubjects: JSON.parse(row.selected_subjects || '[]'),
    accessibility: JSON.parse(row.accessibility || '{}'),
    learningPattern: JSON.parse(row.learning_pattern || '{}')
  }
}

function parseUpload(row) {
  if (!row) return null
  return { ...row }
}

function parseCustomSubject(row) {
  if (!row) return null
  return { ...row, chapters: JSON.parse(row.chapters || '[]') }
}

// ============================================================
// Document extraction/analysis (real content, no invented facts)
// ============================================================

app.post('/api/extract', (req, res) => {
  try {
    const { filename, content } = req.body || {}
    const safeName = filename || 'document.txt'
    const extension = path.extname(safeName).toLowerCase()
    if (!content) return res.status(400).json({ error: 'Missing file content' })

    const base64 = String(content).replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    const tempPath = path.join(os.tmpdir(), `learntwin-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension || '.txt'}`)
    fs.writeFileSync(tempPath, buffer)

    const child = spawn('python', [path.join(__dirname, 'extract.py'), tempPath], { timeout: 90000 })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk.toString() })
    child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    child.on('close', (code) => {
      try { fs.unlinkSync(tempPath) } catch {}
      if (code !== 0) {
        return res.status(500).json({ error: stderr || 'Extraction failed' })
      }
      try {
        const parsed = JSON.parse(stdout.trim())
        if (parsed.error) return res.status(422).json({ error: parsed.error })
        return res.json(parsed)
      } catch {
        return res.status(500).json({ error: 'Invalid extractor output' })
      }
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

app.post('/api/analyze-document', (req, res) => {
  const { text, filename } = req.body || {}
  const source = String(text || '').trim()
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean)
  const words = source.match(/\b[A-Za-z][A-Za-z-]{3,}\b/g) || []
  const stop = new Set(['this', 'that', 'these', 'those', 'with', 'from', 'have', 'will', 'your', 'about', 'there', 'their', 'which', 'where', 'when', 'what', 'they', 'them', 'then', 'than', 'because', 'into', 'over', 'under', 'also', 'some', 'more', 'most', 'other', 'only', 'very', 'just', 'like', 'such', 'using', 'used'])
  const counts = {}
  for (const word of words) {
    const key = word.toLowerCase()
    if (stop.has(key)) continue
    counts[key] = (counts[key] || 0) + 1
  }
  const concepts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))

  const summary = sentences.slice(0, 4).join(' ') || source.slice(0, 500)
  const difficulty = source.length > 3000 || concepts.length > 6 ? 'Challenging' : source.length > 1200 ? 'Moderate' : 'Easy'

  res.json({
    filename: filename || null,
    summary,
    sentences,
    concepts,
    vocabulary: concepts.slice(0, 5),
    difficulty,
    wordCount: words.length,
    sentenceCount: sentences.length,
  })
})

app.listen(PORT, () => {
  console.log(`LearnTwin server running on http://localhost:${PORT}`)
})
