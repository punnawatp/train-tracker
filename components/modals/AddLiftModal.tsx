"use client"

import { useState, useMemo } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { EXERCISE_CATALOG, EXERCISE_MUSCLES, MUSCLE_GROUPS, type ExerciseCatalogEntry } from "@/lib/constants"

interface Props {
  open: boolean
  onClose: () => void
}

const EQUIPMENT_ORDER = ["Barbell", "Bodyweight", "Dumbbell", "Machine", "Cable"] as const

function MuscleChips({ name, primaryOnly = false }: { name: string; primaryOnly?: boolean }) {
  const key = name.toLowerCase().replace(/[^a-z]/g, "")
  const muscles = EXERCISE_MUSCLES[key]
  if (!muscles) return null
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {muscles.primary.map(m => {
        const mg = MUSCLE_GROUPS[m]
        return mg ? (
          <span key={m} className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: mg.color + "22", color: mg.color }}>{mg.name}</span>
        ) : null
      })}
      {!primaryOnly && muscles.secondary.map(m => {
        const mg = MUSCLE_GROUPS[m]
        return mg ? (
          <span key={m} className="text-[9px] px-1.5 py-0.5 rounded font-semibold text-muted" style={{ background: "#ffffff08" }}>{mg.name}</span>
        ) : null
      })}
    </div>
  )
}

export default function AddLiftModal({ open, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const addLift = useTrainStore(s => s.addLift)

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ExerciseCatalogEntry | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState("")
  const [cat, setCat] = useState(data.categories[0]?.id || "lower")
  const [current, setCurrent] = useState("")
  const [goal, setGoal] = useState("")
  const [reps, setReps] = useState("8")

  function reset() {
    setSearch(""); setSelected(null); setCustomMode(false); setCustomName("")
    setCurrent(""); setGoal(""); setReps("8")
    setCat(data.categories[0]?.id || "lower")
  }

  function handleClose() { reset(); onClose() }

  function handleSelect(ex: ExerciseCatalogEntry) {
    setSelected(ex)
    const match = data.categories.find(c =>
      c.id === ex.suggestCat || c.name.toLowerCase().includes(ex.suggestCat)
    )
    setCat(match?.id || data.categories[0]?.id || "lower")
  }

  function handleSave() {
    const name = customMode ? customName.trim() : selected?.name ?? ""
    if (!name) return
    addLift({
      id: "lift_" + Date.now(),
      name,
      cat,
      current: parseFloat(current) || 0,
      goal: parseFloat(goal) || 0,
      targetReps: Math.max(1, parseInt(reps) || 8),
    })
    reset()
    onClose()
  }

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = EXERCISE_CATALOG.filter(e => e.name.toLowerCase().includes(q))
    return EQUIPMENT_ORDER.map(eq => ({
      eq,
      items: filtered.filter(e => e.equipment === eq),
    })).filter(g => g.items.length > 0)
  }, [search])

  if (!open) return null

  const showForm = selected !== null || customMode
  const liftName = customMode ? customName : selected?.name ?? ""

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="modal" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <h2 className="text-lg font-bold mb-4 shrink-0">Add Lift</h2>

        {!showForm ? (
          <>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="modal-input mb-3 shrink-0"
              autoFocus
            />

            <div className="overflow-y-auto flex-1 -mx-1 px-1">
              {grouped.map(({ eq, items }) => (
                <div key={eq} className="mb-4">
                  <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2 px-1">{eq}</div>
                  <div className="flex flex-col gap-1.5">
                    {items.map(ex => (
                      <button
                        key={ex.name}
                        onClick={() => handleSelect(ex)}
                        className="px-3 py-2.5 rounded-lg bg-panel2 border border-line hover:border-accent text-left transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold group-hover:text-accent transition">{ex.name}</span>
                        </div>
                        <MuscleChips name={ex.name} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {grouped.length === 0 && (
                <div className="text-muted text-sm text-center py-4">No matches</div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-line shrink-0">
              <button
                onClick={() => setCustomMode(true)}
                className="w-full text-sm text-muted hover:text-tx transition text-left px-1"
              >
                + Custom exercise name
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setSelected(null); setCustomMode(false) }}
              className="flex items-center gap-2 text-sm text-muted hover:text-tx mb-4 shrink-0 transition"
            >
              ← Back
            </button>

            {customMode ? (
              <>
                <label className="field-label">Exercise name</label>
                <input
                  type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                  className="modal-input" placeholder="e.g. Cable Fly" autoFocus
                />
              </>
            ) : (
              <div className="mb-4 p-3 bg-panel2 border border-line rounded-xl shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{liftName}</span>
                  <span className="text-[10px] text-muted">{selected?.equipment}</span>
                </div>
                <MuscleChips name={liftName} />
              </div>
            )}

            <label className="field-label">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)} className="modal-input">
              {data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="field-label">Current (kg)</label>
            <input type="number" step="0.5" min="0" value={current} onChange={e => setCurrent(e.target.value)} className="modal-input" placeholder="0" />

            <label className="field-label">Goal (kg)</label>
            <input type="number" step="0.5" min="0" value={goal} onChange={e => setGoal(e.target.value)} className="modal-input" placeholder="optional" />

            <label className="field-label">Target reps</label>
            <input type="number" step="1" min="1" max="30" value={reps} onChange={e => setReps(e.target.value)} className="modal-input" />

            <div className="flex gap-2.5 mt-5 justify-end shrink-0">
              <button onClick={handleClose} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={!liftName.trim()}>Add</button>
            </div>
          </>
        )}

        {!showForm && (
          <div className="flex gap-2.5 mt-3 justify-end shrink-0">
            <button onClick={handleClose} className="btn-ghost">Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
