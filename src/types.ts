export type Page =
  | 'landing'
  | 'login'
  | 'onboarding'
  | 'dashboard'
  | 'scan'
  | 'lesson'
  | 'quiz'
  | 'progress'
  | 'reports'
  | 'theme'
  | 'parent'
  | 'profile'
  | 'settings'
  | 'radar'
  | 'pack'
  | 'videos'
  | 'mylearning'
  | 'educator'
  | 'adapted'
  | 'subjects'
  | 'subject'
  | 'adaptive'
  | 'asktwin'
  | 'audiolearning'
  | 'reading'
  | 'accessibility'
  | 'notes'
  | 'flashcards'
  | 'studyplan'
  | 'examtimetable'
  | 'dailytasks'
  | 'revisionschedule'
  | 'upcomingexams'
  | 'learninghistory'
  | 'visualstudio'
  | 'practicequestions'
  | 'twininsights'
  | 'subjectperf'
  | 'topicmastery'

export type ThemeMode = 'light' | 'dark' | 'customize'
export type DensitySize = 'small' | 'medium' | 'large'
export type Role = 'student' | 'parent' | 'educator'
export type EducationLevel =
  | 'kg'
  | 'lp'
  | 'up'
  | 'hs'
  | 'hss'
  | 'higher'
  | 'other'
  // Legacy values retained for existing demo profiles.
  | 'primary'
  | 'middle'
  | 'highschool'
  | 'highersecondary'
  | 'college'

export interface EducationProfile {
  grade?: string
  stream?: string
  course?: string
  department?: string
  semester?: string
  institution?: string
  customCourse?: string
}

export interface AccessibilityProfile {
  fontSize: 'small' | 'normal' | 'large' | 'xl'
  fontFamily: 'lexend' | 'nunito' | 'system' | 'arial' | 'verdana' | 'atkinson' | 'opendyslexic'
  lineSpacing: 'normal' | 'relaxed' | 'loose'
  wordSpacing: 'normal' | 'wide'
  letterSpacing: 'normal' | 'wide'
  background: 'light' | 'warm' | 'cream' | 'cool'
  contrast: 'normal' | 'high'
  audioEnabled: boolean
  contentWidth?: 'compact' | 'comfortable' | 'wide'
  reducedMotion?: boolean
}

export interface LearningPattern {
  visual: number
  audio: number
  examples: number
  text: number
  stepByStep: number
}

export interface UserProfile {
  name: string
  grade: string
  educationLevel: EducationLevel
  stream?: string
  education?: EducationProfile
  selectedSubjects?: string[]
  role: Role
  avatar?: string
  accessibility: AccessibilityProfile
  learningPattern: LearningPattern
  learningPreferences?: {
    font: 'default' | 'opendyslexic' | 'atkinson'
    learningFormats: string[]
    explanationStyle: string | null
    chunkSize: 'small' | 'medium' | 'full'
    interests: string[]
    interestsCustom: string
    formatSwitching: 'yes' | 'noPreference' | 'askLater'
    onboardingPreferencesDone: boolean
  }
  aiConfidence: number
  streak: number
  lessonsCompleted: number
  understanding: number
  xp?: number
}
