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

export const DEFAULT_LIFTS: Lift[] = []

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "gym",
    name: "Gym",
    color: "#4cc9f0",
    xp: 10,
    hasExercises: true,
    statGains: { str: 2.0, flex: 0.5 },
  },
]

export const DEFAULT_XP_RULES: XpRules = {
  exerciseBonus: 5, exerciseBonusMax: 25,
  prBonus: 25, weeklyBonus: 50, bodyweightLog: 3,
}

export const DEFAULT_SECTIONS: Record<string, boolean> = {
  hero: true, quests: true, training: true,
  todayLog: true, widgets: true,
  attributes: true, muscleBalance: true, bodyweight: true, lifts: true,
  thisWeek: true, heatmap: true, stats: true,
  achievements: true, history: true,
}

export const SECTION_LABELS: Record<string, string> = {
  hero: "Level + belt", quests: "Quests", training: "Training cards",
  todayLog: "Today's log", widgets: "My dashboard",
  attributes: "Attributes (radar)", muscleBalance: "Muscle balance",
  bodyweight: "Bodyweight", lifts: "Strength goals",
  thisWeek: "This week", heatmap: "Year heatmap",
  stats: "Stats", achievements: "Achievements", history: "Recent sessions",
}

export const STAT_DEFS = [
  { key: "str",  name: "STR", label: "Strength",    color: "#ef4444" },
  { key: "flex", name: "FLX", label: "Flexibility", color: "#4cc9f0" },
  { key: "mob",  name: "MOB", label: "Mobility",    color: "#b388ff" },
  { key: "mnd",  name: "MND", label: "Mindfulness", color: "#4ade80" },
  { key: "end",  name: "END", label: "Endurance",   color: "#fb923c" },
]

export const MUSCLE_GROUPS: Record<string, { name: string; color: string }> = {
  chest:      { name: "Chest",      color: "#ef4444" },
  back:       { name: "Back",       color: "#4cc9f0" },
  shoulders:  { name: "Shoulders",  color: "#b388ff" },
  biceps:     { name: "Biceps",     color: "#4ade80" },
  triceps:    { name: "Triceps",    color: "#f472b6" },
  quads:      { name: "Quads",      color: "#fbbf24" },
  hamstrings: { name: "Hamstrings", color: "#fb923c" },
  glutes:     { name: "Glutes",     color: "#a3e635" },
  adductors:  { name: "Adductors",  color: "#60a5fa" },
  abductors:  { name: "Abductors",  color: "#94a3b8" },
}

