import { useState, useEffect } from 'react'
import type { Page, ThemeMode, DensitySize, UserProfile } from '../types'
import { readLocal, writeLocal } from '../lib/localData'

interface Props {
  current: Page
  navigate: (p: Page) => void
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  density: DensitySize
  setDensity: (d: DensitySize) => void
  user: UserProfile
  onProfileOpen?: () => void
  onLogout?: () => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}

interface NavLeaf {
  kind: 'leaf'
  page: Page
  label: string
  icon: React.ReactNode
}

interface NavGroup {
  kind: 'group'
  id: string
  label: string
  icon: React.ReactNode
  children: NavLeaf[]
}

type NavSection = NavLeaf | NavGroup

// ── Icon factory ──────────────────────────────────────────────────────────────
function SvgIcon({ d, extra, size = 16 }: { d?: string; extra?: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      {d && <path d={d} />}
      {extra}
    </svg>
  )
}

const Icons = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  folderClosed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  folderOpen: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  brain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/>
      <path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>
    </svg>
  ),
  calendar: <SvgIcon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />,
  pencil: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  report: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
  ),
  book: <SvgIcon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />,
  fileText: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="9" x2="10" y2="9"/>
    </svg>
  ),
  layers: <SvgIcon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  creditCard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  package: <SvgIcon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  sliders: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  accessibility: <SvgIcon d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7.5 8h9l-1 7h-2l-1 7h-5l-1-7H5.5l2-7z" />,
  lightbulb: <SvgIcon d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26A7 7 0 0 1 5 9a7 7 0 0 1 7-7z" />,
  helpCircle: <SvgIcon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />,
  target: <SvgIcon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
  radar: <SvgIcon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  trendingUp: <SvgIcon d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />,
  pieChart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevronRight: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  family: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  teach: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21l4-4 4 4"/>
      <line x1="12" y1="7" x2="12" y2="13"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
    </svg>
  ),
}

