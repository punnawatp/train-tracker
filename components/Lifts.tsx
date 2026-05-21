"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { est1RM, estimateETA } from "@/lib/game-logic"

interface Props {
  onOpenAddLift: () => void
  onOpenLift: (id: string) => void
}

export default function Lifts({ onOpenAddLift, onOpenLift }: Props) {
  const data = useTrainStore(s => s.data)

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Strength Goals
        <span className="ml-auto">
          <button onClick={onOpenAddLift} className="mini-btn">+ Add lift</button>
        </span>
      </h3>

      {data.lifts.length === 0 ? (
        <div className="text-muted text-sm text-center py-5">No lifts tracked. Tap &quot;+ Add lift&quot; to start.</div>
      ) : (
        data.categories.map(cat => {
          const ls = data.lifts.filter(l => l.cat === cat.id)
          if (ls.length === 0) return null
          return (
            <div key={cat.id}>
              <div className="text-[11px] text-muted font-bold uppercase tracking-[2px] mt-4 mb-2 first:mt-0">{cat.name}</div>
              <div className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
                {ls.map(l => {
                  const pct = l.goal > 0 ? Math.min(100, (l.current / l.goal) * 100) : 0
                  const done = l.goal > 0 && l.current >= l.goal
                  let best1RM = 0
                  for (const h of (l.history || [])) { const e = est1RM(h.weight, h.reps); if (e > best1RM) best1RM = e }
                  const eligibleHist = (l.history || []).filter(h => h.reps >= (l.targetReps || 8)).map(h => ({ ts: h.ts, weight: h.weight }))
                  const eta = (!done && l.goal > 0 && l.current < l.goal) ? estimateETA(eligibleHist, l.current, l.goal) : null

                  return (
                    <div
                      key={l.id}
                      className="bg-panel2 border rounded-xl p-3.5"
                      style={{ borderColor: done ? "rgba(74,222,128,0.4)" : "#262a33" }}
                    >
                      <div className="text-sm font-bold">
                        {l.name}{done ? " ✓" : ""}
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ml-1.5" style={{ background: "rgba(76,201,240,0.15)", color: "#4cc9f0" }}>@{l.targetReps || 8}</span>
                        {l.note && <span className="text-muted text-[11px] ml-1">· {l.note}</span>}
                      </div>
                      <div className="text-sm text-muted mt-0.5">
                        <span className="text-tx font-semibold">{l.current} kg</span> → <span className="text-gold font-semibold">{l.goal || "—"} kg</span>
                      </div>
                      {best1RM > 0 && <div className="text-[11px] text-muted mt-0.5">Est 1RM: <strong className="text-tx">{best1RM.toFixed(1)} kg</strong></div>}
                      <div className="mt-2 h-1.5 bg-[#0a0b0e] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4cc9f0, #4ade80)" }} />
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                        {done ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-good/10 text-good">🎯 Goal hit</span>
                        ) : eta?.status === "ok" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-good/10 text-good">{eta.msg}</span>
                        ) : eta?.status === "need_more" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gold/10 text-gold">{eta.msg}</span>
                        ) : eta ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-accent/10 text-accent">{eta.msg}</span>
                        ) : <span />}
                        <button onClick={() => onOpenLift(l.id)} className="text-tx border border-line rounded px-2.5 py-1 text-xs hover:border-accent hover:text-accent transition">Update</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
