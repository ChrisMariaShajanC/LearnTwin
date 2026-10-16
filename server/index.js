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

// Load server/.env into process.env without exposing values to the frontend.
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const equalsIndex = line.indexOf('=')
    if (equalsIndex <= 0) continue
    const key = line.slice(0, equalsIndex).trim()
    const value = line.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

async function openaiFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch (error) {
    const code = error?.cause?.code || error?.code
    if (code === 'SELF_SIGNED_CERT_IN_CHAIN' || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || String(error?.message || '').includes('self-signed')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      return fetch(url, options)
    }
    throw error
  }
}

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
    INSERT INTO users (id, name, grade, education_level, stream, education, selected_subjects, role, avatar, accessibility, learning_pattern, preferences, ai_confidence, streak, lessons_completed, understanding, xp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, user.name, user.grade, user.educationLevel, user.stream || null,
    JSON.stringify(user.education || {}),
    JSON.stringify(user.selectedSubjects || []),
    user.role || 'student', user.avatar || null,
    JSON.stringify(user.accessibility || {}),
    JSON.stringify(user.learningPattern || {}),
    JSON.stringify(user.learningPreferences || user.preferences || {}),
    user.aiConfidence || 0, user.streak || 0, user.lessonsCompleted || 0,
    user.understanding || 0, user.xp || 0
  )
  res.json({ id, ...user })
})

app.put('/api/user/:id', (req, res) => {
  const user = req.body
  db.prepare(`
    UPDATE users SET name=?, grade=?, education_level=?, stream=?, education=?, selected_subjects=?, role=?, avatar=?, accessibility=?, learning_pattern=?, preferences=?, ai_confidence=?, streak=?, lessons_completed=?, understanding=?, xp=?, updated_at=datetime('now')
    WHERE id = ?
  `).run(
    user.name, user.grade, user.educationLevel, user.stream || null,
    JSON.stringify(user.education || {}),
    JSON.stringify(user.selectedSubjects || []),
    user.role || 'student', user.avatar || null,
    JSON.stringify(user.accessibility || {}),
    JSON.stringify(user.learningPattern || {}),
    JSON.stringify(user.learningPreferences || user.preferences || {}),
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
    learningPattern: JSON.parse(row.learning_pattern || '{}'),
    learningPreferences: JSON.parse(row.preferences || '{}')
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

// ============================================================
// AI proxy (Anthropic). API key stays server-side only.
// ============================================================

function getAiConfig() {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY
  const baseUrl = (process.env.AI_BASE_URL || process.env.NVIDIA_BASE_URL || process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '')
  const model = process.env.AI_MODEL || process.env.NVIDIA_MODEL || process.env.OPENAI_MODEL || 'mistralai/mistral-7b-instruct-v0.3'
  return { apiKey, baseUrl, model }
}

app.post('/api/ai', async (req, res) => {
  const { apiKey, baseUrl, model } = getAiConfig()
  if (!apiKey) {
    return res.status(503).json({ error: 'AI_API_KEY is missing. Set AI_API_KEY (or GROQ_API_KEY/OPENAI_API_KEY) in server/.env to enable AI features.' })
  }
  const { system, prompt, messages, maxTokens } = req.body || {}
  const chatMessages = []
  if (system) chatMessages.push({ role: 'system', content: String(system) })
  if (Array.isArray(messages) && messages.length) {
    for (const message of messages) {
      if (message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string') {
        chatMessages.push({ role: message.role, content: message.content })
      }
    }
  } else if (prompt) {
    chatMessages.push({ role: 'user', content: String(prompt) })
  }
  if (!chatMessages.some((message) => message.role === 'user')) {
    return res.status(400).json({ error: 'Missing prompt or conversation messages' })
  }

  try {
    const response = await openaiFetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(Number(maxTokens) || 800, 2000),
        messages: chatMessages
      })
    })
    const raw = await response.text()
    if (!response.ok) {
      return res.status(response.status).json({ error: `AI request failed: ${raw}` })
    }
    const data = JSON.parse(raw)
    const text = data.choices?.[0]?.message?.content || ''
    res.json({ text: text || 'No AI response was returned.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================================
// AI learning-pack generation (OpenAI, server-side key only)
// ============================================================

app.post('/api/generate-pack', async (req, res) => {
  const { apiKey, baseUrl, model } = getAiConfig()
  if (!apiKey) {
    return res.status(503).json({ error: 'AI_API_KEY is missing. Set AI_API_KEY (or GROQ_API_KEY/OPENAI_API_KEY) in server/.env to enable AI features.' })
  }
  const { text, filename } = req.body || {}
  if (!String(text || '').trim()) return res.status(400).json({ error: 'Missing document text' })

  const source = String(text).slice(0, 15000)
  const system = 'You are LearnTwin, an adaptive learning assistant. Return strict JSON only. Do not invent facts beyond the supplied source text. If the source is unclear, use conservative wording based on the source.'
  const prompt = `Create a complete learning pack from this document${filename ? ` (${filename})` : ''}. Return JSON with these fields:
{
  "topic": "short topic title",
  "subject": "best subject area",
  "difficulty": "Easy|Moderate|Challenging",
  "keyConcepts": ["4 to 8 important concepts from the source"],
  "vocabulary": ["4 to 8 important terms from the source"],
  "summary": "3 to 5 sentence summary based only on the source",
  "lesson": "markdown lesson using the reviewed source content",
  "notes": [{"heading":"concept","body":"source-based note"}],
  "quiz": [{"type":"mcq|tf|short","q":"question","options":["A","B","C","D"],"answer":"correct answer","explanation":"why"}],
  "examples": [{"title":"title","body":"example grounded in source"}],
  "practiceQuestions": ["5 short practice questions"],
  "videos": [{"title":"source-based lesson title","desc":"what it covers","text":"text to read aloud"}]
}
Source text:
${source}`

  try {
    const response = await openaiFetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    })
    const raw = await response.text()
    if (!response.ok) {
      return res.status(response.status).json({ error: `AI request failed: ${raw}` })
    }
    const data = JSON.parse(raw)
    const content = data.choices?.[0]?.message?.content || ''
    let pack
    try {
      pack = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      pack = match ? JSON.parse(match[0]) : null
    }
    if (!pack) return res.status(502).json({ error: 'AI returned invalid JSON.' })
    res.json({ pack })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================================
// Diagram persistence (Visual Studio)
// ============================================================

app.get('/api/diagrams', (req, res) => {
  const userId = req.query.userId
  const rows = userId
    ? db.prepare('SELECT * FROM diagrams WHERE user_id = ? ORDER BY created_at DESC').all(userId)
    : db.prepare('SELECT * FROM diagrams ORDER BY created_at DESC').all()
  res.json(rows.map((row) => ({ ...row, spec: JSON.parse(row.spec || '{}') })))
})

app.post('/api/diagrams', (req, res) => {
  const body = req.body || {}
  const id = body.id || generateId('diagram')
  db.prepare(`
    INSERT INTO diagrams (id, user_id, topic, diagram_type, complexity, spec)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, body.userId || null, body.topic || null, body.diagramType || null, body.complexity || 'simple', JSON.stringify(body.spec || {}))
  res.json({ id, ...body })
})

app.get('/api/diagrams/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM diagrams WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Diagram not found' })
  res.json({ ...row, spec: JSON.parse(row.spec || '{}') })
})

app.listen(PORT, () => {
  console.log(`LearnTwin server running on http://localhost:${PORT}`)
})
