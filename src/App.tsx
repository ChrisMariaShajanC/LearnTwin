import { useState, useEffect, useCallback } from 'react'
import { PreferencesProvider } from './context/PreferencesContext'
import type { Page, ThemeMode, UserProfile, DensitySize } from './types'
import type { SubjectDefinition } from './data/curriculum'
import { readLocal, writeLocal } from './lib/localData'
import { api } from './lib/api'
import type { UploadedFile } from './pages/ScanLearn'
import Navigation from './components/Navigation'
import ProfilePanel from './components/ProfilePanel'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ScanLearn from './pages/ScanLearn'
import LearningPack from './pages/LearningPack'
import MyLearning from './pages/MyLearning'
import Videos from './pages/Videos'
import AdaptedView from './pages/AdaptedView'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import Progress from './pages/Progress'
import Reports from './pages/Reports'
import ThemeCustomizer from './pages/ThemeCustomizer'
import ParentView from './pages/ParentView'
import Educator from './pages/Educator'
import Profile from './pages/Profile'
import Radar from './pages/Radar'
import Settings from './pages/Settings'
import StubPage from './pages/StubPage'
import Subjects from './pages/Subjects'
import SubjectDetail from './pages/SubjectDetail'
import StudyPlanner from './pages/StudyPlanner'
import LearningHistory from './pages/LearningHistory'
import VisualStudio from './pages/VisualStudio'

const defaultUser: UserProfile = {
  name: '',
  grade: '',
  educationLevel: 'hs',
  education: {},
  selectedSubjects: [],
  role: 'student',
  xp: 0,
  accessibility: {
    fontSize: 'normal',
    fontFamily: 'atkinson',
    lineSpacing: 'normal',
    wordSpacing: 'normal',
    letterSpacing: 'normal',
    background: 'light',
    contrast: 'normal',
    audioEnabled: false,
  },
  learningPattern: {
    visual: 0,
    audio: 0,
    examples: 0,
    text: 0,
    stepByStep: 0,
  },
  learningPreferences: {
    font: 'default',
    learningFormats: [],
    explanationStyle: null,
    chunkSize: 'medium',
    interests: [],
    interestsCustom: '',
    formatSwitching: 'noPreference',
    onboardingPreferencesDone: false,
  },
  aiConfidence: 0,
  streak: 0,
  lessonsCompleted: 0,
  understanding: 0,
}

const STUB_PAGES: Page[] = ['notes', 'flashcards', 'practicequestions', 'twininsights', 'subjectperf', 'topicmastery']
const PLANNER_PAGES: Page[] = ['studyplan', 'examtimetable', 'dailytasks', 'revisionschedule', 'upcomingexams']

const pagesWithNav: Page[] = [
  'dashboard', 'scan', 'lesson', 'quiz', 'progress',
  'reports', 'theme', 'profile', 'settings', 'radar',
  'pack', 'parent', 'mylearning', 'videos', 'educator', 'adapted',
  'subjects', 'subject', 'learninghistory', 'visualstudio', 'adaptive', 'asktwin', 'audiolearning', 'reading', 'accessibility',
  ...PLANNER_PAGES,
  ...STUB_PAGES,
]

function loadPref<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v !== null ? (JSON.parse(v) as T) : fallback
  } catch { return fallback }
}

