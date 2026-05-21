export interface Session {
  id: number
  type: "gym" | "bjj" | "mma"
  ts: number
  xpAwarded: number
  exercises: Exercise[]
  note: string
}

export interface Exercise {
  name: string
  weight: number
  reps: number
  sets: number
}

export interface LiftHistoryEntry {
  ts: number
  weight: number
  reps: number
}

export interface Lift {
  id: string
  name: string
  cat: string
  current: number
  goal: number
  targetReps: number
  note?: string
  history: LiftHistoryEntry[]
}

export interface Category {
  id: string
  name: string
}

export interface BodyweightEntry {
  ts: number
  value: number
}

export type WidgetType = "stat" | "lift" | "attribute" | "note"

export interface Widget {
  id: string
  type: WidgetType
  config: {
    metric?: string
    title?: string
    liftId?: string
    statKey?: string
    text?: string
  }
}

export interface XpRules {
  gym: number
  bjj: number
  mma: number
  exerciseBonus: number
  exerciseBonusMax: number
  prBonus: number
  weeklyBonus: number
  bodyweightLog: number
}

export interface Stats {
  str: number
  con: number
  tec: number
  dis: number
}

export interface AppState {
  targets: { gym: number; bjj: number; mma: number }
  sessions: Session[]
  xp: number
  weeksGoalsHit: number
  weekKeysCounted: string[]
  unlocked: Record<string, number>
  questsDone: number
  lastQuestCompletedDate: string | null
  weeklyQuestsDone: number
  lastWeeklyQuestWeek: string | null
  bodyweight: { goal: number | null; history: BodyweightEntry[] }
  categories: Category[]
  lifts: Lift[]
  stats: Stats
  xpRules: XpRules
  widgets: Widget[]
  ui: { sectionsVisible: Record<string, boolean> }
}

export type Toast = {
  id: string
  title: string
  body: string
  sub?: string
  kind?: "xp"
}
