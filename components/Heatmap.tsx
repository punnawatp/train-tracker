"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { dayKey, fmtDate, startOfWeek } from "@/lib/game-logic"

export default function Heatmap() {
  const sessions = useTrainStore(s => s.data.sessions)
  const counts: Record<string, number> = {}
  for (const s of sessions) {
    const k = dayKey(s.ts); counts[k] = (counts[k] || 0) + 1
  }

  const end = new Date(); end.setHours(0, 0, 0, 0)
  const start = startOfWeek(new Date(end.getTime() - 52 * 7 * 86400000))
  const dayMs = 86400000
  const totalDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1

  const cells = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(start.getTime() + i * dayMs)
    const k = dayKey(d)
    const c = counts[k] || 0
    const lvl = c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c === 3 ? 3 : 4
    return { key: k, ts: d.getTime(), c, lvl }
  })

  const lvlColors = ["#1c1f26", "#1e4148", "#2b7a89", "#4cc9f0", "#ff4d3d"]

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Year heatmap <span className="text-[11px] text-muted font-normal">last 52 weeks</span>
      </h3>
      <div className="overflow-x-auto pb-1.5">
        <div
          className="inline-grid gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 12px)", gridAutoFlow: "column", gridAutoColumns: "12px" }}
        >
          {cells.map((cell) => (
            <div
              key={cell.key}
              title={`${fmtDate(cell.ts)}: ${cell.c} session${cell.c !== 1 ? "s" : ""}`}
              className="w-3 h-3 rounded-[2px] cursor-pointer transition-transform hover:scale-125"
              style={{ background: lvlColors[cell.lvl] }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-1.5 items-center mt-2 text-[11px] text-muted justify-end">
        <span>less</span>
        {lvlColors.map((c, i) => <span key={i} className="w-3 h-3 rounded-[2px]" style={{ background: c }} />)}
        <span>more</span>
      </div>
    </div>
  )
}
