import { useMemo, useState } from "react"
import BackButton from "../components/BackButton"
import { createId, readLocal, writeLocal } from "../lib/localData"
import type { Page, UserProfile } from "../types"

export interface Exam {
  id: string
  title: string
  subject: string
  date: string
  time: string
  syllabus: string
  hoursAvailable: number
}

export interface StudySession {
  id: string
  examId?: string
  subject: string
  topic: string
  date: string
  start: string
  minutes: number
  difficulty: "easy" | "moderate" | "difficult"
  status: "planned" | "in-progress" | "completed" | "postponed"
  reason: string
}

interface Props {
  navigate: (page: Page) => void
  user: UserProfile
  view: Page
}

function daysUntil(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export default function StudyPlanner({ navigate, user, view }: Props) {
  const [exams, setExamsState] = useState<Exam[]>(() => readLocal("lt-exams", []))
  const [sessions, setSessionsState] = useState<StudySession[]>(() => readLocal("lt-study-sessions", []))
  const [showForm, setShowForm] = useState(view === "examtimetable" && exams.length === 0)
  const [message, setMessage] = useState("")
  const [form, setForm] = useState({
    title: "",
    subject: "",
    date: "",
    time: "09:00",
    syllabus: "",
    hoursAvailable: 6,
  })

  const setExams = (next: Exam[]) => {
    setExamsState(next)
    writeLocal("lt-exams", next)
  }
  const setSessions = (next: StudySession[]) => {
    setSessionsState(next)
    writeLocal("lt-study-sessions", next)
  }

  const createExam = () => {
    if (!form.title.trim() || !form.subject.trim() || !form.date) {
      setMessage("Add an exam name, subject and date.")
      return
    }
    const exam: Exam = { ...form, id: createId("exam"), hoursAvailable: Number(form.hoursAvailable) }
    setExams([...exams, exam])
    setForm({ title: "", subject: "", date: "", time: "09:00", syllabus: "", hoursAvailable: 6 })
    setShowForm(false)
    setMessage("Exam saved. Generate a realistic study plan when you are ready.")
  }

  const generatePlan = (exam: Exam) => {
    const countdown = Math.max(1, daysUntil(exam.date))
    const topics = exam.syllabus.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
    const safeTopics = topics.length ? topics : ["Review key concepts", "Practice questions", "Final revision"]
    const totalMinutes = Math.max(60, exam.hoursAvailable * 60)
    const sessionMinutes = user.educationLevel === "kg" || user.educationLevel === "lp" || user.educationLevel === "primary" ? 20 : 40
    const sessionCount = Math.min(Math.floor(totalMinutes / sessionMinutes), Math.max(1, countdown), safeTopics.length * 2)
    const now = new Date()
    const generated: StudySession[] = Array.from({ length: sessionCount }, (_, index) => {
      const topic = safeTopics[index % safeTopics.length]
      const difficulty: StudySession["difficulty"] = index < Math.ceil(sessionCount / 2) ? "difficult" : "moderate"
      const date = addDays(now, Math.min(index + 1, Math.max(1, countdown - 1))).toISOString().slice(0, 10)
      return {
        id: createId(`session-${index}`),
        examId: exam.id,
        subject: exam.subject,
        topic,
        date,
        start: index % 2 === 0 ? "16:00" : "18:00",
        minutes: sessionMinutes,
        difficulty,
        status: "planned",
        reason: difficulty === "difficult"
          ? "Scheduled early because difficult topics benefit from more review opportunities."
          : "Placed after core topics to reinforce recall before the exam.",
      }
    })
    const withoutOld = sessions.filter((session) => session.examId !== exam.id)
    setSessions([...withoutOld, ...generated])
    setMessage(`Created ${generated.length} non-overlapping sessions with breaks between study blocks.`)
  }

  const updateStatus = (id: string, status: StudySession["status"]) => {
    setSessions(sessions.map((session) => session.id === id ? { ...session, status } : session))
  }

  const visibleSessions = useMemo(() => [...sessions].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)), [sessions])
  const title = view === "examtimetable" ? "Exam Timetable"
    : view === "dailytasks" ? "Daily Tasks"
    : view === "revisionschedule" ? "Revision Schedule"
    : view === "upcomingexams" ? "Upcoming Exams"
    : "Weekly Study Plan"

  const younger = ["kg", "lp", "primary"].includes(user.educationLevel)

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: "var(--background)" }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <BackButton navigate={navigate} to="dashboard" label="Dashboard" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>
              {younger ? "Simple checklist planner" : "Calendar-based planner"}
            </p>
            <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>{title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              Plans are stored on this device and can be edited as your schedule changes.
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="lt-btn lt-btn-primary px-5 py-2.5">
            Add exam
          </button>
        </div>

        {message && (
          <div className="rounded-xl border px-4 py-3 mb-4 text-sm" style={{ background: "rgba(78,205,196,.08)", borderColor: "rgba(78,205,196,.3)", color: "var(--foreground)" }}>
            {message}
          </div>
        )}

        {showForm && (
          <section className="lt-card p-5 mb-5 animate-fade-up">
            <h2 className="font-black mb-4" style={{ color: "var(--foreground)" }}>New exam</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["title", "Exam name", "Physics midterm"],
                ["subject", "Subject", "Physics"],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                  {label}
                  <input
                    value={String(form[key as keyof typeof form])}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal"
                    style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </label>
              ))}
              <label className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                Date
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </label>
              <label className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                Time
                <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </label>
              <label className="sm:col-span-2 text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                Chapters or topics, separated by commas
                <textarea value={form.syllabus} onChange={(event) => setForm({ ...form, syllabus: event.target.value })} placeholder="Motion, Force, Work and energy" rows={3} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal resize-none" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </label>
              <label className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                Total available study hours
                <input type="number" min="1" max="40" value={form.hoursAvailable} onChange={(event) => setForm({ ...form, hoursAvailable: Number(event.target.value) })} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-normal" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={createExam} className="lt-btn lt-btn-primary px-5 py-2.5">Save exam</button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border text-sm font-bold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>Cancel</button>
            </div>
          </section>
        )}

        {(view === "examtimetable" || view === "upcomingexams") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.length ? exams.map((exam) => {
              const countdown = daysUntil(exam.date)
              return (
                <article key={exam.id} className="lt-card p-5">
                  <div className="flex justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--primary)" }}>{exam.subject}</p>
                      <h2 className="font-black text-lg" style={{ color: "var(--foreground)" }}>{exam.title}</h2>
                    </div>
                    <div className="text-center rounded-xl px-3 py-2" style={{ background: countdown <= 7 ? "rgba(245,158,11,.1)" : "var(--muted)" }}>
                      <strong className="block text-lg" style={{ color: countdown <= 7 ? "#D97706" : "var(--foreground)" }}>{Math.max(0, countdown)}</strong>
                      <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>days</span>
                    </div>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "var(--foreground)" }}>{new Date(`${exam.date}T${exam.time}`).toLocaleString()}</p>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>{exam.syllabus || "No syllabus added"}</p>
                  <button onClick={() => generatePlan(exam)} className="w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    Generate study timetable
                  </button>
                </article>
              )
            }) : (
              <div className="md:col-span-2 lt-card p-10 text-center">
                <h2 className="font-black" style={{ color: "var(--foreground)" }}>No upcoming exams</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Add an exam to generate a study schedule.</p>
              </div>
            )}
          </div>
        )}

        {(view === "studyplan" || view === "dailytasks" || view === "revisionschedule") && (
          <div className="space-y-3">
            {visibleSessions.length ? visibleSessions.map((session) => (
              <article key={session.id} className="lt-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={() => updateStatus(session.id, session.status === "completed" ? "planned" : "completed")}
                    aria-label={session.status === "completed" ? "Mark planned" : "Mark completed"}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center font-black"
                    style={{
                      background: session.status === "completed" ? "#10B981" : "var(--muted)",
                      borderColor: session.status === "completed" ? "#10B981" : "var(--border)",
                      color: session.status === "completed" ? "white" : "var(--muted-foreground)",
                    }}
                  >
                    {session.status === "completed" ? "✓" : ""}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold" style={{ color: "var(--foreground)" }}>{session.topic}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{session.difficulty}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      {session.subject} · {new Date(`${session.date}T${session.start}`).toLocaleString()} · {session.minutes} minutes
                    </p>
                    <p className="text-xs mt-2" style={{ color: "var(--primary)" }}>{session.reason}</p>
                  </div>
                  <select value={session.status} onChange={(event) => updateStatus(session.id, event.target.value as StudySession["status"])} className="rounded-xl border px-3 py-2 text-xs font-bold" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                    <option value="planned">Planned</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
              </article>
            )) : (
              <div className="lt-card p-10 text-center">
                <h2 className="font-black" style={{ color: "var(--foreground)" }}>No study sessions yet</h2>
                <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>Add an exam, then generate a timetable.</p>
                <button onClick={() => navigate("examtimetable")} className="lt-btn lt-btn-primary px-5 py-2.5">Add an exam</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