// primary and secondary muscles per exercise (keys match STRENGTH_STANDARDS)
export const EXERCISE_MUSCLES: Record<string, { primary: string[]; secondary: string[] }> = {
  // ── Barbell ───────────────────────────────────────────────────────────────
  "benchpress":             { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "inclinebenchpress":      { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "declinebenchpress":      { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "closegripbenchpress":    { primary: ["triceps"],            secondary: ["chest", "shoulders"] },
  "smithmachinebenchpress": { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "squat":                  { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "frontsquat":             { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "bulgariansplitsquat":    { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "deadlift":               { primary: ["hamstrings"],         secondary: ["glutes", "back"] },
  "sumodeadlift":           { primary: ["hamstrings"],         secondary: ["glutes", "back", "adductors"] },
  "hexbardeadlift":         { primary: ["hamstrings"],         secondary: ["glutes", "back"] },
  "romaniadeadlift":        { primary: ["hamstrings"],         secondary: ["glutes", "back"] },
  "rdl":                    { primary: ["hamstrings"],         secondary: ["glutes", "back"] },
  "hipthrust":              { primary: ["glutes"],             secondary: ["hamstrings"] },
  "barbellhipthrust":       { primary: ["glutes"],             secondary: ["hamstrings"] },
  "overheadpress":          { primary: ["shoulders"],          secondary: ["triceps"] },
  "shoulderpress":          { primary: ["shoulders"],          secondary: ["triceps"] },
  "militarypress":          { primary: ["shoulders"],          secondary: ["triceps"] },
  "seatedshoulderpress":    { primary: ["shoulders"],          secondary: ["triceps"] },
  "pushpress":              { primary: ["shoulders"],          secondary: ["triceps"] },
  "barbellrow":             { primary: ["back"],               secondary: ["biceps"] },
  "bentoverrow":            { primary: ["back"],               secondary: ["biceps"] },
  "tbarrow":                { primary: ["back"],               secondary: ["biceps"] },
  "barbellshrug":           { primary: ["back"],               secondary: [] },
  "barbellcurl":            { primary: ["biceps"],             secondary: [] },
  "ezbarcurl":              { primary: ["biceps"],             secondary: [] },
  "preachercurl":           { primary: ["biceps"],             secondary: [] },
  "lyingtricepextension":   { primary: ["triceps"],            secondary: [] },
  "skullcrusher":           { primary: ["triceps"],            secondary: [] },
  "powerclean":             { primary: ["back"],               secondary: ["shoulders", "glutes", "hamstrings"] },
  "clean":                  { primary: ["back"],               secondary: ["shoulders", "glutes", "hamstrings"] },
  "cleanandjerk":           { primary: ["back"],               secondary: ["shoulders", "glutes", "hamstrings"] },
  "snatch":                 { primary: ["back"],               secondary: ["shoulders", "glutes", "hamstrings"] },

  // ── Bodyweight ────────────────────────────────────────────────────────────
  "pullup":                 { primary: ["back"],               secondary: ["biceps"] },
  "neutralgrippullup":      { primary: ["back"],               secondary: ["biceps"] },
  "chinup":                 { primary: ["biceps"],             secondary: ["back"] },
  "dip":                    { primary: ["triceps"],            secondary: ["chest", "shoulders"] },
  "muscleup":               { primary: ["back"],               secondary: ["chest", "biceps", "triceps"] },

  // ── Dumbbell ──────────────────────────────────────────────────────────────
  "flatdbbench":            { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "dumbbellbenchpress":     { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "inclinedbbench":         { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "inclinedumbbellbenchpress": { primary: ["chest"],           secondary: ["triceps", "shoulders"] },
  "dbfly":                  { primary: ["chest"],              secondary: [] },
  "dumbbellfly":            { primary: ["chest"],              secondary: [] },
  "dbshoulderpress":        { primary: ["shoulders"],          secondary: ["triceps"] },
  "dumbbellshoulderpress":  { primary: ["shoulders"],          secondary: ["triceps"] },
  "seateddbshoulderpress":  { primary: ["shoulders"],          secondary: ["triceps"] },
  "dblateralraise":         { primary: ["shoulders"],          secondary: [] },
  "dumbbelllateralraise":   { primary: ["shoulders"],          secondary: [] },
  "dbrow":                  { primary: ["back"],               secondary: ["biceps"] },
  "dumbbellrow":            { primary: ["back"],               secondary: ["biceps"] },
  "dbshrug":                { primary: ["back"],               secondary: [] },
  "dumbbellshrug":          { primary: ["back"],               secondary: [] },
  "dbbicepscurl":           { primary: ["biceps"],             secondary: [] },
  "dumbbellcurl":           { primary: ["biceps"],             secondary: [] },
  "hammercurl":             { primary: ["biceps"],             secondary: [] },
  "gobletsquat":            { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "dbbulgariansplitsquat":  { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },

  // ── Machine ───────────────────────────────────────────────────────────────
  "legpress":               { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "sledlegpress":           { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "horizontallegpress":     { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "legextension":           { primary: ["quads"],              secondary: [] },
  "hacksquat":              { primary: ["quads"],              secondary: ["glutes", "hamstrings"] },
  "hamstringcurl":          { primary: ["hamstrings"],         secondary: [] },
  "seatedlegcurl":          { primary: ["hamstrings"],         secondary: [] },
  "lyinglegcurl":           { primary: ["hamstrings"],         secondary: [] },
  "adductormachine":        { primary: ["adductors"],          secondary: [] },
  "hipadduction":           { primary: ["adductors"],          secondary: [] },
  "abductormachine":        { primary: ["abductors"],          secondary: [] },
  "hipabduction":           { primary: ["abductors"],          secondary: [] },
  "abductorglutemedius":    { primary: ["abductors"],          secondary: ["glutes"] },
  "chestpress":             { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "machinechestpress":      { primary: ["chest"],              secondary: ["triceps", "shoulders"] },
  "machinechestfly":        { primary: ["chest"],              secondary: [] },
  "machineshoulderpress":   { primary: ["shoulders"],          secondary: ["triceps"] },
  "machinecalfraise":       { primary: [],                     secondary: [] },
  "calfpress":              { primary: [],                     secondary: [] },

  // ── Cable ─────────────────────────────────────────────────────────────────
  "latpulldown":            { primary: ["back"],               secondary: ["biceps"] },
  "seatedcablerow":         { primary: ["back"],               secondary: ["biceps"] },
  "cablerow":               { primary: ["back"],               secondary: ["biceps"] },
  "tricepspushdown":        { primary: ["triceps"],            secondary: [] },
  "cabletricepspushdown":   { primary: ["triceps"],            secondary: [] },
}

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

export const STRENGTH_LEVELS = [
  { name: "Beginner",     color: "#94a3b8" },
  { name: "Novice",       color: "#4ade80" },
  { name: "Intermediate", color: "#60a5fa" },
  { name: "Advanced",     color: "#b388ff" },
  { name: "Elite",        color: "#fbbf24" },
]

// BW multipliers for estimated 1RM at each level [Beginner, Novice, Intermediate, Advanced, Elite]
// Dumbbell exercises are per-hand weights. Source: strengthlevel.com (80kg male, values ÷ 80)
export const STRENGTH_STANDARDS: Record<string, [number, number, number, number, number]> = {
  // ── Barbell ───────────────────────────────────────────────────────────────
  "benchpress":             [0.66, 0.93, 1.23, 1.59, 1.96],
  "squat":                  [0.90, 1.23, 1.63, 2.08, 2.56],
  "deadlift":               [1.08, 1.45, 1.89, 2.40, 2.94],
  "overheadpress":          [0.41, 0.59, 0.80, 1.05, 1.33],
  "shoulderpress":          [0.41, 0.59, 0.80, 1.05, 1.33],
  "militarypress":          [0.41, 0.59, 0.80, 1.05, 1.33],
  "barbellrow":             [0.50, 0.75, 1.00, 1.25, 1.50],
  "bentoverrow":            [0.50, 0.75, 1.00, 1.25, 1.50],
  "inclinebenchpress":      [0.63, 0.84, 1.10, 1.40, 1.73],
  "declinebenchpress":      [0.70, 0.98, 1.31, 1.69, 2.10],
  "closegripbenchpress":    [0.65, 0.88, 1.14, 1.45, 1.76],
  "smithmachinebenchpress": [0.66, 0.93, 1.24, 1.60, 2.00],
  "frontsquat":             [0.74, 0.99, 1.30, 1.66, 2.04],
  "sumodeadlift":           [1.24, 1.64, 2.13, 2.66, 3.24],
  "hexbardeadlift":         [1.21, 1.60, 2.06, 2.58, 3.13],
  "romaniadeadlift":        [0.60, 0.90, 1.40, 1.90, 2.40],
  "rdl":                    [0.60, 0.90, 1.40, 1.90, 2.40],
  "hipthrust":              [0.70, 1.05, 1.65, 2.25, 2.80],
  "barbellhipthrust":       [0.70, 1.05, 1.65, 2.25, 2.80],
  "seatedshoulderpress":    [0.39, 0.59, 0.86, 1.18, 1.51],
  "powerclean":             [0.63, 0.86, 1.15, 1.48, 1.81],
  "clean":                  [0.69, 0.91, 1.18, 1.49, 1.80],
  "cleanandjerk":           [0.59, 0.84, 1.15, 1.51, 1.90],
  "snatch":                 [0.46, 0.68, 0.95, 1.26, 1.61],
  "pushpress":              [0.49, 0.73, 1.01, 1.35, 1.71],
  "barbellcurl":            [0.24, 0.40, 0.60, 0.84, 1.11],
  "ezbarcurl":              [0.28, 0.43, 0.60, 0.80, 1.04],
  "preachercurl":           [0.23, 0.38, 0.58, 0.81, 1.09],
  "lyingtricepextension":   [0.23, 0.36, 0.55, 0.79, 1.04],
  "skullcrusher":           [0.23, 0.36, 0.55, 0.79, 1.04],
  "barbellshrug":           [0.65, 1.06, 1.61, 2.28, 3.01],
  "tbarrow":                [0.50, 0.78, 1.11, 1.51, 1.95],
  "bulgariansplitsquat":    [0.20, 0.35, 0.55, 0.75, 1.00],

  // ── Bodyweight ────────────────────────────────────────────────────────────
  "pullup":                 [0.10, 0.25, 0.50, 0.75, 1.00],
  "chinup":                 [0.10, 0.25, 0.50, 0.75, 1.00],
  "neutralgrippullup":      [0.10, 0.25, 0.50, 0.75, 1.00],
  "dip":                    [0.00, 0.29, 0.64, 1.04, 1.45],
  "muscleup":               [-0.14, 0.01, 0.19, 0.36, 0.55],

  // ── Dumbbell (per-hand) ───────────────────────────────────────────────────
  "flatdbbench":            [0.23, 0.35, 0.53, 0.73, 0.95],
  "dumbbellbenchpress":     [0.23, 0.35, 0.53, 0.73, 0.95],
  "inclinedbbench":         [0.26, 0.38, 0.50, 0.65, 0.81],
  "inclinedumbbellbenchpress": [0.26, 0.38, 0.50, 0.65, 0.81],
  "dbshoulderpress":        [0.19, 0.28, 0.40, 0.55, 0.71],
  "dumbbellshoulderpress":  [0.19, 0.28, 0.40, 0.55, 0.71],
  "seateddbshoulderpress":  [0.19, 0.28, 0.40, 0.55, 0.71],
  "dbbicepscurl":           [0.09, 0.18, 0.30, 0.46, 0.64],
  "dumbbellcurl":           [0.09, 0.18, 0.30, 0.46, 0.64],
  "dblateralraise":         [0.05, 0.11, 0.20, 0.31, 0.45],
  "dumbbelllateralraise":   [0.05, 0.11, 0.20, 0.31, 0.45],
  "dbrow":                  [0.23, 0.38, 0.55, 0.76, 1.01],
  "dumbbellrow":            [0.23, 0.38, 0.55, 0.76, 1.01],
  "hammercurl":             [0.13, 0.20, 0.30, 0.43, 0.56],
  "gobletsquat":            [0.19, 0.34, 0.55, 0.81, 1.10],
  "dbfly":                  [0.09, 0.18, 0.30, 0.46, 0.65],
  "dumbbellfly":            [0.09, 0.18, 0.30, 0.46, 0.65],
  "dbshrug":                [0.21, 0.38, 0.59, 0.86, 1.16],
  "dumbbellshrug":          [0.21, 0.38, 0.59, 0.86, 1.16],
  "dbbulgariansplitsquat":  [0.20, 0.35, 0.55, 0.75, 1.00],

  // ── Machine ───────────────────────────────────────────────────────────────
  "legpress":               [1.21, 1.91, 2.81, 3.89, 5.08],
  "sledlegpress":           [1.21, 1.91, 2.81, 3.89, 5.08],
  "horizontallegpress":     [1.03, 1.65, 2.46, 3.45, 4.54],
  "legextension":           [0.50, 0.81, 1.24, 1.75, 2.33],
  "hacksquat":              [0.73, 1.25, 1.94, 2.79, 3.75],
  "hamstringcurl":          [0.30, 0.45, 0.60, 0.80, 1.00],
  "seatedlegcurl":          [0.40, 0.68, 1.01, 1.44, 1.90],
  "lyinglegcurl":           [0.33, 0.54, 0.83, 1.18, 1.56],
  "adductormachine":        [0.45, 0.85, 1.40, 2.09, 2.88],
  "hipadduction":           [0.45, 0.85, 1.40, 2.09, 2.88],
  "abductormachine":        [0.30, 0.45, 0.65, 0.85, 1.10],
  "hipabduction":           [0.30, 0.45, 0.65, 0.85, 1.10],
  "abductorglutemedius":    [0.30, 0.45, 0.65, 0.85, 1.10],
  "chestpress":             [0.46, 0.76, 1.15, 1.63, 2.16],
  "machinechestpress":      [0.46, 0.76, 1.15, 1.63, 2.16],
  "machineshoulderpress":   [0.35, 0.61, 0.98, 1.40, 1.90],
  "machinechestfly":        [0.48, 0.75, 1.11, 1.54, 2.00],
  "machinecalfraise":       [0.46, 0.98, 1.73, 2.68, 3.79],
  "calfpress":              [0.46, 0.98, 1.73, 2.68, 3.79],

  // ── Cable ─────────────────────────────────────────────────────────────────
  "latpulldown":            [0.40, 0.60, 0.80, 1.00, 1.25],
  "seatedcablerow":         [0.40, 0.60, 0.85, 1.10, 1.35],
  "cablerow":               [0.40, 0.60, 0.85, 1.10, 1.35],
  "tricepspushdown":        [0.20, 0.30, 0.45, 0.60, 0.75],
  "cabletricepspushdown":   [0.20, 0.30, 0.45, 0.60, 0.75],
}

export interface ExerciseCatalogEntry {
  name: string
  equipment: "Barbell" | "Bodyweight" | "Dumbbell" | "Machine" | "Cable"
  suggestCat: "lower" | "upper" | "other"
}

export const EXERCISE_CATALOG: ExerciseCatalogEntry[] = [
  // ── Barbell ───────────────────────────────────────────────────────────────
  { name: "Bench Press",                   equipment: "Barbell",    suggestCat: "upper" },
  { name: "Incline Bench Press",           equipment: "Barbell",    suggestCat: "upper" },
  { name: "Decline Bench Press",           equipment: "Barbell",    suggestCat: "upper" },
  { name: "Close Grip Bench Press",        equipment: "Barbell",    suggestCat: "upper" },
  { name: "Smith Machine Bench Press",     equipment: "Barbell",    suggestCat: "upper" },
  { name: "Squat",                         equipment: "Barbell",    suggestCat: "lower" },
  { name: "Front Squat",                   equipment: "Barbell",    suggestCat: "lower" },
  { name: "Deadlift",                      equipment: "Barbell",    suggestCat: "lower" },
  { name: "Sumo Deadlift",                 equipment: "Barbell",    suggestCat: "lower" },
  { name: "Hex Bar Deadlift",              equipment: "Barbell",    suggestCat: "lower" },
  { name: "Romanian Deadlift",             equipment: "Barbell",    suggestCat: "lower" },
  { name: "Hip Thrust",                    equipment: "Barbell",    suggestCat: "lower" },
  { name: "Bulgarian Split Squat",         equipment: "Barbell",    suggestCat: "lower" },
  { name: "Overhead Press",               equipment: "Barbell",    suggestCat: "upper" },
  { name: "Seated Shoulder Press",         equipment: "Barbell",    suggestCat: "upper" },
  { name: "Push Press",                    equipment: "Barbell",    suggestCat: "upper" },
  { name: "Barbell Row",                   equipment: "Barbell",    suggestCat: "upper" },
  { name: "T-Bar Row",                     equipment: "Barbell",    suggestCat: "upper" },
  { name: "Barbell Curl",                  equipment: "Barbell",    suggestCat: "upper" },
  { name: "EZ Bar Curl",                   equipment: "Barbell",    suggestCat: "upper" },
  { name: "Preacher Curl",                 equipment: "Barbell",    suggestCat: "upper" },
  { name: "Lying Tricep Extension",        equipment: "Barbell",    suggestCat: "upper" },
  { name: "Barbell Shrug",                 equipment: "Barbell",    suggestCat: "upper" },
  { name: "Power Clean",                   equipment: "Barbell",    suggestCat: "other" },
  { name: "Clean",                         equipment: "Barbell",    suggestCat: "other" },
  { name: "Clean and Jerk",               equipment: "Barbell",    suggestCat: "other" },
  { name: "Snatch",                        equipment: "Barbell",    suggestCat: "other" },
  // ── Bodyweight ────────────────────────────────────────────────────────────
  { name: "Pull Up",                       equipment: "Bodyweight", suggestCat: "upper" },
  { name: "Chin Up",                       equipment: "Bodyweight", suggestCat: "upper" },
  { name: "Neutral Grip Pull Up",          equipment: "Bodyweight", suggestCat: "upper" },
  { name: "Dip",                           equipment: "Bodyweight", suggestCat: "upper" },
  { name: "Muscle Up",                     equipment: "Bodyweight", suggestCat: "upper" },
  // ── Dumbbell ──────────────────────────────────────────────────────────────
  { name: "Dumbbell Bench Press",          equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Incline Dumbbell Bench Press",  equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Dumbbell Shoulder Press",       equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Seated DB Shoulder Press",      equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Dumbbell Lateral Raise",        equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Dumbbell Row",                  equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Dumbbell Curl",                 equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Hammer Curl",                   equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Dumbbell Fly",                  equipment: "Dumbbell",   suggestCat: "upper" },
  { name: "Goblet Squat",                  equipment: "Dumbbell",   suggestCat: "lower" },
  { name: "DB Bulgarian Split Squat",      equipment: "Dumbbell",   suggestCat: "lower" },
  { name: "Dumbbell Shrug",               equipment: "Dumbbell",   suggestCat: "upper" },
  // ── Machine ───────────────────────────────────────────────────────────────
  { name: "Leg Press",                     equipment: "Machine",    suggestCat: "lower" },
  { name: "Horizontal Leg Press",          equipment: "Machine",    suggestCat: "lower" },
  { name: "Leg Extension",                 equipment: "Machine",    suggestCat: "lower" },
  { name: "Hack Squat",                    equipment: "Machine",    suggestCat: "lower" },
  { name: "Seated Leg Curl",               equipment: "Machine",    suggestCat: "lower" },
  { name: "Lying Leg Curl",                equipment: "Machine",    suggestCat: "lower" },
  { name: "Hamstring Curl",               equipment: "Machine",    suggestCat: "lower" },
  { name: "Hip Adduction",                 equipment: "Machine",    suggestCat: "lower" },
  { name: "Hip Abduction",                 equipment: "Machine",    suggestCat: "lower" },
  { name: "Chest Press",                   equipment: "Machine",    suggestCat: "upper" },
  { name: "Machine Shoulder Press",        equipment: "Machine",    suggestCat: "upper" },
  { name: "Machine Chest Fly",             equipment: "Machine",    suggestCat: "upper" },
  { name: "Machine Calf Raise",            equipment: "Machine",    suggestCat: "lower" },
  // ── Cable ─────────────────────────────────────────────────────────────────
  { name: "Lat Pulldown",                  equipment: "Cable",      suggestCat: "upper" },
  { name: "Seated Cable Row",              equipment: "Cable",      suggestCat: "upper" },
  { name: "Triceps Pushdown",              equipment: "Cable",      suggestCat: "upper" },
]

// Re-exported pure functions used by ACHIEVEMENTS (to avoid circular deps)
import { dayStreak, xpToLevel, prCount, bodyweightGoalHit, weekVolumeCheck, hasAllThreeInWeek } from "./game-logic"
