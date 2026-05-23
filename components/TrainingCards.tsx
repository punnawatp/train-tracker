"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { countByType, todaySessions } from "@/lib/game-logic"
import { burstConfetti } from "./ui/Confetti"

interface Props {
  onOpenExerciseModal: (activityId: string) => void
  onOpenActivityModal: (activityId?: string) => void
}

export default function TrainingCards({ onOpenExerciseModal, onOpenActivityModal }: Props) {
  const data = useTrainStore(s => s.data)
  const logSession = useTrainStore(s => s.logSession)
  const setTarget = useTrainStore(s => s.setTarget)
  const counts = countByType(todaySessions(data.sessions))

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {data.activityTypes.map(act => {
          const count = counts[act.id] || 0
          const target = data.targets[act.id] ?? 0
          const pct = target === 0 ? 0 : Math.min(100, (count / target) * 100)
          return (
            <div key={act.id} className="bg-panel border border-line rounded-[14px] p-4">
              <h2 className="flex items-center gap-2 mb-0 text-base font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: act.color + "26", color: act.color }}>
                  {act.name}
                </span>
                <span className="ml-auto text-[11px] text-gold font-bold">+{act.coinReward}🪙</span>
                <button
                  onClick={() => onOpenActivityModal(act.id)}
                  className="text-muted hover:text-tx text-base leading-none px-0.5"
                  title="Edit activity"
                >✎</button>
              </h2>
              <div className="flex items-center justify-between mt-2.5">
                <div className="text-[28px] font-bold tracking-tight leading-none">
                  {count}<span className="text-muted text-lg font-normal">/{target}</span>
                </div>
                <label className="flex items-center gap-1.5 text-muted text-sm">
                  Goal
                  <input
                    type="number" min={0} max={14} value={target}
                    onChange={e => setTarget(act.id, parseInt(e.target.value) || 0)}
                    className="w-14 bg-panel2 border border-line rounded text-center text-sm text-tx px-1.5 py-1 focus:outline-none focus:border-accent"
                  />
                </label>
              </div>
              <div className="mt-3.5 h-2.5 bg-[#0b0c10] rounded-lg overflow-hidden">
                <div className="h-full rounded-lg transition-all duration-300" style={{ width: `${pct}%`, background: act.color }} />
              </div>
              <button
                onClick={e => {
                  if (act.hasExercises) { onOpenExerciseModal(act.id); return }
                  logSession(act.id)
                  burstConfetti(e.clientX, e.clientY)
                }}
                className="mt-3.5 w-full py-3 rounded-xl font-bold text-sm text-white bg-accent transition hover:opacity-90 active:scale-[0.97]"
              >
                + Log {act.name}
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => onOpenActivityModal()}
        className="self-start mini-btn"
      >
        + Add activity
      </button>
    </div>
  )
}
