import type { AppState, ActivityType, Category, Lift, XpRules } from "./types"

export const BELTS = [
  { lvl: 1,  name: "White Belt",  color: "#ffffff", stripe: "#000000" },
  { lvl: 5,  name: "Blue Belt",   color: "#3b82f6", stripe: "#000000" },
  { lvl: 10, name: "Purple Belt", color: "#a855f7", stripe: "#000000" },
  { lvl: 18, name: "Brown Belt",  color: "#92400e", stripe: "#000000" },
  { lvl: 28, name: "Black Belt",  color: "#0a0a0a", stripe: "#dc2626" },
  { lvl: 40, name: "Coral Belt",  color: "#ef4444", stripe: "#ffffff" },
  { lvl: 55, name: "Red Belt",    color: "#b91c1c", stripe: "#fbbf24" },
]

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "lower", name: "Lower Body" },
  { id: "upper", name: "Upper Body" },
  { id: "other", name: "Other" },
]

export const DEFAULT_LIFTS: Lift[] = [
  { id: "rdl",        name: "RDL",                   cat: "lower", current: 0,  goal: 95,  targetReps: 6, history: [] },
  { id: "hipthrust",  name: "Hip Thrust",            cat: "lower", current: 0,  goal: 170, targetReps: 6, history: [] },
  { id: "bss",        name: "Bulgarian Split Squat", cat: "lower", current: 0,  goal: 31,  targetReps: 8, note: "per hand", history: [] },
  { id: "legpress",   name: "Leg Press",             cat: "lower", current: 0,  goal: 300, targetReps: 8, history: [] },
  { id: "hamcurl",    name: "Hamstring Curl",        cat: "lower", current: 0,  goal: 50,  targetReps: 10, history: [] },
  { id: "adductor",   name: "Adductor Machine",      cat: "lower", current: 0,  goal: 60,  targetReps: 10, history: [] },
  { id: "abductor",   name: "Abductor / Glute Med",  cat: "lower", current: 0,  goal: 45,  targetReps: 10, history: [] },
  { id: "flatdb",     name: "Flat DB Bench",         cat: "upper", current: 0,  goal: 37,  targetReps: 6, note: "per hand", history: [] },
  { id: "inclinedb",  name: "Incline DB Bench",      cat: "upper", current: 25, goal: 32,  targetReps: 6, note: "per hand", history: [{ ts: Date.now(), weight: 25, reps: 6 }] },
  { id: "latpull",    name: "Lat Pulldown",          cat: "upper", current: 0,  goal: 80,  targetReps: 8, history: [] },
  { id: "cablerow",   name: "Seated Cable Row",      cat: "upper", current: 0,  goal: 65,  targetReps: 8, history: [] },
  { id: "dbshoulder", name: "DB Shoulder Press",     cat: "upper", current: 0,  goal: 26,  targetReps: 8, note: "per hand", history: [] },
  { id: "dbcurl",     name: "DB Biceps Curl",        cat: "upper", current: 0,  goal: 15,  targetReps: 10, note: "per hand", history: [] },
  { id: "tripush",    name: "Triceps Pushdown",      cat: "upper", current: 0,  goal: 40,  targetReps: 10, history: [] },
]

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "gym",
    name: "Gym",
    color: "#4cc9f0",
    xp: 10,
    hasExercises: true,
    statGains: { str: 2.0, flex: 0.5 },
  },
  {
    id: "bjj",
    name: "BJJ",
    color: "#b388ff",
    xp: 15,
    hasExercises: false,
    statGains: { mob: 2.0, flex: 1.0 },
  },
  {
    id: "mma",
    name: "MMA",
    color: "#ff7043",
    xp: 20,
    hasExercises: false,
    statGains: { flex: 2.0, mob: 1.0, str: 0.5 },
  },
]

export const DEFAULT_XP_RULES: XpRules = {
  exerciseBonus: 5, exerciseBonusMax: 25,
  prBonus: 25, weeklyBonus: 50, bodyweightLog: 3,
}

export const DEFAULT_SECTIONS: Record<string, boolean> = {
  hero: true, quests: true, training: true,
  todayLog: true, widgets: true,
  attributes: true, bodyweight: true, lifts: true,
  thisWeek: true, heatmap: true, stats: true,
  achievements: true, history: true,
}

export const SECTION_LABELS: Record<string, string> = {
  hero: "Level + belt", quests: "Quests", training: "Training cards",
  todayLog: "Today's log", widgets: "My dashboard",
  attributes: "Attributes (radar)", bodyweight: "Bodyweight",
  lifts: "Strength goals", thisWeek: "This week", heatmap: "Year heatmap",
  stats: "Stats", achievements: "Achievements", history: "Recent sessions",
}

export const STAT_DEFS = [
  { key: "str", name: "STR", label: "Strength",     color: "#ef4444" },
  { key: "flex", name: "FLX", label: "Flexibility",  color: "#4cc9f0" },
  { key: "mob", name: "MOB", label: "Mobility",      color: "#b388ff" },
  { key: "mnd", name: "MND", label: "Mindfulness",   color: "#4ade80" },
]

export const STAT_METRIC_KEYS = [
  "level", "totalXp", "beltName", "totalSessions", "sessionsWeek",
  "sessionsMonth", "dayStreak", "weekGoalStreak", "totalPrs", "prsWeek",
  "volumeWeek", "volumeTotal", "achievementsUnlocked", "questsCompleted",
  "weeklyQuestsCompleted", "comboMultiplier", "bodyweightCurrent",
  "bodyweightGoal", "bodyweight30dChange", "averagePerWeek",
]