export default function App() {
  const [page, setPage]               = useState<Page>('landing')
  const [theme, setThemeState]        = useState<ThemeMode>(() => loadPref('lt-theme', 'light'))
  const [density, setDensityState]    = useState<DensitySize>(() => loadPref('lt-density', 'medium'))
  const [customPrimary, setCustomPrimary] = useState<string>(() => loadPref('lt-custom-primary', '#6366F1'))
  const [user, setUserState]          = useState<UserProfile>(() => readLocal('lt-user-profile', defaultUser))
  const [isLoggedIn, setIsLoggedIn]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [uploads, setUploads]         = useState<UploadedFile[]>(() => readLocal('lt-uploads', []))
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(() => readLocal('lt-active-upload', null))
  const [customSubjects, setCustomSubjectsState] = useState<SubjectDefinition[]>(() => readLocal('lt-custom-subjects', []))
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(() => readLocal('lt-selected-subject', null))
  const [uploadContext, setUploadContext] = useState<{ subjectId?: string; chapter?: string }>(() => readLocal('lt-upload-context', {}))
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => loadPref('lt-sidebar-collapsed', false))

  const USER_ID = 'default-user'

  const setTheme = (t: ThemeMode) => {
    setThemeState(t)
    localStorage.setItem('lt-theme', JSON.stringify(t))
  }

  const setDensity = (d: DensitySize) => {
    setDensityState(d)
    localStorage.setItem('lt-density', JSON.stringify(d))
  }

  const setCustomColor = (color: string) => {
    setCustomPrimary(color)
    localStorage.setItem('lt-custom-primary', JSON.stringify(color))
  }

  const setCollapsed = (v: boolean) => {
    setSidebarCollapsed(v)
    localStorage.setItem('lt-sidebar-collapsed', JSON.stringify(v))
  }

  const setUser = (next: UserProfile) => {
    setUserState(next)
    writeLocal('lt-user-profile', next)
    api.updateUser(USER_ID, next).catch(() => {})
  }

  const setCustomSubjects = (subjects: SubjectDefinition[]) => {
    setCustomSubjectsState(subjects)
    writeLocal('lt-custom-subjects', subjects)
  }

  const handleFileUploaded = (file: UploadedFile) => {
    const next = [file, ...uploads.filter((item) => item.id !== file.id)]
    setUploads(next)
    setUploadedFile(file)
    writeLocal('lt-uploads', next)
    writeLocal('lt-active-upload', file)
    api.createUpload({ ...file, userId: USER_ID }).catch(() => {})
  }

  const openSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    writeLocal('lt-selected-subject', subjectId)
    navigate('subject')
  }

  const startSubjectUpload = (subjectId: string, chapter?: string) => {
    const context = { subjectId, chapter }
    setUploadContext(context)
    writeLocal('lt-upload-context', context)
    navigate('scan')
  }

  useEffect(() => {
    api.getUser(USER_ID).then((data) => {
      if (data) {
        const profile = data as unknown as UserProfile
        setUserState(profile)
        writeLocal('lt-user-profile', profile)
      }
    }).catch(() => {})
    api.getUploads(USER_ID).then((data) => {
      if (data?.length) {
        setUploads(data as unknown as UploadedFile[])
        writeLocal('lt-uploads', data)
      }
    }).catch(() => {})
    api.getCustomSubjects(USER_ID).then((data) => {
      if (data?.length) {
        setCustomSubjectsState(data as unknown as SubjectDefinition[])
        writeLocal('lt-custom-subjects', data)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const sizes: Record<DensitySize, string> = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = sizes[density]
    document.documentElement.classList.remove('density-small', 'density-medium', 'density-large')
    document.documentElement.classList.add(`density-${density}`)
  }, [density])

  useEffect(() => {
    if (theme === 'customize') {
      document.documentElement.style.setProperty('--custom-primary', customPrimary)
    } else {
      document.documentElement.style.removeProperty('--custom-primary')
    }
  }, [theme, customPrimary])

  useEffect(() => {
    const fonts: Record<UserProfile['accessibility']['fontFamily'], string> = {
      lexend: "'Lexend', sans-serif",
      nunito: "'Nunito', sans-serif",
      system: "system-ui, sans-serif",
      arial: "Arial, sans-serif",
      verdana: "Verdana, sans-serif",
      atkinson: "'Atkinson Hyperlegible', sans-serif",
    opendyslexic: "'OpenDyslexic', Verdana, sans-serif",
    }
    const sizes = { small: '0.9', normal: '1', large: '1.08', xl: '1.18' }
    const lines = { normal: '1.5', relaxed: '1.75', loose: '2' }
    const root = document.documentElement
    root.style.setProperty('--user-font-family', fonts[user.accessibility.fontFamily] || fonts.lexend)
    root.style.setProperty('--user-text-scale', sizes[user.accessibility.fontSize])
    root.style.setProperty('--user-line-height', lines[user.accessibility.lineSpacing])
    root.style.setProperty('--user-letter-spacing', user.accessibility.letterSpacing === 'wide' ? '0.045em' : 'normal')
    root.style.setProperty('--user-word-spacing', user.accessibility.wordSpacing === 'wide' ? '0.12em' : 'normal')
    root.style.setProperty('--content-width', user.accessibility.contentWidth === 'compact' ? '52rem' : user.accessibility.contentWidth === 'wide' ? '78rem' : '64rem')
    root.classList.toggle('reduced-motion', Boolean(user.accessibility.reducedMotion))
    root.classList.toggle('high-contrast', user.accessibility.contrast === 'high')
  }, [user.accessibility])

  /* Push content right based on sidebar width */
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', sidebarCollapsed ? '52px' : '240px')
  }, [sidebarCollapsed])

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin  = () => setIsLoggedIn(true)
  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('login')
  }

  const themeClass = theme === 'dark' ? 'theme-dark' : theme === 'customize' ? 'theme-customize' : ''
  const showNav    = pagesWithNav.includes(page) && isLoggedIn

  return (
    <PreferencesProvider isAuthed={isLoggedIn} user={user} setUser={setUser}>
      <div
        className={themeClass}
      style={{ minHeight: '100%', background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {showNav && (
        <button
          onClick={() => setShowProfile(true)}
          className="fixed top-3 right-3 z-[60] w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
          style={{ background: 'var(--primary)' }}
          aria-label="Open profile"
        >
          {(user.name || 'U').charAt(0).toUpperCase()}
        </button>
      )}

      {showNav && (
        <Navigation
          current={page}
          navigate={navigate}
          theme={theme}
          setTheme={setTheme}
          density={density}
          setDensity={setDensity}
          user={user}
          onProfileOpen={() => setShowProfile(true)}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setCollapsed}
        />
      )}

      {showNav && (
        <ProfilePanel
          open={showProfile}
          onClose={() => setShowProfile(false)}
          navigate={navigate}
          user={user}
          setUser={setUser}
          theme={theme}
          onLogout={handleLogout}
        />
      )}

      <div
        className={showNav ? 'pt-[52px] md:pt-0 md-sidebar-push' : ''}
        style={{ transition: 'padding-left 0.25s ease' }}
      >
        {page === 'landing'    && <Landing navigate={navigate} />}
        {page === 'login'      && <Login navigate={navigate} setUser={setUser} defaultUser={defaultUser} onLogin={handleLogin} />}
        {page === 'onboarding' && <Onboarding navigate={navigate} user={user} setUser={setUser} />}
        {page === 'dashboard'  && <Dashboard navigate={navigate} user={user} />}
        {page === 'scan'       && (
          <ScanLearn
            navigate={navigate}
            user={user}
            onFileUploaded={handleFileUploaded}
            uploadContext={uploadContext}
            customSubjects={customSubjects}
          />
        )}
        {page === 'pack'       && <LearningPack navigate={navigate} user={user} uploadedFile={uploadedFile} />}
        {page === 'asktwin'    && <LearningPack navigate={navigate} user={user} uploadedFile={uploadedFile} initialTab="ask" />}
        {page === 'audiolearning' && <LearningPack navigate={navigate} user={user} uploadedFile={uploadedFile} initialTab="audio" />}
        {page === 'mylearning' && <MyLearning navigate={navigate} user={user} uploadedFile={uploadedFile} uploads={uploads} />}
        {page === 'videos'     && <Videos navigate={navigate} user={user} topic={uploadedFile?.topic} />}
        {page === 'adapted'    && <AdaptedView navigate={navigate} user={user} />}
        {page === 'lesson'     && <Lesson navigate={navigate} user={user} theme={theme} />}
        {page === 'adaptive'   && <Lesson navigate={navigate} user={user} theme={theme} />}
        {page === 'quiz'       && <Quiz navigate={navigate} user={user} setUser={setUser} uploadedFile={uploadedFile} />}
        {page === 'progress'   && <Progress navigate={navigate} user={user} />}
        {page === 'reports'    && <Reports navigate={navigate} user={user} />}
        {page === 'theme'      && <ThemeCustomizer navigate={navigate} theme={theme} setTheme={setTheme} user={user} setUser={setUser} />}
        {page === 'parent'     && <ParentView navigate={navigate} user={user} />}
        {page === 'educator'   && <Educator navigate={navigate} user={user} />}
        {page === 'profile'    && <Profile navigate={navigate} user={user} />}
        {page === 'radar'      && <Radar navigate={navigate} user={user} />}
        {page === 'settings'   && (
          <Settings
            navigate={navigate}
            theme={theme}
            setTheme={setTheme}
            density={density}
            setDensity={setDensity}
            customPrimary={customPrimary}
            setCustomColor={setCustomColor}
            user={user}
            setUser={setUser}
          />
        )}
        {(page === 'reading' || page === 'accessibility') && (
          <Settings
            navigate={navigate}
            theme={theme}
            setTheme={setTheme}
            density={density}
            setDensity={setDensity}
            customPrimary={customPrimary}
            setCustomColor={setCustomColor}
            user={user}
            setUser={setUser}
            initialSection={page === 'accessibility' ? 'accessibility' : 'appearance'}
          />
        )}
        {page === 'subjects' && (
          <Subjects
            navigate={navigate}
            user={user}
            setUser={setUser}
            customSubjects={customSubjects}
            setCustomSubjects={setCustomSubjects}
            openSubject={openSubject}
          />
        )}
        {page === 'subject' && (
          <SubjectDetail
            navigate={navigate}
            user={user}
            subjectId={selectedSubjectId}
            customSubjects={customSubjects}
            uploads={uploads}
            startSubjectUpload={startSubjectUpload}
          />
        )}
        {PLANNER_PAGES.includes(page) && <StudyPlanner navigate={navigate} user={user} view={page} />}
        {page === 'learninghistory' && <LearningHistory navigate={navigate} user={user} uploads={uploads} />}
        {page === 'visualstudio' && <VisualStudio navigate={navigate} user={user} uploadedFile={uploadedFile} />}
        {STUB_PAGES.includes(page) && (
          <StubPage navigate={navigate} user={user} page={page} />
        )}
      </div>
    </div>
    </PreferencesProvider>
  )
}
