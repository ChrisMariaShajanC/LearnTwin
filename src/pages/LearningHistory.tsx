import BackButton from "../components/BackButton"
import { readLocal } from "../lib/localData"
import type { StudySession } from "./StudyPlanner"
import type { UploadedFile } from "./ScanLearn"
import type { Page, UserProfile } from "../types"

interface Props {
  navigate: (page: Page) => void
  user: UserProfile
  uploads: UploadedFile[]
}

export default function LearningHistory({ navigate, user, uploads }: Props) {
  const sessions = readLocal<StudySession[]>("lt-study-sessions", [])
  const completed = sessions.filter((session) => session.status === "completed")
  const events = [
    ...uploads.map((upload) => ({
      id: upload.id || upload.name,
      date: upload.createdAt || new Date().toISOString(),
      title: `Created a Learning Pack: ${upload.topic}`,
      detail: `${upload.subject}${upload.chapter ? ` · ${upload.chapter}` : ""}`,
      type: "Material",
    })),
    ...completed.map((session) => ({
      id: session.id,
      date: `${session.date}T${session.start}`,
      title: `Completed study session: ${session.topic}`,
      detail: `${session.subject} · ${session.minutes} minutes`,
      type: "Study",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: "var(--background)" }}>
      <div className="max-w-3xl mx-auto px-5 py-8">
        <BackButton navigate={navigate} to="progress" label="Progress" />
        <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>Learning History</h1>
        <p className="text-sm mt-1 mb-6" style={{ color: "var(--muted-foreground)" }}>
          Evidence-based activity recorded for {user.name} on this device.
        </p>
        {events.length ? (
          <div className="space-y-3">
            {events.map((event) => (
              <article key={`${event.type}-${event.id}`} className="lt-card p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black" style={{ background: "rgba(78,205,196,.12)", color: "var(--primary)" }}>
                  {event.type.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--primary)" }}>{event.type}</p>
                  <h2 className="font-bold mt-0.5" style={{ color: "var(--foreground)" }}>{event.title}</h2>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{event.detail} · {new Date(event.date).toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="lt-card p-10 text-center">
            <h2 className="font-black" style={{ color: "var(--foreground)" }}>No recorded activity yet</h2>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>Upload notes or complete a planned study session to build your history.</p>
            <button onClick={() => navigate("scan")} className="lt-btn lt-btn-primary px-5 py-2.5">Upload notes</button>
          </div>
        )}
      </div>
    </div>
  )
}
