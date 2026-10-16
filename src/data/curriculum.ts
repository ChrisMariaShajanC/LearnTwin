import type { EducationLevel, UserProfile } from "../types"

export interface SubjectDefinition {
  id: string
  name: string
  icon: string
  color: string
  chapters: string[]
  selected?: boolean
  custom?: boolean
}

const C = {
  teal: "#4ECDC4",
  indigo: "#6366F1",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  purple: "#8B5CF6",
  blue: "#3B82F6",
}

function subject(name: string, icon: string, color: string, chapters: string[]): SubjectDefinition {
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, icon, color, chapters }
}

const catalog: Record<string, SubjectDefinition[]> = {
  kg: [
    subject("Language and Letters", "Aa", C.indigo, ["Letter sounds", "Simple words", "Picture reading"]),
    subject("Numbers", "123", C.teal, ["Counting", "Comparing", "Simple addition"]),
    subject("Shapes and Colors", "◇", C.amber, ["Basic shapes", "Patterns", "Colors"]),
    subject("Environmental Awareness", "○", C.green, ["My family", "Animals", "Our surroundings"]),
    subject("Stories and Rhymes", "♪", C.purple, ["Rhymes", "Short stories", "Story sequencing"]),
  ],
  lp: [
    subject("English", "EN", C.indigo, ["Reading", "Grammar", "Writing", "Stories"]),
    subject("Malayalam", "ML", C.purple, ["Reading", "Grammar", "Writing"]),
    subject("Mathematics", "∑", C.teal, ["Numbers", "Addition and subtraction", "Multiplication", "Shapes"]),
    subject("Environmental Studies", "EV", C.green, ["Living things", "Our environment", "Health and safety"]),
    subject("Hindi", "HI", C.amber, ["Letters", "Words", "Simple sentences"]),
  ],
  up: [
    subject("English", "EN", C.indigo, ["Prose", "Poetry", "Grammar", "Writing"]),
    subject("Malayalam", "ML", C.purple, ["Prose", "Poetry", "Grammar"]),
    subject("Mathematics", "∑", C.teal, ["Fractions", "Algebra basics", "Geometry", "Data handling"]),
    subject("Basic Science", "SC", C.green, ["Living world", "Matter", "Force and energy", "Earth science"]),
    subject("Social Science", "SS", C.amber, ["History", "Geography", "Civics"]),
    subject("Information Technology", "IT", C.blue, ["Digital literacy", "Documents", "Coding basics"]),
  ],
  hs: [
    subject("English", "EN", C.indigo, ["Reading comprehension", "Literature", "Grammar", "Writing"]),
    subject("Malayalam", "ML", C.purple, ["Literature", "Grammar", "Composition"]),
    subject("Mathematics", "∑", C.teal, ["Real numbers", "Algebra", "Geometry", "Trigonometry", "Statistics"]),
    subject("Physics", "PH", C.rose, ["Motion", "Force", "Work and energy", "Electricity", "Light"]),
    subject("Chemistry", "CH", C.amber, ["Matter", "Atoms and molecules", "Chemical reactions", "Acids and bases"]),
    subject("Biology", "BI", C.green, ["Cells", "Life processes", "Genetics", "Environment"]),
    subject("Social Science", "SS", C.purple, ["History", "Geography", "Political science", "Economics"]),
    subject("Computer Science", "CS", C.blue, ["Computing systems", "Programming", "Networks"]),
  ],
}

