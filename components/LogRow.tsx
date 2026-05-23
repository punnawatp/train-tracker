"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { countByType, todaySessions } from "@/lib/game-logic"
import { burstConfetti } from "./ui/Confetti"

interface Props {
  onOpenExerciseModal: (activityId: string) => void
  onOpenActivityModal: (activityId?: string) => void
}

export default function LogRow({ onOpenExerciseModal, onOpenActivityModal }: Props) {
  const data = useTrainStore(s => s.data)
  const logSession = useTrainStore(s => s.logSession)
  const counts = countByType(todaySessions(data.sessions))

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold uppercase tracking-[2px] text-muted">Log Today</div>
        <button onClick={() => onOpenActivityModal()} className="text-[11px] text-accent hover:opacity-70 transition">
          + Add activity
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {data.activityTypes.map(act => {
          const count = counts[act.id] || 0
          return (
            <button
              key={act.id}
              onClick={e => {
                if (act.hasExercises) { onOpenExerciseModal(act.id); return }
                logSession(act.id)
                burstConfetti(e.clientX, e.clientY)
              }}
              className="group relative flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${act.color}18, ${act.color}08)`,
                border: `1.5px solid ${act.color}30`,
              }}
            >
              {/* Color accent bar */}
              <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: act.color }} />

              <div className="flex-1 min-w-0">
                <div className="text-base font-extrabold tracking-tight" style={{ color: act.color }}>
                  + {act.name}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: act.color + "99" }}>
                  +{act.coinReward}🪙 per session
                </div>
              </div>

              {count > 0 ? (
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-sm shrink-0"
                  style={{ background: act.color, color: "#fff" }}
                >
                  {count}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 opacity-30"
                  style={{ border: `2px solid ${act.color}`, color: act.color }}
                >
                  +
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
