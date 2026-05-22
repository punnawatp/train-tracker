"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { ActivityType, AppState, Exercise, Session, Toast, UserDailyQuest, UserWeeklyQuest, Widget } from "@/lib/types"
import {
  DEFAULT_SECTIONS, DEFAULT_XP_RULES, DEFAULT_CATEGORIES, DEFAULT_LIFTS, DEFAULT_ACTIVITY_TYPES,
  ACHIEVEMENTS, SHOP_ITEMS, BOSSES, GACHA_GEAR, rollGacha, rollShopGacha,
} from "@/lib/constants"
import type { GearItem } from "@/lib/types"
import {
  addStatsForSession, addStatClamped, checkWeeklyGoalsMet,
  dayKey, findMatchingLift,
  isDailyQuestDone, weeklyQuestProgressValue,
  sessionVolume, todaySessions, weekKey,
} from "@/lib/game-logic"

const DEFAULT_DAILY_QUESTS: UserDailyQuest[] = [
  { id: "dq_default_1", desc: "Log any workout today", xp: 50, checkType: "any_session" },
  { id: "dq_default_2", desc: "Log your bodyweight", xp: 20, checkType: "manual" },
  { id: "dq_default_3", desc: "Hit the gym today", xp: 75, checkType: "activity_session", activityId: "gym" },
]

const DEFAULT_WEEKLY_QUESTS: UserWeeklyQuest[] = [
  { id: "wq_default_1", desc: "Work out 3 times this week", xp: 150, metric: "sessions", target: 3 },
  { id: "wq_default_2", desc: "Train on 4 different days", xp: 200, metric: "days", target: 4 },
  { id: "wq_default_3", desc: "Complete 5 daily quests", xp: 100, metric: "daily_completions", target: 5 },
]

