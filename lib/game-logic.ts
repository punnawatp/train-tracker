import type { ActivityType, AppState, Session, Stats, UserDailyQuest, UserWeeklyQuest } from "./types"
import { BELTS, DAILY_QUESTS, STRENGTH_LEVELS, STRENGTH_STANDARDS, WEEKLY_QUESTS } from "./constants"

// ── Date helpers ─────────────────────────────────────────────────────────────

export function startOfWeek(d = new Date()): Date {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  const day = dt.getDay()
  dt.setDate(dt.getDate() + (day === 0 ? -6 : 1 - day))
  return dt
}

export function endOfWeek(d = new Date()): Date {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(e.getDate() + 7)
  return e
}

export function weekKey(d = new Date()): string {
  const s = startOfWeek(d)
  return `${s.getFullYear()}-${s.getMonth() + 1}-${s.getDate()}`
}

export function dayKey(d: Date | number): string {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function fmtDateLong(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

// ── Session helpers ───────────────────────────────────────────────────────────

export function thisWeekSessions(sessions: Session[]): Session[] {
  const start = startOfWeek().getTime()
  const end = endOfWeek().getTime()
  return sessions.filter(s => s.ts >= start && s.ts < end)
}

export function todaySessions(sessions: Session[]): Session[] {
  const dk = dayKey(new Date())
  return sessions.filter(s => dayKey(s.ts) === dk)
}

export function countByType(sessions: Session[]): Record<string, number> {
  return sessions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function sessionVolume(sess: Session): number {
  if (!sess.exercises) return 0
  return sess.exercises.reduce((sum, e) => sum + (e.weight || 0) * (e.reps || 0) * (e.sets || 0), 0)
}

export function weekVolume(sessions: Session[]): number {
  const start = startOfWeek().getTime()
  const end = endOfWeek().getTime()
  return sessions
    .filter(s => s.ts >= start && s.ts < end && s.exercises && s.exercises.length > 0)
    .reduce((a, s) => a + sessionVolume(s), 0)
}

export function weekVolumeCheck(state: AppState): number {
  return weekVolume(state.sessions)
}

// ── Streak / achievement helpers ──────────────────────────────────────────────

export function dayStreak(state: AppState): number {
  const days = new Set(state.sessions.map(x => dayKey(x.ts)))
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1)
  while (days.has(dayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function hasAllThreeInWeek(state: AppState): boolean {
  const buckets: Record<string, Set<string>> = {}
  for (const sess of state.sessions) {
    const k = weekKey(new Date(sess.ts))
    if (!buckets[k]) buckets[k] = new Set()
    buckets[k].add(sess.type)
  }
  return Object.values(buckets).some(set => set.size >= 3)
}

export function prCount(state: AppState): number {
  let n = 0
  for (const lift of state.lifts) {
    let best = 0
    const sorted = [...(lift.history || [])].sort((a, b) => a.ts - b.ts)
    for (const h of sorted) {
      if (h.reps >= (lift.targetReps || 8) && h.weight > best) {
        n++
        best = h.weight
      }
    }
  }
  return n
}

export function prsThisWeek(state: AppState): number {
  const start = startOfWeek().getTime()
  let n = 0
  for (const lift of state.lifts) {
    let best = 0
    const sorted = [...(lift.history || [])].sort((a, b) => a.ts - b.ts)
    for (const h of sorted) {
      if (h.reps >= (lift.targetReps || 8) && h.weight > best) {
        if (h.ts >= start) n++
        best = h.weight
      }
    }
  }
  return n
}

export function bodyweightGoalHit(state: AppState): boolean {
  if (!state.bodyweight.goal || state.bodyweight.history.length === 0) return false
  const last = state.bodyweight.history[state.bodyweight.history.length - 1].value
  const first = state.bodyweight.history[0].value
  if (state.bodyweight.goal > first) return last >= state.bodyweight.goal
  if (state.bodyweight.goal < first) return last <= state.bodyweight.goal
  return false
}

export function bwChange(state: AppState, days: number): number | null {
  const hist = state.bodyweight.history
  if (hist.length < 2) return null
  const cutoff = Date.now() - days * 86400000
  const past = hist.filter(h => h.ts >= cutoff)
  if (past.length < 2) return null
  return past[past.length - 1].value - past[0].value
}

// ── XP / level / belt ─────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  let total = 0
  for (let n = 1; n < level; n++) total += 50 + n * 50
  return total
}

export function xpToLevel(xp: number): number {
  let lvl = 1
  while (xp >= xpForLevel(lvl + 1)) lvl++
  return lvl
}

export function levelProgress(xp: number) {
  const lvl = xpToLevel(xp)
  const cur = xpForLevel(lvl)
  const next = xpForLevel(lvl + 1)
  return { level: lvl, inLevel: xp - cur, need: next - cur, pct: ((xp - cur) / (next - cur)) * 100 }
}

export function beltFor(level: number) {
  let belt = BELTS[0]
  for (const b of BELTS) if (level >= b.lvl) belt = b
  const idx = BELTS.indexOf(belt)
  const nextLvl = (BELTS[idx + 1] || { lvl: Infinity }).lvl
  const span = Math.max(1, nextLvl - belt.lvl)
  const into = level - belt.lvl
  const stripes = Math.min(4, Math.floor((into / span) * 5))
  return { ...belt, stripes }
}

// ── Combo multiplier ──────────────────────────────────────────────────────────

export function comboMultiplier(state: AppState): number {
  const ds = dayStreak(state)
  if (ds >= 14) return 2.0
  if (ds >= 7) return 1.5
  if (ds >= 3) return 1.25
  return 1.0
}

// ── Quests ────────────────────────────────────────────────────────────────────

function dailyQuestSeed(): number {
  const d = new Date()
  return parseInt(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`)
}

export function getDailyQuest() {
  return DAILY_QUESTS[dailyQuestSeed() % DAILY_QUESTS.length]
}

function weeklyQuestSeed(): number {
  const s = startOfWeek()
  return parseInt(`${s.getFullYear()}${s.getMonth() + 1}${s.getDate()}`)
}

export function getWeeklyQuest() {
  return WEEKLY_QUESTS[weeklyQuestSeed() % WEEKLY_QUESTS.length]
}

export function weeklyQuestProgress(state: AppState) {
  const wq = getWeeklyQuest()
  const ws = thisWeekSessions(state.sessions)
  let val = 0
  if (wq.metric === "days")            val = new Set(ws.map(s => dayKey(s.ts))).size
  else if (wq.metric === "sessions")   val = ws.length
  else if (wq.metric === "volume")     val = ws.filter(s => s.exercises && s.exercises.length > 0).reduce((a, s) => a + sessionVolume(s), 0)
  else if (wq.metric === "disciplines") val = new Set(ws.map(s => s.type)).size
  else if (wq.metric === "exercises")  val = ws.reduce((a, s) => a + (s.exercises ? s.exercises.length : 0), 0)
  else if (wq.metric === "prs")        val = prsThisWeek(state)
  return { ...wq, value: val, done: val >= wq.total }
}

// ── User-defined quests ───────────────────────────────────────────────────────

export function isDailyQuestDone(state: AppState, quest: UserDailyQuest, daySessions: Session[]): boolean {
  const todayK = dayKey(new Date())
  const completedToday = state.dailyCompletions?.[todayK] || []
  if (completedToday.includes(quest.id)) return true
  if (quest.checkType === "any_session") return daySessions.length >= 1
  if (quest.checkType === "activity_session") return daySessions.some(s => s.type === quest.activityId)
  return false
}

export function weeklyQuestProgressValue(state: AppState, quest: UserWeeklyQuest): number {
  const ws = thisWeekSessions(state.sessions)
  switch (quest.metric) {
    case "days": return new Set(ws.map(s => dayKey(s.ts))).size
    case "sessions": return ws.length
    case "activity_sessions": return ws.filter(s => s.type === quest.activityId).length
    case "prs": return prsThisWeek(state)
    case "daily_completions": {
      const dc = state.dailyCompletions || {}
      const weekStart = startOfWeek()
      const weekEnd = endOfWeek()
      return Object.entries(dc).filter(([dk, ids]) => {
        if (!ids?.length) return false
        const [y, m, d] = dk.split("-").map(Number)
        const date = new Date(y, m - 1, d)
        return date >= weekStart && date < weekEnd
      }).length
    }
    default: return 0
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function addStatClamped(stats: Stats, key: keyof Stats, val: number): Stats {
  return { ...stats, [key]: Math.min(100, Math.max(0, (stats[key] || 0) + val)) }
}

export function addStatsForSession(stats: Stats, sess: Session, actType: ActivityType): Stats {
  let s = stats
  for (const [key, gain] of Object.entries(actType.statGains)) {
    if (gain && gain > 0) s = addStatClamped(s, key as keyof Stats, gain)
  }
  s = addStatClamped(s, "mnd", 0.5)
  if (sess.exercises) for (const _ of sess.exercises) s = addStatClamped(s, "str", 0.3)
  return s
}

// ── Est 1RM & ETA ─────────────────────────────────────────────────────────────

export function est1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return weight * (1 + reps / 30)
}

export function estimateETA(
  history: { ts: number; weight: number }[],
  current: number,
  goal: number,
): { status: string; msg: string; rate?: number; eta?: Date; days?: number; weeks?: number } {
  if (goal == null || goal === current) return { status: "set", msg: "Goal set" }
  const sorted = [...history].sort((a, b) => a.ts - b.ts)
  if (sorted.length < 2) return { status: "need_more", msg: "Log 2+ entries for ETA" }
  const xs = sorted.map(p => p.ts)
  const ys = sorted.map(p => p.weight)
  const n = xs.length
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY)
    den += (xs[i] - meanX) ** 2
  }
  if (den === 0) return { status: "stalled", msg: "Stalled" }
  const slopePerDay = (num / den) * 86400000
  const dir = goal > current ? 1 : -1
  if (Math.sign(slopePerDay) !== dir || Math.abs(slopePerDay) < 0.001) {
    return { status: "stalled", msg: dir > 0 ? "No upward trend" : "No downward trend" }
  }
  const days = (goal - current) / slopePerDay
  if (days < 0 || !isFinite(days)) return { status: "stalled", msg: "Adjust pace" }
  if (days > 365 * 5) return { status: "slow", msg: "5+ years at this rate" }
  const eta = new Date(Date.now() + days * 86400000)
  const weeks = Math.round(days / 7)
  return { status: "ok", rate: slopePerDay, eta, days, weeks, msg: `~${weeks}w · ${fmtDateLong(eta.getTime())}` }
}

// ── Lift matching ─────────────────────────────────────────────────────────────

export function findMatchingLift(lifts: AppState["lifts"], name: string) {
  if (!name) return null
  const norm = name.toLowerCase().replace(/[^a-z]/g, "")
  return lifts.find(l => l.name.toLowerCase().replace(/[^a-z]/g, "") === norm) || null
}

// ── Weekly goals check ────────────────────────────────────────────────────────

export function checkWeeklyGoalsMet(state: AppState): boolean {
  const wk = thisWeekSessions(state.sessions)
  const c = countByType(wk)
  return Object.entries(state.targets).every(([type, goal]) => goal === 0 || (c[type] || 0) >= goal)
}

// ── Stat widget compute ───────────────────────────────────────────────────────

export function computeStatMetric(key: string, state: AppState): { v: string; sub?: string } {
  const prog = levelProgress(state.xp)
  const belt = beltFor(prog.level)
  switch (key) {
    case "level":                return { v: String(prog.level), sub: belt.name }
    case "totalXp":              return { v: state.xp + " XP" }
    case "beltName":             return { v: belt.name }
    case "totalSessions":        return { v: String(state.sessions.length) }
    case "sessionsWeek":         return { v: String(thisWeekSessions(state.sessions).length) }
    case "sessionsMonth": {
      const now = new Date()
      return { v: String(state.sessions.filter(s => { const d = new Date(s.ts); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length) }
    }
    case "dayStreak":            return { v: String(dayStreak(state)), sub: "days in a row" }
    case "weekGoalStreak":       return { v: String(state.weeksGoalsHit || 0), sub: "weeks" }
    case "totalPrs":             return { v: String(prCount(state)) }
    case "prsWeek":              return { v: String(prsThisWeek(state)) }
    case "volumeWeek":           return { v: Math.round(weekVolume(state.sessions)).toLocaleString() + " kg" }
    case "volumeTotal":          return { v: Math.round(state.sessions.reduce((a, s) => a + sessionVolume(s), 0)).toLocaleString() + " kg" }
    case "achievementsUnlocked": return { v: Object.keys(state.unlocked).length + " / 21" }
    case "questsCompleted":      return { v: String(state.questsDone || 0) }
    case "weeklyQuestsCompleted":return { v: String(state.weeklyQuestsDone || 0) }
    case "comboMultiplier":      return { v: comboMultiplier(state).toFixed(2) + "×" }
    case "bodyweightCurrent": {
      const last = state.bodyweight.history.slice(-1)[0]
      return { v: last ? last.value + " kg" : "—" }
    }
    case "bodyweightGoal":       return { v: state.bodyweight.goal ? state.bodyweight.goal + " kg" : "—" }
    case "bodyweight30dChange": {
      const c = bwChange(state, 30)
      return { v: c == null ? "—" : (c > 0 ? "+" : "") + c.toFixed(1) + " kg" }
    }
    case "averagePerWeek": {
      const wks = Math.max(1, Math.ceil((Date.now() - (state.sessions[state.sessions.length - 1]?.ts || Date.now())) / (7 * 86400000)))
      return { v: (state.sessions.length / wks).toFixed(1) }
    }
    default: return { v: "—" }
  }
}

// ── Strength levels ───────────────────────────────────────────────────────────

export interface StrengthLevelResult {
  levelIndex: number        // 0 = untrained, 1-5 = Beginner→Elite
  name: string
  color: string
  nextLevelName: string | null
  nextAt: number | null     // estimated 1RM needed for next level (kg)
  thresholds: number[]      // all 5 thresholds in kg for this BW
}

export function getStrengthLevel(liftName: string, est1RMKg: number, bodyweightKg: number): StrengthLevelResult | null {
  const key = liftName.toLowerCase().replace(/[^a-z]/g, "")
  const standards = STRENGTH_STANDARDS[key]
  if (!standards || bodyweightKg <= 0) return null

  const thresholds = standards.map(m => Math.round(m * bodyweightKg * 10) / 10)

  let levelIndex = 0
  for (let i = 0; i < thresholds.length; i++) {
    if (est1RMKg >= thresholds[i]) levelIndex = i + 1
  }

  const def = levelIndex > 0 ? STRENGTH_LEVELS[levelIndex - 1] : { name: "Untrained", color: "#4b5563" }
  const nextDef = levelIndex < 5 ? STRENGTH_LEVELS[levelIndex] : null

  return {
    levelIndex,
    name: def.name,
    color: def.color,
    nextLevelName: nextDef?.name ?? null,
    nextAt: levelIndex < 5 ? thresholds[levelIndex] : null,
    thresholds,
  }
}