// ── Nav tree definitions ───────────────────────────────────────────────────────
const studentSections: NavSection[] = [
  {
    kind: 'group', id: 'mylearning', label: 'My Learning', icon: Icons.folderClosed,
    children: [
      { kind: 'leaf', page: 'dashboard',  label: 'Dashboard',          icon: Icons.home },
      { kind: 'leaf', page: 'subjects',   label: 'My Subjects',        icon: Icons.book },
      { kind: 'leaf', page: 'notes',      label: 'My Notes',           icon: Icons.fileText },
      { kind: 'leaf', page: 'mylearning', label: 'Uploaded Materials', icon: Icons.layers },
      { kind: 'leaf', page: 'pack',       label: 'Learning Packs',     icon: Icons.package },
      { kind: 'leaf', page: 'videos',     label: 'Videos',             icon: Icons.pieChart },
    ],
  },
  {
    kind: 'group', id: 'twin', label: 'Learning Twin', icon: Icons.brain,
    children: [
      { kind: 'leaf', page: 'adapted',      label: 'My Learning Twin',     icon: Icons.user },
      { kind: 'leaf', page: 'adaptive',     label: 'Adaptive Lessons',     icon: Icons.book },
      { kind: 'leaf', page: 'radar',        label: 'Difficulty Radar',     icon: Icons.radar },
      { kind: 'leaf', page: 'twininsights', label: 'Twin Insights',        icon: Icons.lightbulb },
      { kind: 'leaf', page: 'settings',     label: 'Learning Preferences', icon: Icons.sliders },
    ],
  },
  {
    kind: 'group', id: 'practice', label: 'Practice', icon: Icons.pencil,
    children: [
      { kind: 'leaf', page: 'quiz',              label: 'AI Quiz',             icon: Icons.helpCircle },
      { kind: 'leaf', page: 'flashcards',        label: 'Flashcards',          icon: Icons.creditCard },
      { kind: 'leaf', page: 'practicequestions', label: 'Practice Questions', icon: Icons.target },
      { kind: 'leaf', page: 'asktwin',           label: 'Ask Twin',            icon: Icons.brain },
      { kind: 'leaf', page: 'audiolearning',     label: 'Audio Learning',      icon: Icons.accessibility },
    ],
  },
  {
    kind: 'group', id: 'planner', label: 'Study Planner', icon: Icons.calendar,
    children: [
      { kind: 'leaf', page: 'examtimetable',    label: 'Exam Timetable',    icon: Icons.calendar },
      { kind: 'leaf', page: 'studyplan',        label: 'Weekly Study Plan', icon: Icons.layers },
      { kind: 'leaf', page: 'dailytasks',       label: 'Daily Tasks',       icon: Icons.target },
      { kind: 'leaf', page: 'revisionschedule', label: 'Revision Schedule', icon: Icons.pencil },
      { kind: 'leaf', page: 'upcomingexams',    label: 'Upcoming Exams',    icon: Icons.report },
    ],
  },
  {
    kind: 'group', id: 'progressGroup', label: 'Progress', icon: Icons.chart,
    children: [
      { kind: 'leaf', page: 'subjectperf', label: 'Subject Performance', icon: Icons.trendingUp },
      { kind: 'leaf', page: 'topicmastery',label: 'Topic Mastery',       icon: Icons.target },
      { kind: 'leaf', page: 'learninghistory', label: 'Learning History', icon: Icons.chart },
      { kind: 'leaf', page: 'reports',     label: 'Student Reports',      icon: Icons.report },
    ],
  },
  {
    kind: 'group', id: 'account', label: 'Account', icon: Icons.settings,
    children: [
      { kind: 'leaf', page: 'reading',       label: 'Reading & Appearance',   icon: Icons.book },
      { kind: 'leaf', page: 'accessibility', label: 'Accessibility Settings', icon: Icons.accessibility },
      { kind: 'leaf', page: 'theme',         label: 'Theme Customizer',       icon: Icons.sliders },
      { kind: 'leaf', page: 'profile',       label: 'Profile',                icon: Icons.user },
      { kind: 'leaf', page: 'settings',      label: 'Settings',               icon: Icons.settings },
    ],
  },
  { kind: 'leaf', page: 'scan', label: 'Upload & Learn', icon: Icons.upload },
]

const parentSections: NavSection[] = [
  { kind: 'leaf', page: 'dashboard', label: 'Dashboard', icon: Icons.home },
  { kind: 'leaf', page: 'parent',    label: 'Children',  icon: Icons.family },
  { kind: 'leaf', page: 'progress',  label: 'Progress',  icon: Icons.chart },
  { kind: 'leaf', page: 'reports',   label: 'Reports',   icon: Icons.report },
  { kind: 'leaf', page: 'settings',  label: 'Settings',  icon: Icons.settings },
]

