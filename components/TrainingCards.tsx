"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { countByType, thisWeekSessions } from "@/lib/game-logic"
import { burstConfetti } from "./ui/Confetti"

interface Props {
  onOpenGymModal: () => void
}

const TYPES = [
  { key: "gym" as const, label: "GYM",  color: "#4cc9f0", bg: "#4cc9f0" },
  { key: "bjj" as const, label: "BJJ",  color: "#b388ff", bg: "#b388ff" },
  { key: "mma" as const, label: "MMA",  color: "#ff7043", bg: "#ff7043" },
]

export default function TrainingCards({ onOpenGymModal }: Props) {
  const data = useTrainStore(s => s.data)
  const logSession = useTrainStore(s => s.logSession)
  const setTarget = useTrainStore(s => s.setTarget)
  const counts = countByType(thisWeekSessions(data.sessions))

  return (
    <div className="grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
      {TYPES.map(({ key, label, color, bg }) => {
        const count = counts[key] || 0
        const target = data.targets[key]
        const pct = target === 0 ? 0 : Math.min(100, (count / target) * 100)
        return (
          <div key={key} className="bg-panel border border-line rounded-[14px] p-4">
            <h2 className="flex items-center gap-2 mb-0 text-base font-bold uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: color + "26", color }}>
                {label}
              </span>
              <span className="ml-auto text-[11px] text-gold font-bold">+{data.xpRules[key]} XP</span>
            </h2>
            <div className="flex items-center justify-between mt-2.5">
              <div className="text-[28px] font-bold tracking-tight leading-none">
                {count}<span className="text-muted text-lg font-normal">/{target}</span>
              </div>
              <label className="flex items-center gap-1.5 text-muted text-sm">
                Goal
                <input
                  type="number" min={0} max={14} value={target}
                  onChange={e => setTarget(key, parseInt(e.target.value) || 0)}
                  className="w-14 bg-panel2 border border-line rounded text-center text-sm text-tx px-1.5 py-1 focus:outline-none focus:border-accent"
                />
              </label>
            </div>
            <div className="mt-3.5 h-2.5 bg-[#0b0c10] rounded-lg overflow-hidden">
              <div className="h-full rounded-lg transition-all duration-300" style={{ width: `${pct}%`, background: bg }} />
            </div>
            <button
              onClick={e => {
                if (key === "gym") { onOpenGymModal(); return }
                logSession(key)
                burstConfetti(e.clientX, e.clientY)
              }}
              className="mt-3.5 w-full py-3 rounded-xl font-bold text-sm text-white bg-accent transition hover:opacity-90 active:scale-[0.97]"
            >
              + Log {label}
            </button>
          </div>
        )
      })}
    </div>
  )
}
