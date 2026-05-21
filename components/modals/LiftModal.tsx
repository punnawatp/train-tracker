"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"

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
