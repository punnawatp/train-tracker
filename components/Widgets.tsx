"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { STAT_DEFS } from "@/lib/constants"
import { computeStatMetric, est1RM } from "@/lib/game-logic"
import type { Widget } from "@/lib/types"

interface Props {
  onOpenWidgetModal: (editId?: string) => void
}

export default function Widgets({ onOpenWidgetModal }: Props) {
  const data = useTrainStore(s => s.data)
  const deleteWidget = useTrainStore(s => s.deleteWidget)
  const moveWidget = useTrainStore(s => s.moveWidget)

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        My Dashboard
        <span className="ml-auto">
          <button onClick={() => onOpenWidgetModal()} className="mini-btn solid">+ Add widget</button>
        </span>
      </h3>
      {data.widgets.length === 0 ? (
        <div className="py-6 text-center text-muted text-sm border border-dashed border-line rounded-xl">
          No widgets yet. Tap &quot;+ Add widget&quot; to pin stats, lifts, or notes.
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {data.widgets.map((w, idx) => (
            <WidgetCard
              key={w.id} widget={w} idx={idx} total={data.widgets.length}
              onEdit={() => onOpenWidgetModal(w.id)}
              onDelete={() => deleteWidget(w.id)}
              onMove={(dir) => moveWidget(w.id, dir)}
              data={data}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WidgetCard({ widget: w, idx, total, onEdit, onDelete, onMove, data }: {
  widget: Widget; idx: number; total: number
  onEdit: () => void; onDelete: () => void; onMove: (dir: number) => void
  data: ReturnType<typeof useTrainStore.getState>["data"]
}) {
  const controls = (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {idx > 0 && <button onClick={() => onMove(-1)} className="wbtn" title="Move up">↑</button>}
      {idx < total - 1 && <button onClick={() => onMove(1)} className="wbtn" title="Move down">↓</button>}
      <button onClick={onEdit} className="wbtn">✎</button>
      <button onClick={onDelete} className="wbtn">×</button>
    </div>
  )

  if (w.type === "stat") {
    const r = computeStatMetric(w.config.metric || "", data)
    const title = w.config.title || w.config.metric || ""
    const small = String(r.v).length > 8
    return (
      <div className="widget group relative">
        {controls}
        <div className="wtitle">{title}</div>
        <div className={`wvalue ${small ? "!text-lg" : ""}`}>{r.v}</div>
        {r.sub && <div className="wsub">{r.sub}</div>}
      </div>
    )
  }

  if (w.type === "lift") {
    const l = data.lifts.find(x => x.id === w.config.liftId)
    if (!l) return <div className="widget group relative">{controls}<div className="wtitle text-muted">Deleted lift</div></div>
    const pct = l.goal > 0 ? Math.min(100, (l.current / l.goal) * 100) : 0
    let best1RM = 0
    for (const h of (l.history || [])) { const e = est1RM(h.weight, h.reps); if (e > best1RM) best1RM = e }
    return (
      <div className="widget group relative">
        {controls}
        <div className="wtitle">{l.name} @{l.targetReps}</div>
        <div className="wvalue !text-lg">{l.current} → {l.goal || "—"} kg</div>
        <div className="mt-2 h-1.5 bg-[#0a0b0e] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4cc9f0, #4ade80)" }} />
        </div>
        {best1RM > 0 && <div className="wsub">Est 1RM {best1RM.toFixed(1)} kg</div>}
      </div>
    )
  }

  if (w.type === "attribute") {
    const def = STAT_DEFS.find(d => d.key === w.config.statKey)
    if (!def) return <div className="widget group relative">{controls}<div className="wtitle text-muted">Unknown attribute</div></div>
    const v = Math.round((data.stats[def.key as keyof typeof data.stats] || 0))
    return (
      <div className="widget group relative">
        {controls}
        <div className="wtitle" style={{ color: def.color }}>{def.name} · {def.label}</div>
        <div className="wvalue">{v}<span className="text-sm text-muted font-semibold"> / 100</span></div>
        <div className="mt-2 h-2 bg-[#0a0b0e] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: def.color }} />
        </div>
      </div>
    )
  }

  if (w.type === "note") {
    return (
      <div className="widget group relative" style={{ background: "linear-gradient(135deg, #2a2310, #1a1a14)", borderColor: "rgba(251,191,36,0.3)" }}>
        {controls}
        <div className="wtitle text-gold">{w.config.title || "Note"}</div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-1">{w.config.text || ""}</div>
      </div>
    )
  }

  return null
}
