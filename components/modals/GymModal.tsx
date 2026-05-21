"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { burstConfetti } from "@/components/ui/Confetti"
import type { Exercise } from "@/lib/types"

interface Props {
  open: boolean
  sessId?: number
  onClose: () => void
}

export default function GymModal({ open, sessId, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const logSession = useTrainStore(s => s.logSession)
  const updateSession = useTrainStore(s => s.updateSession)
  const deleteSession = useTrainStore(s => s.deleteSession)

  const [note, setNote] = useState("")
  const [rows, setRows] = useState<Partial<Exercise>[]>([{ name: "", weight: undefined, reps: undefined, sets: undefined }])

  useEffect(() => {
    if (!open) return
    if (sessId != null) {
      const s = data.sessions.find(x => x.id === sessId)
      if (s) {
        setNote(s.note || "")
        setRows(s.exercises?.length ? s.exercises.map(e => ({ ...e })) : [{ name: "", weight: undefined, reps: undefined, sets: undefined }])
        return
      }
    }
    setNote("")
    setRows([{ name: "", weight: undefined, reps: undefined, sets: undefined }])
  }, [open, sessId])

  function updateRow(i: number, patch: Partial<Exercise>) {
    setRows(r => r.map((row, j) => j === i ? { ...row, ...patch } : row))
  }

  function save() {
    const exercises: Exercise[] = rows
      .filter(r => r.name?.trim())
      .map(r => ({
        name: String(r.name).trim(),
        weight: parseFloat(String(r.weight)) || 0,
        reps: parseInt(String(r.reps)) || 0,
        sets: parseInt(String(r.sets)) || 0,
      }))
    if (sessId != null) {
      updateSession(sessId, exercises, note.trim())
    } else {
      logSession("gym", exercises, note.trim())
      burstConfetti(undefined, undefined, false)
    }
    onClose()
  }

  function remove() {
    if (!sessId) return
    if (!confirm("Delete this session?")) return
    deleteSession(sessId)
    onClose()
  }

  if (!open) return null

  const liftNames = data.lifts.map(l => l.name)

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="text-lg font-bold mb-1">{sessId != null ? "Edit Session" : "Log Gym Session"}</h2>
        <p className="text-muted text-sm mb-4">Add exercises with weight × reps × sets. PRs auto-recorded.</p>

        <label className="field-label">Notes (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} className="modal-input" placeholder="e.g. push day, felt strong" />

        <div className="grid grid-cols-[2fr_60px_50px_50px_28px] gap-1.5 text-[10px] text-muted uppercase tracking-wider mt-3 mb-1.5">
          <div>Exercise</div><div>Weight</div><div>Reps</div><div>Sets</div><div />
        </div>

        <datalist id="liftList">
          {liftNames.map(n => <option key={n} value={n} />)}
        </datalist>

        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[2fr_60px_50px_50px_28px] gap-1.5 mb-1.5">
            <input list="liftList" value={r.name || ""} onChange={e => updateRow(i, { name: e.target.value })} className="modal-input" placeholder="Exercise" />
            <input type="number" step="0.5" min="0" value={r.weight ?? ""} onChange={e => updateRow(i, { weight: parseFloat(e.target.value) })} className="modal-input" placeholder="kg" />
            <input type="number" min="0" value={r.reps ?? ""} onChange={e => updateRow(i, { reps: parseInt(e.target.value) })} className="modal-input" placeholder="reps" />
            <input type="number" min="0" value={r.sets ?? ""} onChange={e => updateRow(i, { sets: parseInt(e.target.value) })} className="modal-input" placeholder="sets" />
            <button onClick={() => setRows(r => r.filter((_, j) => j !== i))} className="text-muted hover:text-accent text-lg leading-none">×</button>
          </div>
        ))}

        <button onClick={() => setRows(r => [...r, { name: "", weight: undefined, reps: undefined, sets: undefined }])} className="mini-btn mt-1.5">+ Add exercise</button>

        <div className="flex items-center justify-between mt-5">
          {sessId != null
            ? <button onClick={remove} className="btn-danger">Delete session</button>
            : <div />}
          <div className="flex gap-2.5">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
