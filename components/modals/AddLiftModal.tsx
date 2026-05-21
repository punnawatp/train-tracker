"use client"

import { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"

interface Props {
  open: boolean
  onClose: () => void
}

export default function AddLiftModal({ open, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const addLift = useTrainStore(s => s.addLift)

  const [name, setName] = useState("")
  const [cat, setCat] = useState(data.categories[0]?.id || "lower")
  const [current, setCurrent] = useState("0")
  const [goal, setGoal] = useState("")
  const [reps, setReps] = useState("8")

  function save() {
    if (!name.trim()) return
    addLift({
      id: "custom_" + Date.now(),
      name: name.trim(),
      cat,
      current: parseFloat(current) || 0,
      goal: parseFloat(goal) || 0,
      targetReps: Math.max(1, parseInt(reps) || 8),
    })
    setName(""); setCurrent("0"); setGoal(""); setReps("8")
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="text-lg font-bold mb-4">Add Lift</h2>

        <label className="field-label">Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="modal-input" placeholder="e.g. Calf Raise" />

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

        <div className="flex gap-2.5 mt-5 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} className="btn-primary">Add</button>
        </div>
      </div>
    </div>
  )
}