export const ACHIEVEMENTS = [
  { id: "first",     name: "First Steps",      icon: "👣", desc: "Log your first session",       check: (s: AppState) => s.sessions.length >= 1 },
  { id: "gym10",     name: "Iron Will",        icon: "💪", desc: "10 gym sessions",              check: (s: AppState) => s.sessions.filter(x => x.type === "gym").length >= 10 },
  { id: "bjj10",     name: "Mat Time",         icon: "🥋", desc: "10 BJJ sessions",              check: (s: AppState) => s.sessions.filter(x => x.type === "bjj").length >= 10 },
  { id: "mma10",     name: "Cage Ready",       icon: "🥊", desc: "10 MMA sessions",              check: (s: AppState) => s.sessions.filter(x => x.type === "mma").length >= 10 },
  { id: "triple",    name: "Triple Threat",    icon: "⚡", desc: "3+ disciplines in one week",   check: (s: AppState) => hasAllThreeInWeek(s) },
  { id: "week1",     name: "Week Crusher",     icon: "🎯", desc: "Hit all weekly goals once",     check: (s: AppState) => s.weeksGoalsHit >= 1 },
  { id: "streak5",   name: "On Fire",          icon: "🔥", desc: "5-day training streak",         check: (s: AppState) => dayStreak(s) >= 5 },
  { id: "streak10",  name: "Relentless",       icon: "⚔️", desc: "10-day training streak",        check: (s: AppState) => dayStreak(s) >= 10 },
  { id: "total50",   name: "Half Century",     icon: "🏅", desc: "50 total sessions",             check: (s: AppState) => s.sessions.length >= 50 },
  { id: "total100",  name: "Centurion",        icon: "🏆", desc: "100 total sessions",            check: (s: AppState) => s.sessions.length >= 100 },
  { id: "lvl5",      name: "Bluebelt",         icon: "🔵", desc: "Reach Blue Belt (Lvl 5)",       check: (s: AppState) => xpToLevel(s.xp) >= 5 },
  { id: "lvl10",     name: "Purplebelt",       icon: "🟣", desc: "Reach Purple Belt (Lvl 10)",    check: (s: AppState) => xpToLevel(s.xp) >= 10 },
  { id: "quest5",    name: "Quester",          icon: "📜", desc: "Complete 5 daily quests",       check: (s: AppState) => (s.questsDone || 0) >= 5 },
  { id: "pr1",       name: "First PR",         icon: "📈", desc: "Hit your first PR",             check: (s: AppState) => prCount(s) >= 1 },
  { id: "pr5",       name: "PR Hunter",        icon: "🎯", desc: "Set 5 PRs",                     check: (s: AppState) => prCount(s) >= 5 },
  { id: "pr20",      name: "PR Machine",       icon: "🚀", desc: "Set 20 PRs",                    check: (s: AppState) => prCount(s) >= 20 },
  { id: "goalbw",    name: "Body Goals",       icon: "⚖️", desc: "Hit your bodyweight goal",      check: (s: AppState) => bodyweightGoalHit(s) },
  { id: "goallift1", name: "Strong Like Bull", icon: "🐂", desc: "Hit a strength goal",           check: (s: AppState) => s.lifts.some(l => l.current >= l.goal && l.goal > 0) },
  { id: "vol1k",     name: "Volume King",      icon: "🏋️", desc: "5000kg volume in one week",    check: (s: AppState) => weekVolumeCheck(s) >= 5000 },
  { id: "balanced",  name: "Well-Rounded",     icon: "⚖️", desc: "All attributes ≥ 25",           check: (s: AppState) => Object.values(s.stats || {}).every(v => v >= 25) },
  { id: "maxstat",   name: "Specialist",       icon: "💎", desc: "Any attribute ≥ 75",            check: (s: AppState) => Object.values(s.stats || {}).some(v => v >= 75) },
]

export const DAILY_QUESTS = [
  { id: "any",    desc: "Train any discipline today",      xp: 10, predicate: (t: AppState["sessions"]) => t.length >= 1 },
  { id: "gym",    desc: "Get a gym session in today",      xp: 15, predicate: (t: AppState["sessions"]) => t.some(s=>s.type==="gym") },
  { id: "bjj",    desc: "Roll on the mats today (BJJ)",    xp: 20, predicate: (t: AppState["sessions"]) => t.some(s=>s.type==="bjj") },
  { id: "mma",    desc: "Throw hands today (MMA session)", xp: 25, predicate: (t: AppState["sessions"]) => t.some(s=>s.type==="mma") },
  { id: "double", desc: "Log 2 sessions today",            xp: 30, predicate: (t: AppState["sessions"]) => t.length >= 2 },
  { id: "combo",  desc: "Two different disciplines today", xp: 25, predicate: (t: AppState["sessions"]) => new Set(t.map(s=>s.type)).size >= 2 },
]

export const WEEKLY_QUESTS = [
  { id: "pr3",       desc: "Hit 3 PRs this week",          xp: 100, total: 3,    metric: "prs",         unit: "" },
  { id: "train5",    desc: "Train 5 days this week",       xp: 75,  total: 5,    metric: "days",        unit: "" },
  { id: "vol3000",   desc: "Lift 3000kg total volume",     xp: 90,  total: 3000, metric: "volume",      unit: "kg" },
  { id: "alldisc",   desc: "3+ disciplines this week",     xp: 60,  total: 3,    metric: "disciplines", unit: "" },
  { id: "sess7",     desc: "Log 7 sessions this week",     xp: 90,  total: 7,    metric: "sessions",    unit: "" },
  { id: "exercises", desc: "Log 10 exercises in detail",   xp: 70,  total: 10,   metric: "exercises",   unit: "" },
]

// Re-exported pure functions used by ACHIEVEMENTS (to avoid circular deps)
import { dayStreak, xpToLevel, prCount, bodyweightGoalHit, weekVolumeCheck, hasAllThreeInWeek } from "./game-logic"
