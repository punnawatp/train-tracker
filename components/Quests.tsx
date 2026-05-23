"use client"

import { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { dayKey, isDailyQuestDone, todaySessions, weekKey, weeklyQuestProgressValue } from "@/lib/game-logic"
import type { QuestCheckType, WeeklyMetric } from "@/lib/types"

export default function Quests() {
  const data = useTrainStore(s => s.data)
  const addDailyQuest = useTrainStore(s => s.addDailyQuest)
  const removeDailyQuest = useTrainStore(s => s.removeDailyQuest)
  const completeQuestManually = useTrainStore(s => s.completeQuestManually)
  const addWeeklyQuest = useTrainStore(s => s.addWeeklyQuest)
  const removeWeeklyQuest = useTrainStore(s => s.removeWeeklyQuest)

  const [showAddDaily, setShowAddDaily] = useState(false)
  const [showAddWeekly, setShowAddWeekly] = useState(false)
  const [dDesc, setDDesc] = useState("")
  const [dCoins, setDCoins] = useState("50")
  const [dCheckType, setDCheckType] = useState<QuestCheckType>("any_session")
  const [dActivityId, setDActivityId] = useState("")
  const [wDesc, setWDesc] = useState("")
  const [wCoins, setWCoins] = useState("100")
  const [wMetric, setWMetric] = useState<WeeklyMetric>("sessions")
  const [wTarget, setWTarget] = useState("3")
  const [wActivityId, setWActivityId] = useState("")

  const todayK = dayKey(new Date())
  const wkKey = weekKey()
  const todaySess = todaySessions(data.sessions)
  const doneTodayIds = new Set(data.dailyCompletions?.[todayK] || [])
  const completedThisWeek = new Set(data.weeklyCompletions?.[wkKey] || [])

  // Compute effective done (includes auto-completed)
  const effectiveDone = new Set(doneTodayIds)
  for (const q of (data.dailyQuests || [])) {
    if (!effectiveDone.has(q.id) && isDailyQuestDone(data, q, todaySess)) {
      effectiveDone.add(q.id)
    }
  }

  function saveDaily() {
    if (!dDesc.trim()) return
    addDailyQuest({
      desc: dDesc.trim(),
      coinReward: parseInt(dCoins) || 50,
      checkType: dCheckType,
      ...(dCheckType === "activity_session" && dActivityId ? { activityId: dActivityId } : {}),
    })
    setDDesc(""); setDCoins("50"); setDCheckType("any_session"); setDActivityId("")
    setShowAddDaily(false)
  }

  function saveWeekly() {
    if (!wDesc.trim()) return
    addWeeklyQuest({
      desc: wDesc.trim(),
      coinReward: parseInt(wCoins) || 100,
      metric: wMetric,
      target: parseInt(wTarget) || 3,
      ...(wMetric === "activity_sessions" && wActivityId ? { activityId: wActivityId } : {}),
    })
    setWDesc(""); setWCoins("100"); setWMetric("sessions"); setWTarget("3"); setWActivityId("")
    setShowAddWeekly(false)
  }

  return (
    <div className="mb-3.5">
      {/* Daily quests */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold uppercase tracking-[2px] text-muted">Daily Quests</div>
          <button onClick={() => setShowAddDaily(v => !v)} className="text-[11px] text-accent hover:opacity-70 transition">
            {showAddDaily ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showAddDaily && (
          <div className="mb-2 p-3 rounded-xl bg-panel2 border border-line">
            <input
              className="modal-input mb-2"
              placeholder="Quest description"
              value={dDesc}
              onChange={e => setDDesc(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <div className="text-[10px] text-muted uppercase mb-1">Completion</div>
                <select value={dCheckType} onChange={e => setDCheckType(e.target.value as QuestCheckType)} className="modal-input">
                  <option value="any_session">Any session logged</option>
                  <option value="activity_session">Specific activity</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase mb-1">Coins</div>
                <input type="number" value={dCoins} onChange={e => setDCoins(e.target.value)} className="modal-input w-20" />
              </div>
            </div>
            {dCheckType === "activity_session" && (
              <select value={dActivityId} onChange={e => setDActivityId(e.target.value)} className="modal-input mb-2">
                <option value="">Select activity...</option>
                {data.activityTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddDaily(false)} className="btn-ghost">Cancel</button>
              <button onClick={saveDaily} className="btn-primary" disabled={!dDesc.trim()}>Add</button>
            </div>
          </div>
        )}

        {(data.dailyQuests || []).length === 0 ? (
          <div className="text-[11px] text-muted py-1.5">No daily quests — add one to start tracking.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {(data.dailyQuests || []).map(quest => {
              const done = effectiveDone.has(quest.id)
              return (
                <div
                  key={quest.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-panel2 border border-line"
                  style={{ borderLeftWidth: 3, borderLeftColor: done ? "#4ade80" : "#fbbf24" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-0.5"
                      style={{ color: done ? "#4ade80" : "#fbbf24" }}>
                      {done ? "✓ Done" : "Daily"}
                    </div>
                    <div className="text-sm">{quest.desc}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ background: done ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)", color: done ? "#4ade80" : "#fbbf24" }}>
                      {done ? "✓ " : "+"}{quest.coinReward}🪙
                    </span>
                    {!done && quest.checkType === "manual" && (
                      <button
                        onClick={() => completeQuestManually(quest.id)}
                        className="text-[11px] px-2 py-1 rounded transition"
                        style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                      >
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => removeDailyQuest(quest.id)}
                      className="text-muted hover:text-red-400 transition text-base leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Weekly quests */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold uppercase tracking-[2px] text-muted">Weekly Quests</div>
          <button onClick={() => setShowAddWeekly(v => !v)} className="text-[11px] text-accent hover:opacity-70 transition">
            {showAddWeekly ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showAddWeekly && (
          <div className="mb-2 p-3 rounded-xl bg-panel2 border border-line">
            <input
              className="modal-input mb-2"
              placeholder="Quest description"
              value={wDesc}
              onChange={e => setWDesc(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <div className="text-[10px] text-muted uppercase mb-1">Metric</div>
                <select value={wMetric} onChange={e => setWMetric(e.target.value as WeeklyMetric)} className="modal-input">
                  <option value="sessions">Total sessions</option>
                  <option value="days">Training days</option>
                  <option value="activity_sessions">Activity sessions</option>
                  <option value="prs">PRs hit</option>
                  <option value="daily_completions">Daily quests done</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase mb-1">Target</div>
                <input type="number" min="1" value={wTarget} onChange={e => setWTarget(e.target.value)} className="modal-input w-20" />
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase mb-1">Coins</div>
                <input type="number" value={wCoins} onChange={e => setWCoins(e.target.value)} className="modal-input w-20" />
              </div>
            </div>
            {wMetric === "activity_sessions" && (
              <select value={wActivityId} onChange={e => setWActivityId(e.target.value)} className="modal-input mb-2">
                <option value="">Select activity...</option>
                {data.activityTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddWeekly(false)} className="btn-ghost">Cancel</button>
              <button onClick={saveWeekly} className="btn-primary" disabled={!wDesc.trim()}>Add</button>
            </div>
          </div>
        )}

        {(data.weeklyQuests || []).length === 0 ? (
          <div className="text-[11px] text-muted py-1.5">No weekly quests — add one to start tracking.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {(data.weeklyQuests || []).map(quest => {
              const done = completedThisWeek.has(quest.id)
              const progress = weeklyQuestProgressValue(data, quest)
              const pct = Math.min(100, (progress / quest.target) * 100)
              return (
                <div
                  key={quest.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-panel2 border border-line"
                  style={{ borderLeftWidth: 3, borderLeftColor: done ? "#4ade80" : "#b388ff" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] mb-0.5"
                      style={{ color: done ? "#4ade80" : "#b388ff" }}>
                      {done ? "✓ Done" : "Weekly"}
                    </div>
                    <div className="text-sm mb-1">{quest.desc}</div>
                    {!done && (
                      <>
                        <div className="h-1 bg-[#0a0b0e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: "#b388ff" }} />
                        </div>
                        <div className="text-[10px] text-muted mt-1">{Math.round(progress)} / {quest.target}</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ background: done ? "rgba(74,222,128,0.15)" : "rgba(179,136,255,0.15)", color: done ? "#4ade80" : "#b388ff" }}>
                      {done ? "✓ " : "+"}{quest.coinReward}🪙
                    </span>
                    <button
                      onClick={() => removeWeeklyQuest(quest.id)}
                      className="text-muted hover:text-red-400 transition text-base leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
