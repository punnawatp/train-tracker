export interface Session {
  id: number
  type: string
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

export interface BodyfatEntry {
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
  exerciseBonus: number
  exerciseBonusMax: number
  prBonus: number
  weeklyBonus: number
  bodyweightLog: number
}

export interface Stats {
  str: number
  flex: number
  mob: number
  mnd: number
  end: number
}

export interface ActivityType {
  id: string
  name: string
  color: string
  xp: number
  statGains: Partial<Record<keyof Stats, number>>
  hasExercises?: boolean
}

export interface AppState {
  targets: Record<string, number>
  activityTypes: ActivityType[]
  sessions: Session[]
  xp: number
  weeksGoalsHit: number
  weekKeysCounted: string[]
  unlocked: Record<string, number>
  questsDone: number
  lastQuestCompletedDate: string | null
  weeklyQuestsDone: number
  lastWeeklyQuestWeek: string | null
  bodyweight: { goal: number | null; history: BodyweightEntry[]; bodyfat: { goal: number | null; history: BodyfatEntry[] } }
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
