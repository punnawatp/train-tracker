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
  ui: { sectionsVisible: Record<string, boolean>; theme: "dark" | "light" }
  dailyQuests: UserDailyQuest[]
  weeklyQuests: UserWeeklyQuest[]
  dailyCompletions: Record<string, string[]>
  weeklyCompletions: Record<string, string[]>
  gold: number
  inventory: Record<string, number>
  activeEffects: Record<string, number>
  currentBoss: { idx: number; hp: number } | null
  bossKills: Record<number, number>
  equipped: { weapon: string|null; helmet: string|null; armor: string|null; ring: string|null }
  gear: Record<string, number>
}

export interface GearItem {
  id: string
  name: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  slot: "weapon" | "helmet" | "armor" | "ring"
}

export type QuestCheckType = "manual" | "any_session" | "activity_session"
export type WeeklyMetric = "days" | "sessions" | "activity_sessions" | "prs" | "daily_completions"

export interface UserDailyQuest {
  id: string
  desc: string
  xp: number
  checkType: QuestCheckType
  activityId?: string
}

export interface UserWeeklyQuest {
  id: string
  desc: string
  xp: number
  metric: WeeklyMetric
  target: number
  activityId?: string
}

export type Toast = {
  id: string
  title: string
  body: string
  sub?: string
  kind?: "xp"
}

export interface ShopItem {
  id: string
  name: string
  icon: string
  desc: string
  cost: number
  effect: "dmg_boost" | "gold_boost" | "instant_xp"
  value: number
}