const educatorSections: NavSection[] = [
  { kind: 'leaf', page: 'dashboard', label: 'Dashboard', icon: Icons.home },
  { kind: 'leaf', page: 'educator',  label: 'Students',  icon: Icons.teach },
  { kind: 'leaf', page: 'reports',   label: 'Analytics', icon: Icons.report },
  { kind: 'leaf', page: 'settings',  label: 'Settings',  icon: Icons.settings },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function groupContains(group: NavGroup, page: Page): boolean {
  return group.children.some(c => c.page === page)
}

function defaultOpenGroups(sections: NavSection[], current: Page): Set<string> {
  const open = new Set<string>()
  for (const s of sections) {
    if (s.kind === 'group' && groupContains(s, current)) open.add(s.id)
  }
  return open
}

function AvatarBadge({ user, size = 32 }: { user: UserProfile; size?: number }) {
  const dim = `${size}px`
  return user.avatar
    ? <img src={user.avatar} alt={user.name} style={{ width: dim, height: dim }}
        className="rounded-full object-cover flex-shrink-0 ring-2 ring-white/20" />
    : <div className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
        style={{ width: dim, height: dim, background: 'linear-gradient(135deg,#0F766E,#6366F1)', fontSize: size < 30 ? '10px' : '12px' }}>
        {user.name[0]}
      </div>
}

// ── Sidebar tree body ──────────────────────────────────────────────────────────
function SidebarBody({
  sections, current, navigate, theme, setTheme, density, setDensity,
  user, onLogout, onNavClick, collapsed,
}: {
  sections: NavSection[]
  current: Page
  navigate: (p: Page) => void
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  density: DensitySize
  setDensity: (d: DensitySize) => void
  user: UserProfile
  onLogout?: () => void
  onNavClick?: () => void
  collapsed: boolean
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const saved = readLocal<string[]>(`lt-nav-groups-${user.role}`, [])
    return new Set([...saved, ...defaultOpenGroups(sections, current)])
  })
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      for (const s of sections) {
        if (s.kind === 'group' && groupContains(s, current)) next.add(s.id)
      }
      writeLocal(`lt-nav-groups-${user.role}`, [...next])
      return next
    })
  }, [current, sections, user.role])

  const go = (p: Page) => { navigate(p); onNavClick?.() }

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      writeLocal(`lt-nav-groups-${user.role}`, [...next])
      return next
    })
  }

  const leafActive = (page: Page) => current === page
  const groupActive = (g: NavGroup) => groupContains(g, current)

  const C = {
    text: 'rgba(241,245,249,.6)',
    textActive: '#F1F5F9',
    textMuted: 'rgba(241,245,249,.32)',
    activeBg: 'rgba(255,255,255,.09)',
    hoverBg: 'rgba(255,255,255,.05)',
  }

  /* ── Collapsed icon-only mode ────────────────────────────────────────────── */
  if (collapsed) {
    return (
      <div className="flex flex-col h-full select-none" style={{ overflow: 'hidden' }}>
        {/* Logo icon */}
        <button onClick={() => go('dashboard')}
          className="flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{ height: '60px' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
        </button>

        <div className="mx-2 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

        {/* Aa size button */}
        <div className="flex flex-col items-center py-2 flex-shrink-0 gap-1">
          <p className="text-[9px] font-black tracking-widest" style={{ color: C.textMuted, fontFamily: "'Inter',sans-serif" }}>Aa</p>
          {(['small','medium','large'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)}
              className="w-7 h-5 rounded text-[9px] font-black transition-all flex-shrink-0"
              style={{
                fontFamily:"'Inter',sans-serif",
                background: density === d ? 'rgba(255,255,255,.15)' : 'transparent',
                color: density === d ? '#F1F5F9' : C.textMuted,
              }}>
              {d === 'small' ? 'S' : d === 'medium' ? 'M' : 'L'}
            </button>
          ))}
        </div>

        <div className="mx-2 h-px flex-shrink-0 mb-1" style={{ background: 'var(--sidebar-border)' }} />

        {/* Nav icons */}
        <nav className="flex-1 overflow-y-auto py-1 flex flex-col items-center gap-0.5 no-scrollbar">
          {sections.map((s, i) => {
            if (s.kind === 'leaf') {
              const active = leafActive(s.page)
              return (
                <button key={`${s.page}-${i}`} onClick={() => go(s.page)} title={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative flex-shrink-0"
                  style={{
                    background: active ? C.activeBg : 'transparent',
                    color: active ? 'var(--primary)' : C.text,
                  }}>
                  {active && (
                    <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full" style={{ background: 'var(--primary)' }} />
                  )}
                  {s.icon}
                </button>
              )
            } else {
              const active = groupActive(s)
              return (
                <button key={s.id} onClick={() => { if (s.children[0]) go(s.children[0].page) }} title={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative flex-shrink-0"
                  style={{
                    background: active ? C.activeBg : 'transparent',
                    color: active ? 'var(--primary)' : C.text,
                  }}>
                  {active && (
                    <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full" style={{ background: 'var(--primary)' }} />
                  )}
                  {s.icon}
                </button>
              )
            }
          })}
        </nav>

        <div className="mx-2 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

        {/* Bottom icons */}
        <div className="flex flex-col items-center py-3 gap-1 flex-shrink-0">
          <button onClick={() => go('profile')} title="Profile"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: current === 'profile' ? C.activeBg : 'transparent', color: current === 'profile' ? 'var(--primary)' : C.text }}>
            <AvatarBadge user={user} size={24} />
          </button>
          <button onClick={() => go('settings')} title="Settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: current === 'settings' ? C.activeBg : 'transparent', color: current === 'settings' ? 'var(--primary)' : C.text }}>
            {Icons.settings}
          </button>
          <button onClick={() => setConfirmLogout(true)} title="Log Out"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: '#F87171' }}>
            {Icons.logout}
          </button>
        </div>

        {confirmLogout && <LogoutConfirm onCancel={() => setConfirmLogout(false)} onConfirm={() => { setConfirmLogout(false); onNavClick?.(); onLogout?.() }} />}
      </div>
    )
  }

  /* ── Expanded full mode ──────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full select-none" style={{ overflow: 'hidden' }}>
      {/* Logo */}
      <button onClick={() => go('dashboard')}
        className="flex items-center gap-3 px-4 flex-shrink-0 hover:opacity-90 transition-opacity text-left w-full"
        style={{ height: '60px' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: 'var(--primary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="leading-none min-w-0">
          <p className="font-black text-[14px] truncate" style={{ color: '#F1F5F9', fontFamily: "'Inter',sans-serif", letterSpacing: '-.01em' }}>LearnTwin</p>
          <p className="text-[10px] mt-0.5 font-medium tracking-wide truncate" style={{ color: 'rgba(241,245,249,.38)' }}>AI Learning Platform</p>
        </div>
      </button>

      <div className="mx-3 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Aa / Font Size control ── */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,.04)' }}>
          <span className="font-black text-sm flex-shrink-0" style={{ color: 'var(--primary)', fontFamily: "'Inter',sans-serif" }}>Aa</span>
          <div className="flex-1 flex gap-1">
            {([
              { d: 'small' as const, label: 'Small', short: 'S' },
              { d: 'medium' as const, label: 'Medium', short: 'M' },
              { d: 'large' as const, label: 'Large', short: 'L' },
            ]).map(({ d, short }) => (
              <button key={d} onClick={() => setDensity(d)}
                className="flex-1 py-1 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  background: density === d ? 'var(--primary)' : 'transparent',
                  color: density === d ? '#fff' : C.textMuted,
                }}>
                {short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-3 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Nav tree ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 no-scrollbar">
        {sections.map((s, idx) => {
          if (s.kind === 'leaf') {
            const active = leafActive(s.page)
            return (
              <button key={`${s.page}-${idx}`} onClick={() => go(s.page)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all relative group mb-px"
                style={{
                  background: active ? C.activeBg : 'transparent',
                  color: active ? C.textActive : C.text,
                  fontFamily: "'Inter',sans-serif",
                }}>
                {active && <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-r-full" style={{ background: 'var(--primary)' }} />}
                <span className="flex-shrink-0" style={{ color: active ? 'var(--primary)' : 'inherit', opacity: active ? 1 : 0.7 }}>
                  {s.icon}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            )
          } else {
            const open = openGroups.has(s.id)
            const active = groupActive(s)
            return (
              <div key={s.id} className="mb-px">
                {/* Group header */}
                <button onClick={() => toggleGroup(s.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-semibold transition-all relative group"
                  style={{
                    background: active && !open ? C.activeBg : 'transparent',
                    color: active ? C.textActive : C.text,
                    fontFamily: "'Inter',sans-serif",
                  }}>
                  {active && !open && <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-r-full" style={{ background: 'var(--primary)' }} />}
                  <span className="flex-shrink-0" style={{ color: active ? 'var(--primary)' : 'inherit', opacity: active ? 1 : 0.7 }}>
                    {open ? Icons.folderOpen : Icons.folderClosed}
                  </span>
                  <span className="truncate flex-1 text-left">{s.label}</span>
                  <span className="flex-shrink-0 transition-transform duration-200 opacity-50"
                    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', color: 'inherit' }}>
                    {Icons.chevronRight}
                  </span>
                </button>

                {/* Children */}
                {open && (
                  <div className="ml-4 pl-2.5 mt-px mb-1"
                    style={{ borderLeft: '1px solid rgba(255,255,255,.09)' }}>
                    {s.children.map((child, ci) => {
                      const cActive = leafActive(child.page) && (
                        /* for pages mapped to 'settings', only first 'Preferences' or the accessibility tab */
                        child.page !== 'settings' || (child.label === 'Preferences' && current === 'settings') || (child.label === 'Accessibility' && current === 'settings')
                      )
                      const isLast = ci === s.children.length - 1
                      return (
                        <div key={`${child.page}-${child.label}`} className="relative">
                          {/* Tree connector tick */}
                          <div className="absolute -left-2.5 top-1/2 w-2 h-px"
                            style={{ background: 'rgba(255,255,255,.09)', top: '50%' }} />
                          {isLast && (
                            <div className="absolute -left-2.5 bottom-1/2 top-0 w-px"
                              style={{ background: 'var(--sidebar-bg)', marginLeft: '-1px', zIndex: 1 }} />
                          )}
                          <button onClick={() => go(child.page)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium transition-all relative mb-px"
                            style={{
                              background: leafActive(child.page) ? C.activeBg : 'transparent',
                              color: leafActive(child.page) ? C.textActive : C.text,
                              fontFamily: "'Inter',sans-serif",
                            }}>
                            <span className="flex-shrink-0" style={{ color: leafActive(child.page) ? 'var(--primary)' : 'inherit', opacity: 0.75 }}>
                              {child.icon}
                            </span>
                            <span className="truncate">{child.label}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
        })}
      </nav>

      <div className="mx-3 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Theme strip ── */}
      <div className="px-3 pt-2.5 pb-1.5 flex-shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5 px-0.5" style={{ color: C.textMuted, fontFamily:"'Inter',sans-serif" }}>Theme</p>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,.04)' }}>
          {([
            { t: 'light' as const, dot: '#F8FAFC', label: 'Light' },
            { t: 'dark'  as const, dot: '#1E293B', label: 'Dark'  },
            { t: 'customize' as const, dot: '#6366F1', label: 'Custom' },
          ]).map(({ t, dot, label }) => (
            <button key={t} onClick={() => setTheme(t)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                fontFamily:"'Inter',sans-serif",
                background: theme === t ? 'var(--primary)' : 'transparent',
                color: theme === t ? '#fff' : C.textMuted,
              }}>
              <span className="w-2 h-2 rounded-full border border-white/20 flex-shrink-0" style={{ background: dot }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 h-px flex-shrink-0" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Profile row ── */}
      <button onClick={() => go('profile')}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 flex-shrink-0 hover:opacity-90 transition-all text-left group"
        style={{ background: current === 'profile' ? C.activeBg : 'transparent' }}>
        <AvatarBadge user={user} size={30} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold truncate leading-tight" style={{ color: '#F1F5F9', fontFamily:"'Inter',sans-serif" }}>{user.name}</p>
          <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{user.grade}</p>
        </div>
        <span className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">{Icons.chevronRight}</span>
      </button>

      {/* ── Settings + Logout row ── */}
      <div className="flex items-center gap-1 px-3 pb-4 pt-1 flex-shrink-0">
        <button onClick={() => go('settings')}
          className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            fontFamily:"'Inter',sans-serif",
            background: current === 'settings' ? C.activeBg : 'transparent',
            color: current === 'settings' ? 'var(--primary)' : C.text,
          }}>
          {Icons.settings}
          <span>Settings</span>
        </button>
        <button onClick={() => setConfirmLogout(true)}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={{ fontFamily:"'Inter',sans-serif", color: '#F87171' }}>
          {Icons.logout}
          <span>Logout</span>
        </button>
      </div>

      {confirmLogout && <LogoutConfirm onCancel={() => setConfirmLogout(false)} onConfirm={() => { setConfirmLogout(false); onNavClick?.(); onLogout?.() }} />}
    </div>
  )
}

function LogoutConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-xs rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">👋</div>
          <h3 className="text-lg font-black mb-1" style={{ color:'var(--foreground)', fontFamily:"'Inter',sans-serif" }}>Log out?</h3>
          <p className="text-sm" style={{ color:'var(--muted-foreground)', fontFamily:"'Inter',sans-serif" }}>
            Are you sure you want to leave LearnTwin?
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm border"
            style={{ background:'var(--muted)', borderColor:'var(--border)', color:'var(--foreground)', fontFamily:"'Inter',sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-black text-sm text-white"
            style={{ background:'#EF4444', fontFamily:"'Inter',sans-serif" }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Exported Navigation component ─────────────────────────────────────────────
export default function Navigation({
  current, navigate, theme, setTheme, density, setDensity,
  user, onProfileOpen, onLogout, collapsed, setCollapsed,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sections =
    user.role === 'educator' ? educatorSections :
    user.role === 'parent'   ? parentSections   :
    studentSections

  const EXPANDED_W = 240
  const COLLAPSED_W = 52

  return (
    <>
      {/* ═══════════════════════════ DESKTOP SIDEBAR ═══════════════════════ */}
      <aside
        className="hidden md:block fixed left-0 top-0 h-screen z-40"
        style={{
          width: collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`,
          transition: 'width 0.25s ease',
          overflow: 'visible',
        }}
      >
        {/* Sidebar panel */}
        <div className="h-full flex flex-col"
          style={{
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            overflow: 'hidden',
            width: '100%',
          }}>
          <SidebarBody
            sections={sections} current={current} navigate={navigate}
            theme={theme} setTheme={setTheme}
            density={density} setDensity={setDensity}
            user={user} onLogout={onLogout}
            collapsed={collapsed}
          />
        </div>

        {/* Collapse toggle tab */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[70px] -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-50 transition-all hover:scale-110"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--muted-foreground)',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span style={{ transform: collapsed ? 'rotate(180deg)' : 'none', display: 'flex', transition: 'transform 0.25s' }}>
            {Icons.chevronLeft}
          </span>
        </button>
      </aside>

      {/* ═══════════════════════════ MOBILE ════════════════════════════════ */}
      <div className="md:hidden">
        {/* Fixed top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
          style={{ height: '52px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--sidebar-border)' }}>
          <button onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(241,245,249,.7)' }}
            aria-label="Open navigation">
            {Icons.menu}
          </button>
          <button onClick={() => navigate('dashboard')}
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--primary)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-black text-[13px]" style={{ color:'#F1F5F9', fontFamily:"'Inter',sans-serif" }}>LearnTwin</span>
          </button>
          <button onClick={() => navigate('profile')} className="hover:opacity-80 transition-opacity flex-shrink-0">
            <AvatarBadge user={user} size={30} />
          </button>
        </div>

        {/* Backdrop */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)} />
        )}

        {/* Left drawer */}
        <div className="fixed top-0 left-0 bottom-0 w-[240px] z-50 flex flex-col transition-transform duration-300 ease-out"
          style={{
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}>
          <button onClick={() => setDrawerOpen(false)}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(241,245,249,.7)' }}
            aria-label="Close navigation">
            {Icons.close}
          </button>
          <SidebarBody
            sections={sections} current={current} navigate={navigate}
            theme={theme} setTheme={setTheme}
            density={density} setDensity={setDensity}
            user={user} onLogout={onLogout}
            onNavClick={() => setDrawerOpen(false)}
            collapsed={false}
          />
        </div>

        {/* Mobile floating Aa pill */}
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-lg"
          style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--sidebar-border)' }}>
          <span className="text-[11px] font-black mr-1" style={{ color: 'var(--primary)', fontFamily: "'Inter',sans-serif" }}>Aa</span>
          {(['small','medium','large'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)}
              className="w-7 h-6 rounded-lg text-[10px] font-bold transition-all"
              style={{
                fontFamily:"'Inter',sans-serif",
                background: density === d ? 'var(--primary)' : 'rgba(255,255,255,.06)',
                color: density === d ? '#fff' : 'rgba(241,245,249,.5)',
              }}>
              {d === 'small' ? 'S' : d === 'medium' ? 'M' : 'L'}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