const hssByStream: Record<string, SubjectDefinition[]> = {
  science: [
    subject("Physics", "PH", C.rose, ["Units and measurements", "Mechanics", "Thermodynamics", "Waves", "Electricity"]),
    subject("Chemistry", "CH", C.amber, ["Atomic structure", "Chemical bonding", "Thermodynamics", "Organic chemistry"]),
    subject("Mathematics", "∑", C.teal, ["Sets and functions", "Algebra", "Calculus", "Vectors", "Probability"]),
    subject("Biology", "BI", C.green, ["Cell biology", "Plant physiology", "Human physiology", "Genetics", "Ecology"]),
    subject("Computer Science", "CS", C.blue, ["Python", "Data structures", "Databases", "Networks"]),
    subject("English", "EN", C.indigo, ["Literature", "Communication", "Writing"]),
  ],
  commerce: [
    subject("Accountancy", "AC", C.teal, ["Accounting basics", "Journal and ledger", "Financial statements"]),
    subject("Business Studies", "BS", C.indigo, ["Business environment", "Management", "Marketing"]),
    subject("Economics", "EC", C.amber, ["Microeconomics", "Macroeconomics", "Statistics"]),
    subject("Mathematics", "∑", C.green, ["Functions", "Calculus", "Statistics"]),
    subject("English", "EN", C.purple, ["Literature", "Communication", "Writing"]),
  ],
  humanities: [
    subject("History", "HI", C.amber, ["World history", "Indian history", "Contemporary history"]),
    subject("Political Science", "PS", C.indigo, ["Political theory", "Indian constitution", "World politics"]),
    subject("Economics", "EC", C.green, ["Microeconomics", "Macroeconomics", "Indian economy"]),
    subject("Geography", "GE", C.teal, ["Physical geography", "Human geography", "India"]),
    subject("Sociology", "SO", C.purple, ["Society", "Institutions", "Social change"]),
    subject("English", "EN", C.blue, ["Literature", "Communication", "Writing"]),
  ],
}

const higherByCourse: Record<string, SubjectDefinition[]> = {
  "b.tech": [
    subject("Engineering Mathematics", "∑", C.teal, ["Linear algebra", "Calculus", "Differential equations"]),
    subject("Programming Fundamentals", "PF", C.indigo, ["Problem solving", "Programming basics", "Functions"]),
    subject("Digital Electronics", "DE", C.amber, ["Number systems", "Logic gates", "Combinational circuits"]),
    subject("Data Structures", "DS", C.green, ["Arrays", "Linked lists", "Trees", "Graphs"]),
    subject("Computer Networks", "CN", C.blue, ["Network models", "Routing", "Application protocols"]),
  ],
  bca: [
    subject("Programming in C", "C", C.indigo, ["Basics", "Functions", "Pointers", "Files"]),
    subject("Database Systems", "DB", C.teal, ["Data models", "SQL", "Normalization"]),
    subject("Web Technology", "WEB", C.blue, ["HTML and CSS", "JavaScript", "Web applications"]),
  ],
  bcom: [
    subject("Financial Accounting", "FA", C.teal, ["Accounting principles", "Final accounts", "Cash flow"]),
    subject("Business Economics", "BE", C.amber, ["Demand", "Production", "Markets"]),
    subject("Taxation", "TX", C.indigo, ["Income tax", "GST", "Tax planning"]),
  ],
  bba: [
    subject("Principles of Management", "PM", C.indigo, ["Planning", "Organizing", "Leadership"]),
    subject("Marketing Management", "MM", C.rose, ["Consumer behavior", "Marketing mix", "Digital marketing"]),
    subject("Business Finance", "BF", C.green, ["Financial statements", "Investment", "Working capital"]),
  ],
}

function normalizeLevel(level: EducationLevel): string {
  const legacy: Record<string, string> = {
    primary: "lp",
    middle: "up",
    highschool: "hs",
    highersecondary: "hss",
    college: "higher",
  }
  return legacy[level] || level
}

export function suggestedSubjects(user: UserProfile): SubjectDefinition[] {
  const level = normalizeLevel(user.educationLevel)
  if (level === "hss") {
    const stream = (user.education?.stream || user.stream || "science").toLowerCase()
    return hssByStream[stream] || hssByStream.science
  }
  if (level === "higher" || level === "other") {
    const course = (user.education?.course || user.education?.customCourse || "b.tech").toLowerCase()
    return higherByCourse[course] || [
      subject("Core Subject", "01", C.teal, ["Unit 1", "Unit 2", "Unit 3"]),
      subject("Elective", "02", C.indigo, ["Module 1", "Module 2", "Module 3"]),
    ]
  }
  return catalog[level] || catalog.hs
}

export function educationLabel(user: UserProfile): string {
  const e = user.education
  if (e?.course) {
    return [e.course, e.department, e.semester, e.institution].filter(Boolean).join(" · ")
  }
  return [e?.grade || user.grade, e?.stream || user.stream].filter(Boolean).join(" · ")
}