const defaultData: AppState = {
  targets: { gym: 0 },
  activityTypes: structuredClone(DEFAULT_ACTIVITY_TYPES),
  sessions: [],
  xp: 0,
  weeksGoalsHit: 0,
  weekKeysCounted: [],
  unlocked: {},
  questsDone: 0,
  lastQuestCompletedDate: null,
  weeklyQuestsDone: 0,
  lastWeeklyQuestWeek: null,
  bodyweight: { goal: null, history: [], bodyfat: { goal: null, history: [] } },
  categories: structuredClone(DEFAULT_CATEGORIES),
  lifts: structuredClone(DEFAULT_LIFTS),
  stats: { str: 0, flex: 0, mob: 0, mnd: 0, end: 0 },
  xpRules: { ...DEFAULT_XP_RULES },
  widgets: [],
  ui: { sectionsVisible: { ...DEFAULT_SECTIONS }, theme: "dark" as const },
  dailyQuests: structuredClone(DEFAULT_DAILY_QUESTS),
  weeklyQuests: structuredClone(DEFAULT_WEEKLY_QUESTS),
  dailyCompletions: {},
  weeklyCompletions: {},
  gold: 0,
  inventory: {},
  activeEffects: {},
  currentBoss: null,
  bossKills: {},
  equipped: { weapon: null, helmet: null, armor: null, ring: null },
  gear: {},
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
  logSession: (type: string, exercises?: Exercise[], note?: string) => void
  updateSession: (sessId: number, exercises: Exercise[], note: string) => void
  deleteSession: (id: number) => void
  resetWeek: () => void

  // Target actions
  setTarget: (type: string, val: number) => void

  // Activity types
  addActivityType: (act: Omit<ActivityType, "id">) => void
  updateActivityType: (id: string, patch: Partial<Omit<ActivityType, "id">>) => void
  deleteActivityType: (id: string) => void

  // Bodyweight
  logBodyweight: (value: number) => void
  updateBwGoal: (goal: number | null) => void
  logBodyfat: (value: number) => void
  updateBfGoal: (goal: number | null) => void

  // Lifts
  updateLift: (id: string, patch: Partial<AppState["lifts"][0]>, manualCurrentChange?: boolean) => void
  addLift: (lift: Omit<AppState["lifts"][0], "history">) => void
  deleteLift: (id: string) => void

  // Categories
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void

  // Quests
  addDailyQuest: (quest: Omit<UserDailyQuest, "id">) => void
  removeDailyQuest: (id: string) => void
  updateDailyQuest: (id: string, patch: Partial<Omit<UserDailyQuest, "id">>) => void
  completeQuestManually: (questId: string) => void
  addWeeklyQuest: (quest: Omit<UserWeeklyQuest, "id">) => void
  removeWeeklyQuest: (id: string) => void
  updateWeeklyQuest: (id: string, patch: Partial<Omit<UserWeeklyQuest, "id">>) => void

  // Widgets
  addWidget: (w: Omit<Widget, "id">) => void
  updateWidget: (id: string, patch: Partial<Widget>) => void
  deleteWidget: (id: string) => void
  moveWidget: (id: string, dir: number) => void

  // Settings
  updateXpRules: (rules: Partial<AppState["xpRules"]>) => void
  toggleSection: (key: string, val: boolean) => void
  setTheme: (theme: "dark" | "light") => void

  // Shop
  buyItem: (itemId: string) => void
  useItem: (itemId: string) => void

  // Boss & Gacha
  gachaResult: Array<GearItem | "salt"> | null
  gachaPreClaimed: boolean
  startBossBattle: (idx: number) => void
  abandonBoss: () => void
  equipGear: (slot: "weapon" | "helmet" | "armor" | "ring", gearId: string | null) => void
  claimGachaResult: () => void
  pullGacha: (count: 1 | 10) => void

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

  // Migrate old stat keys (str/con/tec/dis → str/flex/mob/mnd)
  const rawStats = (merged.stats || {}) as unknown as Record<string, number>
  if ("con" in rawStats && !("flex" in rawStats)) rawStats.flex = rawStats.con
  if ("tec" in rawStats && !("mob" in rawStats)) rawStats.mob = rawStats.tec
  if ("dis" in rawStats && !("mnd" in rawStats)) rawStats.mnd = rawStats.dis
  merged.stats = {
    str: rawStats.str || 0,
    flex: rawStats.flex || 0,
    mob: rawStats.mob || 0,
    mnd: rawStats.mnd || 0,
    end: rawStats.end || 0,
  }

  merged.bodyweight = {
    goal: merged.bodyweight?.goal ?? null,
    history: merged.bodyweight?.history || [],
    bodyfat: merged.bodyweight?.bodyfat || { goal: null, history: [] },
  }
  merged.activityTypes = merged.activityTypes?.length ? merged.activityTypes : structuredClone(DEFAULT_ACTIVITY_TYPES)
  merged.categories = merged.categories?.length ? merged.categories : structuredClone(DEFAULT_CATEGORIES)
  merged.xpRules = { ...DEFAULT_XP_RULES, ...(merged.xpRules || {}) }
  merged.widgets = merged.widgets || []
  merged.ui = merged.ui || {}
  merged.ui.sectionsVisible = { ...DEFAULT_SECTIONS, ...(merged.ui?.sectionsVisible || {}) }
  merged.ui.theme = merged.ui.theme || "dark"
  merged.lifts = (merged.lifts || []).map(l => ({
    ...l,
    cat: merged.categories.find(c => c.id === l.cat) ? l.cat : "other",
    targetReps: l.targetReps || 8,
    history: (l.history || []).map((h) => {
      const raw = h as unknown as Record<string, unknown>
      return { ts: Number(raw["ts"] ?? 0), weight: Number(raw["weight"] ?? 0), reps: Number(raw["reps"] ?? (l.targetReps || 8)) }
    }),
  }))
  merged.dailyQuests = merged.dailyQuests?.length ? merged.dailyQuests : structuredClone(DEFAULT_DAILY_QUESTS)
  merged.weeklyQuests = merged.weeklyQuests?.length ? merged.weeklyQuests : structuredClone(DEFAULT_WEEKLY_QUESTS)
  merged.dailyCompletions = merged.dailyCompletions || {}
  merged.weeklyCompletions = merged.weeklyCompletions || {}
  merged.gold = merged.gold ?? 0
  merged.inventory = merged.inventory || {}
  merged.activeEffects = merged.activeEffects || {}
  merged.currentBoss = merged.currentBoss ?? null
  merged.bossKills = merged.bossKills || {}
  // Migrate old equippedWeapon to new equipped object
  const rawRec = raw as Record<string, unknown>
  merged.equipped = merged.equipped || { weapon: null, helmet: null, armor: null, ring: null }
  if (!merged.equipped.weapon && rawRec["equippedWeapon"]) {
    merged.equipped = { ...merged.equipped, weapon: rawRec["equippedWeapon"] as string }
  }
  merged.gear = merged.gear || {}
  return merged
}

