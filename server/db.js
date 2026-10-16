import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'learntwin.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT,
    education_level TEXT,
    stream TEXT,
    education TEXT,
    selected_subjects TEXT,
    role TEXT DEFAULT 'student',
    avatar TEXT,
    accessibility TEXT,
    learning_pattern TEXT,
    ai_confidence INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    understanding INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    filename TEXT,
    topic TEXT,
    subject_id TEXT,
    chapter TEXT,
    content TEXT,
    file_type TEXT,
    file_size INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS custom_subjects (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    icon TEXT,
    color TEXT,
    chapters TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    subject_id TEXT,
    chapter TEXT,
    lesson_id TEXT,
    score INTEGER,
    completed INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    subject_id TEXT,
    chapter TEXT,
    score INTEGER,
    total_questions INTEGER,
    answers TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

export default db
