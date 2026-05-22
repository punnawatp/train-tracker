"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { est1RM, getStrengthLevel } from "@/lib/game-logic"
import { STRENGTH_LEVELS } from "@/lib/constants"

interface Props {
  open: boolean
  liftId: string | null
  onClose: () => void
}

export default function LiftModal({ open, liftId, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const updateLift = useTrainStore(s => s.updateLift)
  const deleteLift = useTrainStore(s => s.deleteLift)

  const lift = liftId ? data.lifts.find(l => l.id === liftId) : null
  const bodyweight = data.bodyweight.history.slice(-1)[0]?.value ?? 0

  const [name, setName] = useState("")
  const [cat, setCat] = useState("")
  const [current, setCurrent] = useState("")
  const [goal, setGoal] = useState("")
  const [reps, setReps] = useState("8")

  useEffect(() => {
    if (!lift) return
    setName(lift.name)
    setCat(lift.cat)
    setCurrent(String(lift.current ?? 0))
    setGoal(String(lift.goal ?? 0))
    setReps(String(lift.targetReps ?? 8))
  }, [lift])

  function save() {
    if (!liftId || !lift) return
    const newCur = parseFloat(current) || 0
    const newGoal = parseFloat(goal) || 0
    const newReps = Math.max(1, parseInt(reps) || 8)
    const manualCurrentChange = newCur !== lift.current
    updateLift(liftId, { name: name.trim() || lift.name, cat, current: newCur, goal: newGoal, targetReps: newReps }, manualCurrentChange)
    onClose()
  }

  function remove() {
    if (!liftId) return
    if (!confirm("Remove this lift from tracking?")) return
    deleteLift(liftId)
    onClose()
  }

  if (!open || !lift) return null

  const best1RM = lift.history.reduce((best, h) => {
    const e = est1RM(h.weight, h.reps)
    return e > best ? e : best
  }, 0)
  const sl = bodyweight > 0 ? getStrengthLevel(lift.name, best1RM || lift.current, bodyweight) : null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="text-lg font-bold mb-1">{lift.name}</h2>
        <p className="text-muted text-sm mb-4">Current = best weight at target reps or more.</p>

        <label className="field-label">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="modal-input" />

        <label className="field-label">Category</label>
        <select value={cat} onChange={e => setCat(e.target.value)} className="modal-input">
          {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label className="field-label">Current (kg)</label>
        <input type="number" step="0.5" min="0" value={current} onChange={e => setCurrent(e.target.value)} className="modal-input" />

        <label className="field-label">Goal (kg)</label>
        <input type="number" step="0.5" min="0" value={goal} onChange={e => setGoal(e.target.value)} className="modal-input" />

        <label className="field-label">Target reps</label>
        <input type="number" step="1" min="1" max="30" value={reps} onChange={e => setReps(e.target.value)} className="modal-input" />

        {sl ? (
          <div className="mt-4">
            <div className="text-[11px] text-muted uppercase tracking-wider font-bold mb-2">
              Strength levels <span className="normal-case font-normal">(tap to set as goal)</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {STRENGTH_LEVELS.map((lvl, i) => {
                const thresholdKg = sl.thresholds[i]
                const isCurrentLevel = sl.levelIndex === i + 1
                const isPast = sl.levelIndex > i + 1
                return (
                  <button
                    key={lvl.name}
                    onClick={() => setGoal(String(thresholdKg))}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: isCurrentLevel ? lvl.color + "22" : isPast ? "#1c1f26" : "#141619",
                      border: `1px solid ${isCurrentLevel ? lvl.color + "66" : "#262a33"}`,
                    }}
                  >
                    <span className="font-semibold" style={{ color: isPast ? "#4b5563" : lvl.color }}>
                      {isPast ? "✓ " : isCurrentLevel ? "▸ " : ""}{lvl.name}
                    </span>
                    <span className="text-[12px]" style={{ color: isPast ? "#4b5563" : "#9ca3af" }}>
                      {thresholdKg} kg est 1RM
                    </span>
                  </button>
                )
              })}
            </div>
            {!bodyweight && (
              <p className="text-[11px] text-muted mt-2">Log your bodyweight to see personalised thresholds.</p>
            )}
          </div>
        ) : (
          <div className="mt-4 text-[11px] text-muted">
            {bodyweight > 0
              ? "No strength standards found for this exercise name."
              : "Log your bodyweight to unlock strength level goals."}
          </div>
        )}

        <div className="flex items-center justify-between mt-5">
          <button onClick={remove} className="btn-danger">Delete lift</button>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
