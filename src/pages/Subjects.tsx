import { useMemo, useState } from "react"
import BackButton from "../components/BackButton"
import { educationLabel, suggestedSubjects, type SubjectDefinition } from "../data/curriculum"
import { createId } from "../lib/localData"
import type { Page, UserProfile } from "../types"

interface Props {
  navigate: (page: Page) => void
  user: UserProfile
  setUser: (user: UserProfile) => void
  customSubjects: SubjectDefinition[]
  setCustomSubjects: (subjects: SubjectDefinition[]) => void
  openSubject: (subjectId: string) => void
}

export default function Subjects({
  navigate,
  user,
  setUser,
  customSubjects,
  setCustomSubjects,
  openSubject,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [customName, setCustomName] = useState("")
  const suggestions = useMemo(() => suggestedSubjects(user), [user])
  const allSubjects = [...suggestions, ...customSubjects]
  const selected = user.selectedSubjects?.length
    ? user.selectedSubjects
    : suggestions.slice(0, Math.min(5, suggestions.length)).map((item) => item.id)

  const updateSelection = (id: string) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    setUser({ ...user, selectedSubjects: next })
  }

  const addSubject = () => {
    const name = customName.trim()
    if (!name) return
    const newSubject: SubjectDefinition = {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${createId("subject").slice(-6)}`,
      name,
      icon: "CU",
      color: "#4ECDC4",
      chapters: ["Introduction", "Unit 1", "Unit 2"],
      custom: true,
    }
    setCustomSubjects([...customSubjects, newSubject])
    setUser({ ...user, selectedSubjects: [...selected, newSubject.id] })
    setCustomName("")
  }

  const removeCustom = (id: string) => {
    setCustomSubjects(customSubjects.filter((item) => item.id !== id))
    setUser({ ...user, selectedSubjects: selected.filter((item) => item !== id) })
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10" style={{ background: "var(--background)" }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <BackButton navigate={navigate} to="dashboard" label="Dashboard" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--primary)" }}>
              {educationLabel(user)}
            </p>
            <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>My Subjects</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Suggestions are filtered to your course. Customize them to match your board or institution.
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="lt-btn border px-4 py-2.5 text-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            {editing ? "Done editing" : "Edit subjects"}
          </button>
        </div>

        {editing && (
          <div className="lt-card p-5 mb-5 animate-fade-up">
            <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Add a custom subject</h2>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              Subject names and chapters can differ by syllabus. Add anything missing from the suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addSubject()}
                placeholder="For example: Robotics"
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
                style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <button onClick={addSubject} disabled={!customName.trim()} className="lt-btn lt-btn-primary px-5 py-2.5 disabled:opacity-40">
                Add subject
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSubjects.map((subject) => {
            const isSelected = selected.includes(subject.id)
            return (
              <article key={subject.id} className="lt-card lt-card-lift p-5 relative">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black"
                    style={{ background: `${subject.color}18`, color: subject.color }}
                  >
                    {subject.icon}
                  </div>
                  {editing ? (
                    <button
                      onClick={() => updateSelection(subject.id)}
                      aria-pressed={isSelected}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                      style={{
                        background: isSelected ? "var(--primary)" : "var(--muted)",
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        color: isSelected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {isSelected ? "Selected" : "Add"}
                    </button>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: isSelected ? "#10B981" : "var(--muted-foreground)" }}>
                      {isSelected ? "Active" : "Not selected"}
                    </span>
                  )}
                </div>
                <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>{subject.name}</h2>
                <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
                  {subject.chapters.length} suggested chapters
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openSubject(subject.id)}
                    disabled={!isSelected}
                    className="flex-1 lt-btn lt-btn-primary py-2 text-sm disabled:opacity-40"
                  >
                    Open subject
                  </button>
                  {editing && subject.custom && (
                    <button
                      onClick={() => removeCustom(subject.id)}
                      className="px-3 rounded-xl border text-xs font-bold"
                      style={{ borderColor: "rgba(239,68,68,.3)", color: "#EF4444" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
