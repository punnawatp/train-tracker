"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { AppState, Exercise, Session, Toast, Widget } from "@/lib/types"
import {
  DEFAULT_SECTIONS, DEFAULT_XP_RULES, DEFAULT_CATEGORIES, DEFAULT_LIFTS,
  ACHIEVEMENTS,
} from "@/lib/constants"
import {
  addStatsForSession, addStatClamped, checkWeeklyGoalsMet,
  comboMultiplier, dayKey, findMatchingLift, getDailyQuest,
  getWeeklyQuest, sessionVolume, todaySessions, weekKey, weeklyQuestProgress,
  xpToLevel, levelProgress, beltFor,
} from "@/lib/game-logic"

const defaultData: AppState = {
  targets: { gym: 3, bjj: 2, mma: 2 },
  sessions: [],
  xp: 0,
  weeksGoalsHit: 0,
  weekKeysCounted: [],
  unlocked: {},
  questsDone: 0,
  lastQuestCompletedDate: null,
  weeklyQuestsDone: 0,
  lastWeeklyQuestWeek: null,
  bodyweight: { goal: null, history: [] },
  categories: structuredClone(DEFAULT_CATEGORIES),
  lifts: structuredClone(DEFAULT_LIFTS),
  stats: { str: 0, con: 0, tec: 0, dis: 0 },
  xpRules: { ...DEFAULT_XP_RULES },
  widgets: [],
  ui: { sectionsVisible: { ...DEFAULT_SECTIONS } },
}

interface StoreState {
  data: AppState
  loading: boolean
  toasts: Toast[]
  prFlash: { name: string; val: string } | null
  levelUpInfo: { level: number; beltName: string; stripes: number } | null

  // Lifecycle
  load: () => Promise<void>
  save: (next: AppState) => Promise<void>

  // Session actions
  logSession: (type: "gym" | "bjj" | "mma", exercises?: Exercise[], note?: string) => void
  updateSession: (sessId: number, exercises: Exercise[], note: string) => void
  deleteSession: (id: number) => void
  resetWeek: () => void

  // Target actions
  setTarget: (type: "gym" | "bjj" | "mma", val: number) => void

  // Bodyweight
  logBodyweight: (value: number) => void
  updateBwGoal: (goal: number | null) => void

  // Lifts
  updateLift: (id: string, patch: Partial<AppState["lifts"][0]>, manualCurrentChange?: boolean) => void
  addLift: (lift: Omit<AppState["lifts"][0], "history">) => void
  deleteLift: (id: string) => void

  // Categories
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void

  // Widgets
  addWidget: (w: Omit<Widget, "id">) => void
  updateWidget: (id: string, patch: Partial<Widget>) => void
  deleteWidget: (id: string) => void
  moveWidget: (id: string, dir: number) => void

  // Settings
  updateXpRules: (rules: Partial<AppState["xpRules"]>) => void
  toggleSection: (key: string, val: boolean) => void

  // Data
  importData: (raw: AppState) => void
  resetAllData: () => void

  // UI helpers
  addToast: (t: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  showPRFlash: (name: string, val: string) => void
  clearPRFlash: () => void
  closeLevelUp: () => void
}

function getSupabase() { return createClient() }

async function fetchData(): Promise<AppState | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", user.id)
    .single()
  if (error || !data) return null
  return data.data as AppState
}

async function persistData(state: AppState): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from("user_data")
    .upsert({ user_id: user.id, data: state }, { onConflict: "user_id" })
}

function mergeFromStorage(raw: Partial<AppState>): AppState {
  const merged: AppState = { ...structuredClone(defaultData), ...raw }
  merged.categories = merged.categories?.length ? merged.categories : structuredClone(DEFAULT_CATEGORIES)
  merged.xpRules = { ...DEFAULT_XP_RULES, ...(merged.xpRules || {}) }
  merged.widgets = merged.widgets || []
  merged.ui = merged.ui || {}
  merged.ui.sectionsVisible = { ...DEFAULT_SECTIONS, ...(merged.ui?.sectionsVisible || {}) }
  merged.lifts = (merged.lifts || []).map(l => ({
    ...l,
    cat: merged.categories.find(c => c.id === l.cat) ? l.cat : "other",
    targetReps: l.targetReps || 8,
    history: (l.history || []).map((h) => {
      const raw = h as unknown as Record<string, unknown>
      return { ts: Number(raw["ts"] ?? 0), weight: Number(raw["weight"] ?? 0), reps: Number(raw["reps"] ?? (l.targetReps || 8)) }
    }),
  }))
  merged.stats = merged.stats || { str: 0, con: 0, tec: 0, dis: 0 }
  return merged
}

