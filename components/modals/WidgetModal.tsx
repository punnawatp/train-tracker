"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { STAT_DEFS } from "@/lib/constants"
import type { WidgetType, Widget } from "@/lib/types"

const STAT_METRIC_LABELS: { key: string; label: string }[] = [
  { key: "level",                  label: "Level" },
  { key: "totalXp",                label: "Total XP" },
  { key: "beltName",               label: "Current Belt" },
  { key: "totalSessions",          label: "Total sessions" },
  { key: "sessionsWeek",           label: "Sessions this week" },
  { key: "sessionsMonth",          label: "Sessions this month" },
  { key: "dayStreak",              label: "Current day streak" },
  { key: "weekGoalStreak",         label: "Weekly goal hits" },
  { key: "totalPrs",               label: "PRs hit (all-time)" },
  { key: "prsWeek",                label: "PRs this week" },
  { key: "volumeWeek",             label: "Volume this week" },
  { key: "volumeTotal",            label: "Volume (all-time)" },
  { key: "achievementsUnlocked",   label: "Achievements" },
  { key: "questsCompleted",        label: "Daily quests completed" },
  { key: "weeklyQuestsCompleted",  label: "Weekly quests completed" },
  { key: "comboMultiplier",        label: "Combo multiplier" },
  { key: "bodyweightCurrent",      label: "Bodyweight (current)" },
  { key: "bodyweightGoal",         label: "Bodyweight goal" },
  { key: "bodyweight30dChange",    label: "Bodyweight 30d change" },
  { key: "averagePerWeek",         label: "Avg sessions / week" },
]

interface Props {
  open: boolean
  editId?: string
  onClose: () => void
}

export default function WidgetModal({ open, editId, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const addWidget = useTrainStore(s => s.addWidget)
  const updateWidget = useTrainStore(s => s.updateWidget)

  const [type, setType] = useState<WidgetType | null>(null)
  const [statMetric, setStatMetric] = useState(STAT_METRIC_LABELS[0].key)
  const [statTitle, setStatTitle] = useState("")
  const [liftId, setLiftId] = useState(data.lifts[0]?.id || "")
  const [attrKey, setAttrKey] = useState("str")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteText, setNoteText] = useState("")

  useEffect(() => {
    if (!open) return
    if (editId) {
      const w = data.widgets.find(x => x.id === editId)
      if (w) {
        setType(w.type)
        if (w.type === "stat") { setStatMetric(w.config.metric || statMetric); setStatTitle(w.config.title || "") }
        if (w.type === "lift") setLiftId(w.config.liftId || "")
        if (w.type === "attribute") setAttrKey(w.config.statKey || "str")
        if (w.type === "note") { setNoteTitle(w.config.title || ""); setNoteText(w.config.text || "") }
        return
      }
    }
    setType(null); setStatTitle(""); setNoteTitle(""); setNoteText("")
  }, [open, editId])

  function save() {
    if (!type) { alert("Pick a widget type"); return }
    let config: Widget["config"] = {}
    if (type === "stat")      config = { metric: statMetric, title: statTitle.trim() }
    if (type === "lift")      config = { liftId }
    if (type === "attribute") config = { statKey: attrKey }
    if (type === "note")      config = { title: noteTitle.trim() || "Note", text: noteText }

    if (editId) {
      updateWidget(editId, { type, config })
    } else {
      addWidget({ type, config })
    }
    onClose()
  }

  if (!open) return null

  const TYPES: { key: WidgetType; icon: string; label: string; desc: string }[] = [
    { key: "stat", icon: "📊", label: "Stat", desc: "A number from your data" },
    { key: "lift", icon: "🏋️", label: "Lift", desc: "A specific lift's progress" },
    { key: "attribute", icon: "⚔️", label: "Attribute", desc: "STR / CON / TEC / DIS" },
    { key: "note", icon: "📝", label: "Note", desc: "A reminder or goal" },
  ]

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2 className="text-lg font-bold mb-1">{editId ? "Edit Widget" : "Add Widget"}</h2>
        <p className="text-muted text-sm mb-4">Pick a widget type, then configure what it shows.</p>

        <div className="grid grid-cols-2 gap-2.5">
          {TYPES.map(t => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`border-2 rounded-xl p-3.5 text-center transition cursor-pointer ${type === t.key ? "border-accent bg-accent/10" : "border-line hover:border-accent"}`}
            >
              <div className="text-2xl">{t.icon}</div>
              <div className="text-sm font-bold mt-1.5">{t.label}</div>
              <div className="text-[11px] text-muted mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {type && (
          <div className="mt-4">
            {type === "stat" && (
              <>
                <label className="field-label">Metric</label>
                <select value={statMetric} onChange={e => setStatMetric(e.target.value)} className="modal-input">
                  {STAT_METRIC_LABELS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                <label className="field-label">Title (optional)</label>
                <input type="text" value={statTitle} onChange={e => setStatTitle(e.target.value)} className="modal-input" placeholder="Leave blank for auto title" />
              </>
            )}
            {type === "lift" && (
              <>
                <label className="field-label">Which lift</label>
                <select value={liftId} onChange={e => setLiftId(e.target.value)} className="modal-input">
                  {data.lifts.map(l => <option key={l.id} value={l.id}>{l.name} (@{l.targetReps})</option>)}
                </select>
              </>
            )}
            {type === "attribute" && (
              <>
                <label className="field-label">Which attribute</label>
                <select value={attrKey} onChange={e => setAttrKey(e.target.value)} className="modal-input">
                  {STAT_DEFS.map(d => <option key={d.key} value={d.key}>{d.name} · {d.label}</option>)}
                </select>
              </>
            )}
            {type === "note" && (
              <>
                <label className="field-label">Title</label>
                <input type="text" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} className="modal-input" placeholder="e.g. Goal for this month" />
                <label className="field-label">Note</label>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="modal-input resize-y min-h-20" placeholder="Anything you want to remind yourself…" />
              </>
            )}
          </div>
        )}

        <div className="flex gap-2.5 mt-5 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} className="btn-primary">Add Widget</button>
        </div>
      </div>
    </div>
  )
}
