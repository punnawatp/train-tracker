"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { dayKey, getDailyQuest, weekKey, weeklyQuestProgress } from "@/lib/game-logic"

export default function Quests() {
  const data = useTrainStore(s => s.data)
  const dq = getDailyQuest()
  const todayK = dayKey(new Date())
  const dqDone = data.lastQuestCompletedDate === todayK

  const wqProg = weeklyQuestProgress(data)
  const wkKey = weekKey()
  const wqDone = data.lastWeeklyQuestWeek === wkKey || wqProg.done

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3.5 max-sm:grid-cols-1">
      {/* Daily quest */}
      <div
        className="p-3 rounded-xl flex items-center justify-between gap-2.5"
        style={{
          background: "#1c1f26",
          borderLeft: `3px solid ${dqDone ? "#4ade80" : "#fbbf24"}`,
        }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: dqDone ? "#4ade80" : "#fbbf24" }}>
            Daily Quest{dqDone ? " · ✓" : ""}
          </div>
          <div className="text-sm mt-0.5">{dq.desc}</div>
        </div>
        <div
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0"
          style={{ background: dqDone ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)", color: dqDone ? "#4ade80" : "#fbbf24" }}
        >
          {dqDone ? "✓ " : "+"}{dq.xp} XP
        </div>
      </div>

      {/* Weekly quest */}
      <div
        className="p-3 rounded-xl flex items-center justify-between gap-2.5"
        style={{
          background: "#1c1f26",
          borderLeft: `3px solid ${wqDone ? "#4ade80" : "#b388ff"}`,
        }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: wqDone ? "#4ade80" : "#b388ff" }}>
            Weekly Quest{wqDone ? " · ✓" : ""}
          </div>
          <div className="text-sm mt-0.5">{wqProg.desc}</div>
          {!wqDone && <div className="text-[11px] text-muted mt-0.5">{Math.round(wqProg.value)} / {wqProg.total}{wqProg.unit}</div>}
        </div>
        <div
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0"
          style={{ background: wqDone ? "rgba(74,222,128,0.15)" : "rgba(179,136,255,0.15)", color: wqDone ? "#4ade80" : "#b388ff" }}
        >
          {wqDone ? "✓ " : "+"}{wqProg.xp} XP
        </div>
      </div>
    </div>
  )
}