export const useTrainStore = create<StoreState>((set, get) => ({
  data: structuredClone(defaultData),
  loading: true,
  toasts: [],
  prFlash: null,
  levelUpInfo: null,
  gachaResult: null,
  gachaPreClaimed: false,

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  load: async () => {
    const raw = await fetchData()
    const data = raw ? mergeFromStorage(raw) : structuredClone(defaultData)
    document.documentElement.classList.remove("theme-dark", "theme-light")
    document.documentElement.classList.add(`theme-${data.ui.theme ?? "dark"}`)
    set({ data, loading: false })
  },

  save: async (next: AppState) => {
    set({ data: next })
    await persistData(next)
  },

  // ── Session actions ─────────────────────────────────────────────────────────

  logSession: (type, exercises = [], note = "") => {
    const { data, save, addToast, showPRFlash } = get()
    const actType = data.activityTypes.find(a => a.id === type)
    if (!actType) return

    const session: Session = {
      id: Date.now() + Math.random(),
      type, ts: Date.now(), xpAwarded: 0, exercises, note,
    }

    let next: AppState = {
      ...data,
      sessions: [session, ...data.sessions],
      stats: addStatsForSession(data.stats, session, actType),
    }

    // PR detection — update lifts, give stat bonus
    const prsHit: { name: string; val: string }[] = []
    const lifts = next.lifts.map(lift => {
      const ex = exercises.find(e => findMatchingLift([lift], e.name))
      if (!ex || !ex.weight || ex.reps < (lift.targetReps || 8)) return lift
      const history = [...(lift.history || []), { ts: Date.now(), weight: ex.weight, reps: ex.reps }]
      const eligible = history.filter(h => h.reps >= (lift.targetReps || 8))
      const newBest = Math.max(...eligible.map(h => h.weight))
      if (newBest > (lift.current || 0)) {
        prsHit.push({ name: lift.name, val: `${newBest} kg @ ${lift.targetReps}+ reps` })
        next = { ...next, stats: addStatClamped(next.stats, "str", 1.0) }
        return { ...lift, history, current: newBest }
      }
      return { ...lift, history }
    })
    next = { ...next, lifts }

    // Weekly goals — give mindfulness stat
    if (checkWeeklyGoalsMet(next) && !next.weekKeysCounted.includes(weekKey())) {
      next = {
        ...next,
        weekKeysCounted: [...next.weekKeysCounted, weekKey()],
        weeksGoalsHit: (next.weeksGoalsHit || 0) + 1,
        stats: addStatClamped(next.stats, "mnd", 3.0),
      }
      addToast({ title: "WEEK COMPLETE", body: "All goals hit!", sub: "Mindfulness +3" })
    }

    // Auto-complete daily quests
    const todayK = dayKey(new Date())
    const todaySess = todaySessions(next.sessions)
    const doneTodaySet = new Set(next.dailyCompletions?.[todayK] || [])
    let questGoldEarned = 0
    for (const quest of (next.dailyQuests || [])) {
      if (doneTodaySet.has(quest.id) || quest.checkType === "manual") continue
      if (isDailyQuestDone(next, quest, todaySess)) {
        doneTodaySet.add(quest.id)
        const qGold = quest.xp * 5
        questGoldEarned += qGold
        next = {
          ...next,
          questsDone: (next.questsDone || 0) + 1,
          dailyCompletions: { ...(next.dailyCompletions || {}), [todayK]: [...doneTodaySet] },
        }
        addToast({ title: "DAILY QUEST", body: quest.desc, sub: `+${qGold}🪙` })
      }
    }

    // Auto-complete weekly quests
    const wkKey = weekKey()
    const doneThisWeekSet = new Set(next.weeklyCompletions?.[wkKey] || [])
    for (const quest of (next.weeklyQuests || [])) {
      if (doneThisWeekSet.has(quest.id)) continue
      if (weeklyQuestProgressValue(next, quest) >= quest.target) {
        doneThisWeekSet.add(quest.id)
        const qGold = quest.xp * 5
        questGoldEarned += qGold
        next = {
          ...next,
          weeklyQuestsDone: (next.weeklyQuestsDone || 0) + 1,
          weeklyCompletions: { ...(next.weeklyCompletions || {}), [wkKey]: [...doneThisWeekSet] },
        }
        addToast({ title: "WEEKLY QUEST", body: quest.desc, sub: `+${qGold}🪙` })
      }
    }

    // Gold reward: base from activity + exercise bonus + quest rewards
    const goldBoost = data.activeEffects?.gold_boost ?? 1
    const baseGold = actType.xp * 5
    const exBonus = Math.min(exercises.length * 3, 30)
    const prBonus = prsHit.length * 15
    const sessionGold = Math.round((baseGold + exBonus + prBonus) * goldBoost)
    const goldEarned = sessionGold + questGoldEarned
    next = { ...next, gold: (next.gold || 0) + goldEarned }

    // Toast
    const subBits: string[] = [`+${sessionGold}🪙`]
    if (exercises.length > 0) subBits.push(`${exercises.length} ex`)
    if (prsHit.length > 0) subBits.push(`🏆 ${prsHit.length} PR!`)
    addToast({ title: "SESSION LOGGED", body: actType.name, sub: subBits.join(" · ") })

    // Clear gold boost
    next = { ...next, activeEffects: { ...next.activeEffects, gold_boost: 1 } }

    if (prsHit.length > 0) showPRFlash(prsHit[0].name, prsHit[0].val)

    next = checkAchievementsOnState(next, get)
    save(next)
  },

  updateSession: (sessId, exercises, note) => {
    const { data, save, showPRFlash } = get()
    const session = data.sessions.find(s => s.id === sessId)
    if (!session) return
    const oldVolume = sessionVolume(session)
    const updatedSession = { ...session, exercises, note }
    const actType = data.activityTypes.find(a => a.id === session.type)

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
    get().addToast({ title: "Session updated", body: `${actType?.name || session.type.toUpperCase()} · ${exercises.length} ex`, sub: `Δ vol: ${Math.round(sessionVolume(updatedSession) - oldVolume)} kg` })
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

  // ── Activity types ──────────────────────────────────────────────────────────

  addActivityType: (act) => {
    const { data, save } = get()
    const newAct: ActivityType = { ...act, id: "act_" + Date.now() }
    save({
      ...data,
      activityTypes: [...data.activityTypes, newAct],
      targets: { ...data.targets, [newAct.id]: 0 },
    })
  },

  updateActivityType: (id, patch) => {
    const { data, save } = get()
    save({ ...data, activityTypes: data.activityTypes.map(a => a.id === id ? { ...a, ...patch } : a) })
  },

  deleteActivityType: (id) => {
    const { data, save } = get()
    const targets = { ...data.targets }
    delete targets[id]
    save({ ...data, activityTypes: data.activityTypes.filter(a => a.id !== id), targets })
  },

  // ── Bodyweight ──────────────────────────────────────────────────────────────

  logBodyweight: (value) => {
    const { data, save, addToast } = get()
    const next: AppState = {
      ...data,
      xp: data.xp + data.xpRules.bodyweightLog,
      stats: addStatClamped(data.stats, "mnd", 0.3),
      bodyweight: { ...data.bodyweight, history: [...data.bodyweight.history, { ts: Date.now(), value }] },
    }
    addToast({ title: `BOSS HIT! -${data.xpRules.bodyweightLog} HP`, body: `Bodyweight: ${value} kg`, kind: "xp" })
    save(next)
  },

  updateBwGoal: (goal) => {
    const { data, save } = get()
    save({ ...data, bodyweight: { ...data.bodyweight, goal } })
  },

  logBodyfat: (value) => {
    const { data, save } = get()
    const bf = data.bodyweight.bodyfat
    save({ ...data, bodyweight: { ...data.bodyweight, bodyfat: { ...bf, history: [...bf.history, { ts: Date.now(), value }] } } })
  },

  updateBfGoal: (goal) => {
    const { data, save } = get()
    save({ ...data, bodyweight: { ...data.bodyweight, bodyfat: { ...data.bodyweight.bodyfat, goal } } })
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

  // ── Quests ──────────────────────────────────────────────────────────────────

  addDailyQuest: (quest) => {
    const { data, save } = get()
    save({ ...data, dailyQuests: [...(data.dailyQuests || []), { ...quest, id: "dq_" + Date.now() }] })
  },

  removeDailyQuest: (id) => {
    const { data, save } = get()
    save({ ...data, dailyQuests: (data.dailyQuests || []).filter(q => q.id !== id) })
  },

  updateDailyQuest: (id, patch) => {
    const { data, save } = get()
    save({ ...data, dailyQuests: (data.dailyQuests || []).map(q => q.id === id ? { ...q, ...patch } : q) })
  },

  completeQuestManually: (questId) => {
    const { data, save, addToast } = get()
    const quest = (data.dailyQuests || []).find(q => q.id === questId)
    if (!quest) return
    const todayK = dayKey(new Date())
    const doneTodaySet = new Set(data.dailyCompletions?.[todayK] || [])
    if (doneTodaySet.has(questId)) return
    doneTodaySet.add(questId)
    const next: AppState = {
      ...data,
      xp: data.xp + quest.xp,
      questsDone: (data.questsDone || 0) + 1,
      dailyCompletions: { ...(data.dailyCompletions || {}), [todayK]: [...doneTodaySet] },
    }
    addToast({ title: "DAILY QUEST", body: quest.desc, sub: `+${quest.xp} DMG`, kind: "xp" })

    // Also check weekly quests after manual daily completion
    const wkKey = weekKey()
    let wkNext = next
    const doneThisWeekSet = new Set(next.weeklyCompletions?.[wkKey] || [])
    for (const wq of (next.weeklyQuests || [])) {
      if (doneThisWeekSet.has(wq.id)) continue
      if (weeklyQuestProgressValue(wkNext, wq) >= wq.target) {
        doneThisWeekSet.add(wq.id)
        wkNext = {
          ...wkNext,
          xp: wkNext.xp + wq.xp,
          weeklyQuestsDone: (wkNext.weeklyQuestsDone || 0) + 1,
          weeklyCompletions: { ...(wkNext.weeklyCompletions || {}), [wkKey]: [...doneThisWeekSet] },
        }
        addToast({ title: "WEEKLY QUEST", body: wq.desc, sub: `+${wq.xp} DMG`, kind: "xp" })
      }
    }
    save(wkNext)
  },

  addWeeklyQuest: (quest) => {
    const { data, save } = get()
    save({ ...data, weeklyQuests: [...(data.weeklyQuests || []), { ...quest, id: "wq_" + Date.now() }] })
  },

  removeWeeklyQuest: (id) => {
    const { data, save } = get()
    save({ ...data, weeklyQuests: (data.weeklyQuests || []).filter(q => q.id !== id) })
  },

  updateWeeklyQuest: (id, patch) => {
    const { data, save } = get()
    save({ ...data, weeklyQuests: (data.weeklyQuests || []).map(q => q.id === id ? { ...q, ...patch } : q) })
  },

  // ── Shop ────────────────────────────────────────────────────────────────────

  buyItem: (itemId) => {
    const { data, save, addToast } = get()
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item || (data.gold || 0) < item.cost) return
    save({
      ...data,
      gold: (data.gold || 0) - item.cost,
      inventory: { ...data.inventory, [itemId]: ((data.inventory || {})[itemId] || 0) + 1 },
    })
    addToast({ title: "PURCHASED", body: `${item.icon} ${item.name}`, sub: `-${item.cost}🪙` })
  },

  useItem: (itemId) => {
    const { data, save, addToast } = get()
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item || !((data.inventory || {})[itemId] > 0)) return
    const inv = { ...data.inventory, [itemId]: data.inventory[itemId] - 1 }
    let next: AppState = { ...data, inventory: inv }

    if (item.effect === "instant_xp") {
      next = { ...next, xp: next.xp + item.value }
      if (next.currentBoss) {
        const newHp = Math.max(0, next.currentBoss.hp - item.value)
        if (newHp <= 0) {
          const bossIdx = next.currentBoss.idx
          const bossConfig = BOSSES[Math.min(bossIdx, BOSSES.length - 1)]
          const gearRolled = rollGacha(bossIdx)
          next = {
            ...next,
            currentBoss: null,
            bossKills: { ...(next.bossKills || {}), [bossIdx]: ((next.bossKills || {})[bossIdx] || 0) + 1 },
          }
          set({ gachaResult: [gearRolled] })
          addToast({ title: "BOSS DEFEATED!", body: bossConfig.name + " fell to your " + item.name + "!" })
        } else {
          next = { ...next, currentBoss: { ...next.currentBoss, hp: newHp } }
          addToast({ title: `${item.icon} BOSS HIT! -${item.value} HP`, body: "Direct damage!", kind: "xp" })
        }
      } else {
        addToast({ title: `${item.icon} ${item.name}`, body: `+${item.value} XP`, kind: "xp" })
      }
    } else if (item.effect === "dmg_boost") {
      const existing = next.activeEffects?.dmg_boost ?? 1
      next = { ...next, activeEffects: { ...next.activeEffects, dmg_boost: Math.max(existing, item.value) } }
      addToast({ title: `${item.icon} ${item.name}`, body: `Next session hits ×${item.value}!`, sub: "Buff active" })
    } else if (item.effect === "gold_boost") {
      next = { ...next, activeEffects: { ...next.activeEffects, gold_boost: item.value } }
      addToast({ title: `${item.icon} ${item.name}`, body: `Next session earns ×${item.value} gold!`, sub: "Buff active" })
    }

    save(next)
  },

  // ── Boss & Gacha ─────────────────────────────────────────────────────────────

  startBossBattle: (idx) => {
    const { data, save, addToast } = get()
    if (data.currentBoss) return
    const bossConfig = BOSSES[Math.min(idx, BOSSES.length - 1)]
    const maxHp = bossConfig.hp + Math.max(0, idx - (BOSSES.length - 1)) * 500
    save({ ...data, currentBoss: { idx, hp: maxHp } })
    addToast({ title: "BOSS BATTLE STARTED!", body: bossConfig.name, sub: `${maxHp.toLocaleString()} HP to defeat` })
  },

  abandonBoss: () => {
    const { data, save } = get()
    if (!data.currentBoss) return
    save({ ...data, currentBoss: null })
  },

  equipGear: (slot, gearId) => {
    const { data, save } = get()
    const equipped = data.equipped || { weapon: null, helmet: null, armor: null, ring: null }
    save({ ...data, equipped: { ...equipped, [slot]: gearId } })
  },

  claimGachaResult: () => {
    const { data, save } = get()
    const results = get().gachaResult
    const preClaimed = get().gachaPreClaimed
    if (!results) return
    set({ gachaResult: null, gachaPreClaimed: false })
    if (!preClaimed) {
      const gearItems = results.filter((r): r is GearItem => r !== "salt")
      if (gearItems.length > 0) {
        const newGear = gearItems.reduce((acc, item) => {
          acc[item.id] = (acc[item.id] || 0) + 1
          return acc
        }, { ...(data.gear || {}) } as Record<string, number>)
        save({ ...data, gear: newGear })
      }
    }
  },

  pullGacha: (count) => {
    const { data, save, addToast } = get()
    const cost = count === 1 ? 50 : 500
    if ((data.gold || 0) < cost) {
      addToast({ title: "NOT ENOUGH GOLD", body: `Need ${cost}🪙 to pull` })
      return
    }
    const rolls = Array.from({ length: count }, () => rollShopGacha())
    const results: Array<GearItem | "salt"> = rolls.map(r => r === null ? "salt" : r)
    const gearItems = rolls.filter((r): r is GearItem => r !== null)
    const newGear = gearItems.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1
      return acc
    }, { ...(data.gear || {}) } as Record<string, number>)
    save({ ...data, gold: (data.gold || 0) - cost, gear: newGear })
    set({ gachaResult: results, gachaPreClaimed: true })
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

  setTheme: (theme) => {
    const { data, save } = get()
    document.documentElement.classList.remove("theme-dark", "theme-light")
    document.documentElement.classList.add(`theme-${theme}`)
    save({ ...data, ui: { ...data.ui, theme } })
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
