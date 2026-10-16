import { useMemo, useState } from "react"
import BackButton from "../components/BackButton"
import { suggestedSubjects, type SubjectDefinition } from "../data/curriculum"
import type { UploadedFile } from "./ScanLearn"
import type { Page, UserProfile } from "../types"

interface Props {
  navigate: (page: Page) => void
  user: UserProfile
  subjectId: string | null
  customSubjects: SubjectDefinition[]
  uploads: UploadedFile[]
  startSubjectUpload: (subjectId: string, chapter?: string) => void
}

type Tab = "overview" | "chapters" | "materials" | "practice"

export default function SubjectDetail({
  navigate,
  user,
  subjectId,
  customSubjects,
  uploads,
  startSubjectUpload,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview")
  const subjects = useMemo(() => [...suggestedSubjects(user), ...customSubjects], [user, customSubjects])
  const subject = subjects.find((item) => item.id === subjectId) || subjects[0]
  const subjectUploads = uploads.filter((item) => item.subjectId === subject?.id || item.subject === subject?.name)

  if (!subject) return null

  const progress = Math.min(92, 36 + subjectUploads.length * 12)
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "chapters", label: "Chapters" },
    { id: "materials", label: "Materials" },
    { id: "practice", label: "Practice" },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: "var(--background)" }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <BackButton navigate={navigate} to="subjects" label="My Subjects" />
        <section className="lt-card p-6 mb-5 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: subject.color }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black"
              style={{ background: `${subject.color}18`, color: subject.color }}
            >
              {subject.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: subject.color }}>Subject workspace</p>
              <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>{subject.name}</h1>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                Chapters, uploaded notes, adaptive lessons and practice in one place.
              </p>
            </div>
            <button onClick={() => startSubjectUpload(subject.id)} className="lt-btn lt-btn-primary px-5 py-3">
              Upload notes
            </button>
          </div>
          <div className="relative mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: "var(--muted-foreground)" }}>Overall progress</span>
              <strong style={{ color: subject.color }}>{progress}%</strong>
            </div>
            <div className="lt-progress"><div className="lt-progress-bar" style={{ width: `${progress}%`, background: subject.color }} /></div>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border"
              style={{
                background: tab === item.id ? "var(--primary)" : "var(--card)",
                color: tab === item.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                borderColor: tab === item.id ? "var(--primary)" : "var(--border)",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
            <div className="md:col-span-2 lt-card p-5">
              <h2 className="font-black mb-4" style={{ color: "var(--foreground)" }}>Continue learning</h2>
              <div className="space-y-3">
                {subject.chapters.slice(0, 3).map((chapter, index) => (
                  <button
                    key={chapter}
                    onClick={() => navigate("lesson")}
                    className="w-full flex items-center gap-3 rounded-xl p-3 text-left border"
                    style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${subject.color}18`, color: subject.color }}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold" style={{ color: "var(--foreground)" }}>{chapter}</span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{index === 0 ? "Continue" : "Start"}</span>
                  </button>
                ))}
              </div>
            </div>
            <aside className="lt-card p-5">
              <h2 className="font-black mb-4" style={{ color: "var(--foreground)" }}>Needs revision</h2>
              <div className="space-y-3 text-sm">
                {subject.chapters.slice(-2).map((chapter) => (
                  <div key={chapter} className="rounded-xl p-3" style={{ background: "rgba(245,158,11,.08)" }}>
                    <p className="font-bold" style={{ color: "var(--foreground)" }}>{chapter}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      Suggested from your latest practice result.
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("studyplan")} className="w-full mt-4 py-2 rounded-xl text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                Add revision session
              </button>
            </aside>
          </div>
        )}

        {tab === "chapters" && (
          <div className="space-y-3 animate-fade-up">
            {subject.chapters.map((chapter, index) => (
              <article key={chapter} className="lt-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black" style={{ background: `${subject.color}18`, color: subject.color }}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold" style={{ color: "var(--foreground)" }}>{chapter}</h2>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Lesson, summary, quiz, flashcards and videos</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate("lesson")} className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Study</button>
                    <button onClick={() => startSubjectUpload(subject.id, chapter)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Add notes</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "materials" && (
          <div className="animate-fade-up">
            <div className="flex flex-wrap gap-3 mb-4">
              {["All chapters", "PDF", "Document", "Image", "Text"].map((filter) => (
                <button key={filter} className="px-3 py-2 rounded-xl border text-xs font-bold" style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>{filter}</button>
              ))}
            </div>
            {subjectUploads.length ? (
              <div className="space-y-3">
                {subjectUploads.map((upload) => (
                  <article key={upload.id || upload.name} className="lt-card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black" style={{ background: `${subject.color}18`, color: subject.color }}>
                      {upload.name.split(".").pop()?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>{upload.name}</h2>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{upload.chapter || "General"} · {upload.createdAt ? new Date(upload.createdAt).toLocaleDateString() : "Recently added"}</p>
                    </div>
                    <button onClick={() => navigate("pack")} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Learning Pack</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="lt-card p-10 text-center">
                <h2 className="font-black" style={{ color: "var(--foreground)" }}>No materials yet</h2>
                <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>Upload notes to create this subject’s first Learning Pack.</p>
                <button onClick={() => startSubjectUpload(subject.id)} className="lt-btn lt-btn-primary px-5 py-2.5">Upload notes</button>
              </div>
            )}
          </div>
        )}

        {tab === "practice" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
            {[
              ["AI Quiz", "Questions based on this subject and your uploaded notes.", "quiz"],
              ["Flashcards", "Review key terms and mark difficult cards.", "flashcards"],
              ["Practice Questions", "Target chapters that need more practice.", "practicequestions"],
              ["Ask Twin", "Ask questions with this subject as context.", "pack"],
            ].map(([title, description, page]) => (
              <button key={title} onClick={() => navigate(page as Page)} className="lt-card lt-card-lift p-5 text-left">
                <h2 className="font-black mb-1" style={{ color: "var(--foreground)" }}>{title}</h2>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
