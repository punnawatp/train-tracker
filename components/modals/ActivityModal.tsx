"use client"

import { useState, useEffect } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { STAT_DEFS } from "@/lib/constants"
import type { Stats } from "@/lib/types"

interface Props {
  open: boolean
  activityId?: string
  onClose: () => void
}

const PRESET_COLORS = [
  "#4cc9f0", "#b388ff", "#ff7043", "#4ade80",
  "#fbbf24", "#f472b6", "#60a5fa", "#a3e635",
  "#94a3b8", "#fb923c", "#34d399", "#e879f9",
]

const emptyForm = () => ({
  name: "",
  color: PRESET_COLORS[0],
  coinReward: 50,
  hasExercises: false,
  statGains: {} as Partial<Record<keyof Stats, number>>,
})

export default function ActivityModal({ open, activityId, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const addActivityType = useTrainStore(s => s.addActivityType)
  const updateActivityType = useTrainStore(s => s.updateActivityType)
  const deleteActivityType = useTrainStore(s => s.deleteActivityType)

  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    if (!open) return
    if (activityId) {
      const act = data.activityTypes.find(a => a.id === activityId)
      if (act) {
        setForm({ name: act.name, color: act.color, coinReward: act.coinReward, hasExercises: act.hasExercises ?? false, statGains: { ...act.statGains } })
        return
      }
    }
    setForm(emptyForm())
  }, [open, activityId])

  function save() {
    if (!form.name.trim()) return
    if (activityId) {
      updateActivityType(activityId, form)
    } else {
      addActivityType(form)
    }
    onClose()
  }

  function remove() {
    if (!activityId) return
    const count = data.sessions.filter(s => s.type === activityId).length
    if (!confirm(`Delete "${form.name}"?${count > 0 ? ` ${count} logged session(s) will keep their history.` : ""}`)) return
    deleteActivityType(activityId)
    onClose()
  }

  const totalGainsPerHour = Object.values(form.statGains).reduce((a, b) => a + (b || 0), 0)

  if (!open) return null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="text-lg font-bold mb-1">{activityId ? "Edit Activity" : "New Activity"}</h2>
        <p className="text-muted text-sm mb-4">Configure how this activity rewards you.</p>

        <label className="field-label">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="modal-input mb-4"
          placeholder="e.g. Yoga, Swimming, Running"
          autoFocus
        />

        <label className="field-label">Color</label>
        <div className="flex gap-2 flex-wrap mb-4">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setForm(f => ({ ...f, color: c }))}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                outline: form.color === c ? "2px solid white" : "2px solid transparent",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="field-label">Coin reward per session</label>
            <input
              type="number" min="0" max="999"
              value={form.coinReward}
              onChange={e => setForm(f => ({ ...f, coinReward: parseInt(e.target.value) || 0 }))}
              className="modal-input"
            />
          </div>
          <div className="flex flex-col justify-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.hasExercises ?? false}
                onChange={e => setForm(f => ({ ...f, hasExercises: e.target.checked }))}
                className="cursor-pointer"
              />
              Track exercises &amp; weight
            </label>
          </div>
        </div>

        <label className="field-label">
          Attribute gains per hour
          <span className="ml-2 text-[10px] font-normal text-muted">
            total: {totalGainsPerHour.toFixed(1)} pts/hr · tip: use 2 total for balance
          </span>
        </label>
        <div className="flex flex-col gap-2 mb-5">
          {STAT_DEFS.map(s => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-24 text-xs font-bold tracking-wider" style={{ color: s.color }}>{s.label}</div>
              <input
                type="number" min="0" step="0.5" max="10"
                value={form.statGains[s.key as keyof Stats] ?? 0}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0
                  setForm(f => {
                    const gains = { ...f.statGains }
                    if (val > 0) gains[s.key as keyof Stats] = val
                    else delete gains[s.key as keyof Stats]
                    return { ...f, statGains: gains }
                  })
                }}
                className="w-20 modal-input"
              />
              <span className="text-xs text-muted">per hour</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {activityId
            ? <button onClick={remove} className="btn-danger">Delete</button>
            : <div />}
          <div className="flex gap-2.5">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={save} disabled={!form.name.trim()} className="btn-primary">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
