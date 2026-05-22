"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { est1RM, getStrengthLevel } from "@/lib/game-logic"
import { EXERCISE_MUSCLES, MUSCLE_GROUPS, STRENGTH_LEVELS } from "@/lib/constants"

const PUSH_MUSCLES = ["chest", "shoulders", "triceps"]
const PULL_MUSCLES = ["back", "biceps"]
const UPPER_MUSCLES = ["chest", "back", "shoulders", "biceps", "triceps"]
const LOWER_MUSCLES = ["quads", "hamstrings", "glutes", "adductors", "abductors"]

function levelName(idx: number) {
  return idx >= 1 && idx <= 5 ? STRENGTH_LEVELS[idx - 1].name : "Untrained"
}
function levelColor(idx: number) {
  return idx >= 1 && idx <= 5 ? STRENGTH_LEVELS[idx - 1].color : "#4b5563"
}

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

  // Build per-muscle level map and contributing lifts
  const muscleLevels: Record<string, number[]> = {}
  const muscleLifts: Record<string, string[]> = {}

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
      if (!muscleLifts[m]) muscleLifts[m] = []
      muscleLevels[m].push(sl.levelIndex)
      if (!muscleLifts[m].includes(lift.name)) muscleLifts[m].push(lift.name)
    }
  }

  const avgLevel = (muscles: string[]) => {
    const vals = muscles.flatMap(m => muscleLevels[m] || [])
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  const allTrackedLevels = Object.values(muscleLevels).flat()
  const overallAvg = allTrackedLevels.length
    ? allTrackedLevels.reduce((a, b) => a + b, 0) / allTrackedLevels.length
    : null

  const pushAvg = avgLevel(PUSH_MUSCLES)
  const pullAvg = avgLevel(PULL_MUSCLES)

  // All muscles, tracked + untracked
  const allMuscles = Object.entries(MUSCLE_GROUPS).map(([id, def]) => {
    const levels = muscleLevels[id] || []
    const avg = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0
    const roundedIdx = Math.round(avg)
    return {
      id, ...def,
      avg,
      levelIdx: roundedIdx,
      lifts: muscleLifts[id] || [],
      tracked: levels.length > 0,
    }
  })

  const upperMuscles = allMuscles.filter(m => UPPER_MUSCLES.includes(m.id))
  const lowerMuscles = allMuscles.filter(m => LOWER_MUSCLES.includes(m.id))

  function MuscleRow({ m }: { m: typeof allMuscles[0] }) {
    const isWeak = overallAvg !== null && m.tracked && m.avg < overallAvg - 0.75
    const barPct = (m.avg / 5) * 100

    return (
      <div className="p-3 bg-panel2 border border-line rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: m.tracked ? m.color : "#4b5563" }}>{m.name}</span>
          <div className="flex items-center gap-2">
            {isWeak && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>FOCUS</span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: levelColor(m.levelIdx) + "22", color: levelColor(m.levelIdx) }}>
              {levelName(m.levelIdx)}
            </span>
          </div>
        </div>

        {/* 5-segment level bar */}
        <div className="flex gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="flex-1 h-2 rounded-sm"
              style={{
                background: i <= m.levelIdx
                  ? STRENGTH_LEVELS[i - 1].color
                  : "#1a1d24",
              }}
            />
          ))}
        </div>

        {/* Continuous fill bar */}
        <div className="h-1 bg-[#0a0b0e] rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barPct}%`, background: m.tracked ? m.color : "#2a2d36" }}
          />
        </div>

        {m.lifts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {m.lifts.map(l => (
              <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffffff08] text-muted">{l}</span>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-muted">No exercises tracked — add one to measure this muscle</div>
        )}
      </div>
    )
  }

  return (
    <div className="section mt-5">
      <h3 className="section-h">Muscle Balance</h3>

      {/* Push / Pull summary */}
      {(pushAvg !== null || pullAvg !== null) && (
        <div className="mb-4 p-3 bg-panel2 border border-line rounded-xl">
          <div className="text-[11px] text-muted uppercase tracking-wider font-bold mb-2">Push vs Pull</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Push", muscles: "Chest · Shoulders · Triceps", avg: pushAvg },
              { label: "Pull", muscles: "Back · Biceps", avg: pullAvg },
            ].map(g => {
              const idx = g.avg !== null ? Math.round(g.avg) : 0
              return (
                <div key={g.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{g.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: levelColor(idx) }}>{levelName(idx)}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex-1 h-1.5 rounded-sm"
                        style={{ background: i <= idx ? STRENGTH_LEVELS[i - 1].color : "#1a1d24" }} />
                    ))}
                  </div>
                  <div className="text-[10px] text-muted">{g.muscles}</div>
                </div>
              )
            })}
          </div>
          {pushAvg !== null && pullAvg !== null && Math.abs(pushAvg - pullAvg) > 1 && (
            <div className="mt-2 text-[11px] text-gold">
              {pushAvg > pullAvg
                ? "Push is stronger — add more back and bicep work."
                : "Pull is stronger — add more chest and shoulder work."}
            </div>
          )}
        </div>
      )}

      {/* Upper body */}
      <div className="mb-1">
        <div className="text-[11px] text-muted font-bold uppercase tracking-[2px] mb-2">Upper Body</div>
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          {upperMuscles.map(m => <MuscleRow key={m.id} m={m} />)}
        </div>
      </div>

      {/* Lower body */}
      <div className="mt-4">
        <div className="text-[11px] text-muted font-bold uppercase tracking-[2px] mb-2">Lower Body</div>
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          {lowerMuscles.map(m => <MuscleRow key={m.id} m={m} />)}
        </div>
      </div>

      {overallAvg !== null && (
        <div className="mt-3 text-[11px] text-muted">
          Overall: <strong style={{ color: levelColor(Math.round(overallAvg)) }}>{levelName(Math.round(overallAvg))}</strong>
          {" · "}{allMuscles.filter(m => m.tracked && overallAvg !== null && m.avg < overallAvg - 0.75).length} muscle(s) need focus
          {" · "}{allMuscles.filter(m => !m.tracked).length} untracked
        </div>
      )}
    </div>
  )
}
