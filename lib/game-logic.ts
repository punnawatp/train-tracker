import type { ActivityType, AppState, GearItem, Session, Stats, UserDailyQuest, UserWeeklyQuest } from "./types"
import { STRENGTH_LEVELS, STRENGTH_STANDARDS } from "./constants"

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

// ── Streak coin multiplier ────────────────────────────────────────────────────

export function streakMultiplier(state: AppState): number {
  const ds = dayStreak(state)
  if (ds >= 14) return 2.0
  if (ds >= 7)  return 1.5
  if (ds >= 3)  return 1.25
  return 1.0
}

// ── Quests ────────────────────────────────────────────────────────────────────

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

// Returns stat gains for a session based on duration. 2 points per hour by default.
export function addStatsForSession(stats: Stats, actType: ActivityType, durationMinutes: number): Stats {
  const hours = durationMinutes / 60
  let s = stats
  for (const [key, gainPerHour] of Object.entries(actType.statGains)) {
    if (gainPerHour && gainPerHour > 0) {
      s = addStatClamped(s, key as keyof Stats, gainPerHour * hours)
    }
  }
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
  switch (key) {
    case "gold":                  return { v: (state.gold || 0).toLocaleString() + " 🪙" }
    case "totalSessions":         return { v: String(state.sessions.length) }
    case "sessionsWeek":          return { v: String(thisWeekSessions(state.sessions).length) }
    case "sessionsMonth": {
      const now = new Date()
      return { v: String(state.sessions.filter(s => { const d = new Date(s.ts); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length) }
    }
    case "dayStreak":             return { v: String(dayStreak(state)), sub: "days in a row" }
    case "weekGoalStreak":        return { v: String(state.weeksGoalsHit || 0), sub: "weeks" }
    case "totalPrs":              return { v: String(prCount(state)) }
    case "prsWeek":               return { v: String(prsThisWeek(state)) }
    case "volumeWeek":            return { v: Math.round(weekVolume(state.sessions)).toLocaleString() + " kg" }
    case "volumeTotal":           return { v: Math.round(state.sessions.reduce((a, s) => a + sessionVolume(s), 0)).toLocaleString() + " kg" }
    case "achievementsUnlocked":  return { v: Object.keys(state.unlocked).length + " / " + 21 }
    case "questsCompleted":       return { v: String(state.questsDone || 0) }
    case "weeklyQuestsCompleted": return { v: String(state.weeklyQuestsDone || 0) }
    case "bodyweightCurrent": {
      const last = state.bodyweight.history.slice(-1)[0]
      return { v: last ? last.value + " kg" : "—" }
    }
    case "bodyweightGoal":        return { v: state.bodyweight.goal ? state.bodyweight.goal + " kg" : "—" }
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

// ── Boss spin wheel ───────────────────────────────────────────────────────────

export function gearAttackPower(rarity: GearItem["rarity"]): number {
  return ({ common: 10, rare: 25, epic: 60, legendary: 150 } as const)[rarity]
}

export function totalAttackPower(
  equipped: AppState["equipped"] | undefined,
  allGear: GearItem[],
): number {
  if (!equipped) return 0
  return (["weapon", "helmet", "armor", "ring"] as const).reduce((sum, slot) => {
    const id = equipped[slot]
    if (!id) return sum
    const item = allGear.find(g => g.id === id)
    return item ? sum + gearAttackPower(item.rarity) : sum
  }, 0)
}

export interface WheelSegment {
  label: string
  color: string
  dmgMultiplier: number
  pct: number
}

export function buildWheelSegments(atk: number): WheelSegment[] {
  const t = Math.min(1, atk / 400)
  const lerp = (a: number, b: number) => a + (b - a) * t
  const miss    = lerp(50, 5)
  const graze   = lerp(25, 10)
  const hit     = lerp(15, 25)
  const strong  = lerp(7, 30)
  const crit    = lerp(3, 20)
  const perfect = 100 - miss - graze - hit - strong - crit
  return [
    { label: "MISS",     color: "#4b5563", dmgMultiplier: 0,   pct: miss    },
    { label: "GRAZE",    color: "#4cc9f0", dmgMultiplier: 0.5, pct: graze   },
    { label: "HIT",      color: "#4ade80", dmgMultiplier: 1.0, pct: hit     },
    { label: "STRONG",   color: "#fbbf24", dmgMultiplier: 1.5, pct: strong  },
    { label: "CRITICAL", color: "#fb923c", dmgMultiplier: 2.5, pct: crit    },
    { label: "PERFECT",  color: "#ff4d3d", dmgMultiplier: 4.0, pct: perfect },
  ]
}

export function rollWheelSegment(segments: WheelSegment[]): number {
  const roll = Math.random() * 100
  let cum = 0
  for (let i = 0; i < segments.length; i++) {
    cum += segments[i].pct
    if (roll < cum) return i
  }
  return segments.length - 1
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
