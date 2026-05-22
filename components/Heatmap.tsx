"use client"

import { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { dayKey, fmtDate } from "@/lib/game-logic"

export default function Heatmap() {
  const sessions = useTrainStore(s => s.data.sessions)

  const now = new Date()
  const [offset, setOffset] = useState(0) // 0 = current month, -1 = last month, etc.

  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const year = target.getFullYear()
  const month = target.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = target.toLocaleDateString(undefined, { month: "long", year: "numeric" })

  const counts: Record<string, number> = {}
  for (const s of sessions) {
    const k = dayKey(s.ts); counts[k] = (counts[k] || 0) + 1
  }

  // Mon=0 … Sun=6 offset
  const firstDow = new Date(year, month, 1).getDay()
  const startOffset = firstDow === 0 ? 6 : firstDow - 1

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const k = dayKey(d)
    const c = counts[k] || 0
    const lvl = c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c === 3 ? 3 : 4
    return { key: k, ts: d.getTime(), day: i + 1, c, lvl }
  })

  const lvlColors = ["#1c1f26", "#1e4148", "#2b7a89", "#4cc9f0", "#ff4d3d"]
  const todayKey = dayKey(now)
  const totalCells = startOffset + daysInMonth
  // Pad to complete last row
  const trailingPad = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)

  return (
    <div className="section mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-h mb-0">Monthly heatmap</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset(o => o - 1)}
            className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-tx hover:bg-panel2 transition text-sm"
          >
            ‹
          </button>
          <span className="text-[11px] text-muted min-w-[96px] text-center">{monthName}</span>
          <button
            onClick={() => setOffset(o => Math.min(0, o + 1))}
            className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-tx hover:bg-panel2 transition text-sm disabled:opacity-30"
            disabled={offset >= 0}
          >
            ›
          </button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="text-center text-[9px] text-muted">{d}</div>
        ))}
      </div>

      {/* Calendar grid — fills full width */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square rounded-[3px]" style={{ background: "transparent" }} />
        ))}
        {cells.map(cell => (
          <div
            key={cell.key}
            title={`${fmtDate(cell.ts)}: ${cell.c} session${cell.c !== 1 ? "s" : ""}`}
            className="aspect-square rounded-[3px] cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
            style={{
              background: lvlColors[cell.lvl],
              outline: cell.key === todayKey ? "1.5px solid rgba(255,255,255,0.35)" : undefined,
              outlineOffset: "-1px",
            }}
          >
            <span className="text-[9px] leading-none select-none" style={{ color: cell.c > 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)" }}>
              {cell.day}
            </span>
          </div>
        ))}
        {Array.from({ length: trailingPad }).map((_, i) => (
          <div key={`trail-${i}`} className="aspect-square rounded-[3px]" style={{ background: "transparent" }} />
        ))}
      </div>

      <div className="flex gap-1.5 items-center mt-2.5 text-[11px] text-muted justify-end">
        <span>less</span>
        {lvlColors.map((c, i) => (
          <span key={i} className="w-3 h-3 rounded-[2px] inline-block" style={{ background: c }} />
        ))}
        <span>more</span>
      </div>
    </div>
  )
}
