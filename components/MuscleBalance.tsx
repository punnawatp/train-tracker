"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { est1RM, getStrengthLevel } from "@/lib/game-logic"
import { EXERCISE_MUSCLES, MUSCLE_GROUPS, STRENGTH_LEVELS } from "@/lib/constants"

const PUSH_MUSCLES = ["chest", "shoulders", "triceps"]
const PULL_MUSCLES = ["back", "biceps"]

export default function MuscleBalance() {
  const data = useTrainStore(s => s.data)
  const bodyweight = data.bodyweight.history.slice(-1)[0]?.value ?? 0

  if (!bodyweight) {
    return (
      <div className="section mt-5">
        <h3 className="section-h">Muscle Balance</h3>
        <div className="py-6 text-center text-muted text-sm border border-dashed border-line rounded-xl">
          Log your bodyweight to unlock muscle balance analysis.
        </div>
      </div>
    )
  }

  // Build per-muscle level map from tracked lifts
  const muscleLevels: Record<string, number[]> = {}
  for (const lift of data.lifts) {
    const key = lift.name.toLowerCase().replace(/[^a-z]/g, "")
    const muscles = EXERCISE_MUSCLES[key]
    if (!muscles) continue
    const best1RM = lift.history.reduce((b, h) => Math.max(b, est1RM(h.weight, h.reps)), lift.current || 0)
    if (best1RM <= 0) continue
    const sl = getStrengthLevel(lift.name, best1RM, bodyweight)
    if (!sl) continue
    for (const m of muscles.primary) {
      if (!muscleLevels[m]) muscleLevels[m] = []
      muscleLevels[m].push(sl.levelIndex)
    }
  }

  const avgLevel = (muscles: string[]) => {
    const vals = muscles.flatMap(m => muscleLevels[m] || [])
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  const allTracked = Object.values(muscleLevels).flat()
  const overallAvg = allTracked.length ? allTracked.reduce((a, b) => a + b, 0) / allTracked.length : null

  const pushAvg = avgLevel(PUSH_MUSCLES)
  const pullAvg = avgLevel(PULL_MUSCLES)

  const muscleEntries = Object.entries(MUSCLE_GROUPS).map(([id, def]) => ({
    id, ...def,
    avg: avgLevel([id]),
  })).filter(m => m.avg !== null) as { id: string; name: string; color: string; avg: number }[]

  muscleEntries.sort((a, b) => a.avg - b.avg)

  const levelName = (v: number) => {
    const idx = Math.round(v) - 1
    return idx >= 0 && idx < STRENGTH_LEVELS.length ? STRENGTH_LEVELS[idx].name : "Untrained"
  }
  const levelColor = (v: number) => {
    const idx = Math.round(v) - 1
    return idx >= 0 && idx < STRENGTH_LEVELS.length ? STRENGTH_LEVELS[idx].color : "#4b5563"
  }

  return (
    <div className="section mt-5">
      <h3 className="section-h">Muscle Balance</h3>

      {muscleEntries.length === 0 ? (
        <div className="py-6 text-center text-muted text-sm border border-dashed border-line rounded-xl">
          Log some lifts with weight to see your muscle balance.
        </div>
      ) : (
        <>
          {/* Push / Pull balance */}
          {pushAvg !== null && pullAvg !== null && (
            <div className="mb-4 p-3 bg-panel2 border border-line rounded-xl">
              <div className="text-[11px] text-muted uppercase tracking-wider font-bold mb-2">Push vs Pull</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Push", muscles: "Chest · Shoulders · Triceps", avg: pushAvg },
                  { label: "Pull", muscles: "Back · Biceps", avg: pullAvg },
                ].map(g => (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{g.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: levelColor(g.avg) }}>{levelName(g.avg)}</span>
                    </div>
                    <div className="h-2 bg-[#0a0b0e] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(g.avg / 5) * 100}%`, background: levelColor(g.avg) }} />
                    </div>
                    <div className="text-[10px] text-muted mt-1">{g.muscles}</div>
                  </div>
                ))}
              </div>
              {Math.abs(pushAvg - pullAvg) > 1 && (
                <div className="mt-2 text-[11px] text-gold">
                  {pushAvg > pullAvg
                    ? "Your push is stronger — focus on back and biceps to balance."
                    : "Your pull is stronger — balanced upper body needs more push work."}
                </div>
              )}
            </div>
          )}

          {/* Per-muscle breakdown */}
          <div className="flex flex-col gap-2">
            {muscleEntries.map(m => {
              const isWeak = overallAvg !== null && m.avg < overallAvg - 0.5
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-bold shrink-0" style={{ color: m.color }}>{m.name}</div>
                  <div className="flex-1 h-2.5 bg-[#0a0b0e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(m.avg / 5) * 100}%`, background: m.color }}
                    />
                  </div>
                  <div className="w-28 text-[11px] font-bold shrink-0" style={{ color: levelColor(m.avg) }}>
                    {levelName(m.avg)}
                  </div>
                  {isWeak && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                      FOCUS
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {overallAvg !== null && (
            <div className="mt-3 text-[11px] text-muted">
              Overall average: <strong className="text-tx" style={{ color: levelColor(overallAvg) }}>{levelName(overallAvg)}</strong>
              {" · "}{muscleEntries.filter(m => m.avg < overallAvg - 0.5).length} muscle{muscleEntries.filter(m => m.avg < overallAvg - 0.5).length !== 1 ? "s" : ""} need focus
            </div>
          )}
        </>
      )}
    </div>
  )
}