export const useTrainStore = create<StoreState>((set, get) => ({
  data: structuredClone(defaultData),
  loading: true,
  toasts: [],
  prFlash: null,
  levelUpInfo: null,

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  load: async () => {
    const raw = await fetchData()
    if (raw) {
      set({ data: mergeFromStorage(raw), loading: false })
    } else {
      set({ data: structuredClone(defaultData), loading: false })
    }
  },

  save: async (next: AppState) => {
    set({ data: next })
    await persistData(next)
  },

  // ── Session actions ─────────────────────────────────────────────────────────

  logSession: (type, exercises = [], note = "") => {
    const { data, save, addToast, showPRFlash } = get()
    const baseXp = data.xpRules[type] || 10
    const multi = comboMultiplier(data)
    let earned = Math.round(baseXp * multi)
    if (exercises.length > 0) earned += Math.min(data.xpRules.exerciseBonusMax, exercises.length * data.xpRules.exerciseBonus)

    const prevLevel = xpToLevel(data.xp)
    const session: Session = {
      id: Date.now() + Math.random(),
      type, ts: Date.now(), xpAwarded: earned, exercises, note,
    }

    let next: AppState = {
      ...data,
      sessions: [session, ...data.sessions],
      xp: data.xp + earned,
      stats: addStatsForSession(data.stats, session),
    }

    // Auto-update lifts from exercises
    const prsHit: { name: string; val: string }[] = []
    const lifts = next.lifts.map(lift => {
      const ex = exercises.find(e => findMatchingLift([lift], e.name))
      if (!ex || !ex.weight || ex.reps < (lift.targetReps || 8)) return lift
      const history = [...(lift.history || []), { ts: Date.now(), weight: ex.weight, reps: ex.reps }]
      const eligible = history.filter(h => h.reps >= (lift.targetReps || 8))
      const newBest = Math.max(...eligible.map(h => h.weight))
      if (newBest > (lift.current || 0)) {
        prsHit.push({ name: lift.name, val: `${newBest} kg @ ${lift.targetReps}+ reps` })
        next = { ...next, xp: next.xp + next.xpRules.prBonus, stats: addStatClamped(next.stats, "str", 1.0) }
        return { ...lift, history, current: newBest }
      }
      return { ...lift, history }
    })
    next = { ...next, lifts }

    // Weekly goals
    if (checkWeeklyGoalsMet(next) && !next.weekKeysCounted.includes(weekKey())) {
      next = {
        ...next,
        weekKeysCounted: [...next.weekKeysCounted, weekKey()],
        weeksGoalsHit: (next.weeksGoalsHit || 0) + 1,
        xp: next.xp + next.xpRules.weeklyBonus,
        stats: addStatClamped(next.stats, "dis", 3.0),
      }
      addToast({ title: "WEEK COMPLETE", body: "All goals hit!", sub: `+${next.xpRules.weeklyBonus} XP · +3 DIS`, kind: "xp" })
    }

    // Daily quest
    const dq = getDailyQuest()
    const todayK = dayKey(new Date())
    const todaySess = todaySessions(next.sessions)
    if (next.lastQuestCompletedDate !== todayK && dq.predicate(todaySess)) {
      next = { ...next, xp: next.xp + dq.xp, questsDone: (next.questsDone || 0) + 1, lastQuestCompletedDate: todayK }
      addToast({ title: "DAILY QUEST", body: dq.desc, sub: `+${dq.xp} XP`, kind: "xp" })
    }

    // Weekly quest
    const wkProg = weeklyQuestProgress(next)
    const wkKey = weekKey()
    if (wkProg.done && next.lastWeeklyQuestWeek !== wkKey) {
      next = { ...next, xp: next.xp + wkProg.xp, weeklyQuestsDone: (next.weeklyQuestsDone || 0) + 1, lastWeeklyQuestWeek: wkKey }
      addToast({ title: "WEEKLY QUEST", body: wkProg.desc, sub: `+${wkProg.xp} XP`, kind: "xp" })
    }

    const subBits: string[] = []
    if (multi > 1) subBits.push(`×${multi.toFixed(2)}`)
    if (exercises.length > 0) subBits.push(`${exercises.length} ex · ${Math.round(sessionVolume(session))}kg`)
    addToast({ title: `+${earned} XP`, body: type.toUpperCase() + " logged", sub: subBits.join(" · ") || undefined, kind: "xp" })

    if (prsHit.length > 0) showPRFlash(prsHit[0].name, prsHit[0].val)

    // Check achievements
    next = checkAchievementsOnState(next, get)

    // Level up check
    const newLevel = xpToLevel(next.xp)
    if (newLevel > prevLevel) {
      const belt = beltFor(newLevel)
      set({ levelUpInfo: { level: newLevel, beltName: belt.name, stripes: belt.stripes } })
    }

    save(next)
  },

  updateSession: (sessId, exercises, note) => {
    const { data, save, showPRFlash } = get()
    const session = data.sessions.find(s => s.id === sessId)
    if (!session) return
    const oldVolume = sessionVolume(session)
    const updatedSession = { ...session, exercises, note }

    let next = { ...data, sessions: data.sessions.map(s => s.id === sessId ? updatedSession : s) }
    const prsHit: { name: string; val: string }[] = []
    const lifts = next.lifts.map(lift => {
      const ex = exercises.find(e => findMatchingLift([lift], e.name))
      if (!ex || !ex.weight || ex.reps < (lift.targetReps || 8) || ex.weight <= (lift.current || 0)) return lift
      const dup = lift.history.find(h => Math.abs(h.ts - session.ts) < 1000 && h.weight === ex.weight && h.reps === ex.reps)
      if (dup) return lift
      const history = [...lift.history, { ts: Date.now(), weight: ex.weight, reps: ex.reps }]
      prsHit.push({ name: lift.name, val: `${ex.weight} kg @ ${lift.targetReps}+ reps` })
      next = { ...next, xp: next.xp + next.xpRules.prBonus, stats: addStatClamped(next.stats, "str", 1.0) }
      return { ...lift, history, current: ex.weight }
    })
    next = { ...next, lifts }

    if (prsHit.length > 0) showPRFlash(prsHit[0].name, prsHit[0].val)
    get().addToast({ title: "Session updated", body: `${session.type.toUpperCase()} · ${exercises.length} ex`, sub: `Δ vol: ${Math.round(sessionVolume(updatedSession) - oldVolume)} kg` })
    save(next)
  },

  deleteSession: (id) => {
    const { data, save } = get()
    const s = data.sessions.find(x => x.id === id)
    if (!s) return
    save({ ...data, xp: Math.max(0, data.xp - (s.xpAwarded || 0)), sessions: data.sessions.filter(x => x.id !== id) })
  },

  resetWeek: () => {
    const { data, save } = get()
    const start = new Date(); start.setHours(0, 0, 0, 0); const startMs = start.getTime() - (start.getDay() === 0 ? 6 : start.getDay() - 1) * 86400000
    const endMs = startMs + 7 * 86400000
    save({ ...data, sessions: data.sessions.filter(s => !(s.ts >= startMs && s.ts < endMs)) })
  },

  // ── Target actions ──────────────────────────────────────────────────────────

  setTarget: (type, val) => {
    const { data, save } = get()
    save({ ...data, targets: { ...data.targets, [type]: Math.max(0, Math.min(14, val)) } })
  },

  // ── Bodyweight ──────────────────────────────────────────────────────────────

  logBodyweight: (value) => {
    const { data, save, addToast } = get()
    const next: AppState = {
      ...data,
      xp: data.xp + data.xpRules.bodyweightLog,
      stats: addStatClamped(data.stats, "dis", 0.3),
      bodyweight: { ...data.bodyweight, history: [...data.bodyweight.history, { ts: Date.now(), value }] },
    }
    addToast({ title: `+${data.xpRules.bodyweightLog} XP`, body: `Bodyweight: ${value} kg`, sub: "+0.3 DIS", kind: "xp" })
    save(next)
  },

  updateBwGoal: (goal) => {
    const { data, save } = get()
    save({ ...data, bodyweight: { ...data.bodyweight, goal } })
  },

  // ── Lifts ───────────────────────────────────────────────────────────────────

  updateLift: (id, patch, manualCurrentChange = false) => {
    const { data, save, showPRFlash } = get()
    let next = data
    const lifts = data.lifts.map(lift => {
      if (lift.id !== id) return lift
      const updated = { ...lift, ...patch }
      if (manualCurrentChange && patch.current != null && patch.current > lift.current) {
        const history = [...(lift.history || []), { ts: Date.now(), weight: patch.current, reps: updated.targetReps || lift.targetReps }]
        next = { ...next, xp: next.xp + next.xpRules.prBonus, stats: addStatClamped(next.stats, "str", 1.0) }
        showPRFlash(lift.name, `${patch.current} kg @ ${updated.targetReps || lift.targetReps} reps`)
        return { ...updated, history }
      }
      return updated
    })
    next = checkAchievementsOnState({ ...next, lifts }, get)
    save(next)
  },

  addLift: (lift) => {
    const { data, save } = get()
    save({ ...data, lifts: [...data.lifts, { ...lift, history: lift.current > 0 ? [{ ts: Date.now(), weight: lift.current, reps: lift.targetReps }] : [] }] })
  },

  deleteLift: (id) => {
    const { data, save } = get()
    save({ ...data, lifts: data.lifts.filter(l => l.id !== id) })
  },

  // ── Categories ──────────────────────────────────────────────────────────────

  addCategory: (name) => {
    const { data, save } = get()
    save({ ...data, categories: [...data.categories, { id: "cat_" + Date.now(), name }] })
  },

  renameCategory: (id, name) => {
    const { data, save } = get()
    save({ ...data, categories: data.categories.map(c => c.id === id ? { ...c, name } : c) })
  },

  deleteCategory: (id) => {
    const { data, save } = get()
    const affected = data.lifts.filter(l => l.cat === id)
    if (affected.length > 0 && !confirm(`${affected.length} lift(s) use this category. Move them to "Other"?`)) return
    const cats = data.categories.filter(c => c.id !== id)
    const lifts = data.lifts.map(l => l.cat === id ? { ...l, cat: "other" } : l)
    save({ ...data, categories: cats, lifts })
  },

  // ── Widgets ─────────────────────────────────────────────────────────────────

  addWidget: (w) => {
    const { data, save } = get()
    save({ ...data, widgets: [...data.widgets, { ...w, id: "w_" + Date.now() }] })
  },

  updateWidget: (id, patch) => {
    const { data, save } = get()
    save({ ...data, widgets: data.widgets.map(w => w.id === id ? { ...w, ...patch } : w) })
  },

  deleteWidget: (id) => {
    const { data, save } = get()
    save({ ...data, widgets: data.widgets.filter(w => w.id !== id) })
  },

  moveWidget: (id, dir) => {
    const { data, save } = get()
    const arr = [...data.widgets]
    const i = arr.findIndex(w => w.id === id)
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    save({ ...data, widgets: arr })
  },

  // ── Settings ────────────────────────────────────────────────────────────────

  updateXpRules: (rules) => {
    const { data, save } = get()
    save({ ...data, xpRules: { ...data.xpRules, ...rules } })
  },

  toggleSection: (key, val) => {
    const { data, save } = get()
    save({ ...data, ui: { ...data.ui, sectionsVisible: { ...data.ui.sectionsVisible, [key]: val } } })
  },

  // ── Data I/O ────────────────────────────────────────────────────────────────

  importData: (raw) => {
    const { save } = get()
    save(mergeFromStorage(raw))
  },

  resetAllData: () => {
    const { save } = get()
    save(structuredClone(defaultData))
  },

  // ── UI helpers ───────────────────────────────────────────────────────────────

  addToast: (t) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => get().removeToast(id), 4200)
  },

  removeToast: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
  },

  showPRFlash: (name, val) => {
    set({ prFlash: { name, val } })
    setTimeout(() => set({ prFlash: null }), 1400)
  },

  clearPRFlash: () => set({ prFlash: null }),
  closeLevelUp: () => set({ levelUpInfo: null }),
}))

function checkAchievementsOnState(state: AppState, get: () => StoreState): AppState {
  const newly: typeof ACHIEVEMENTS = []
  const unlocked = { ...state.unlocked }
  for (const a of ACHIEVEMENTS) {
    if (!unlocked[a.id] && a.check(state)) {
      unlocked[a.id] = Date.now()
      newly.push(a)
    }
  }
  if (newly.length > 0) {
    newly.forEach((u, i) => setTimeout(() => get().addToast({ title: "ACHIEVEMENT", body: u.icon + " " + u.name, sub: u.desc }), i * 500))
  }
  return { ...state, unlocked }
}
