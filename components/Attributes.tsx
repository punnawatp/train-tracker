"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { STAT_DEFS } from "@/lib/constants"

export default function Attributes() {
  const stats = useTrainStore(s => s.data.stats)
  const R = 110
  const n = STAT_DEFS.length
  const angles = Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / n)

  let svgHtml = ""

  // Grid rings
  for (const r of [0.25, 0.5, 0.75, 1.0]) {
    const pts = angles.map(a => `${(Math.cos(a) * R * r).toFixed(1)},${(Math.sin(a) * R * r).toFixed(1)}`).join(" ")
    svgHtml += `<polygon points="${pts}" fill="none" stroke="#262a33" stroke-width="1" />`
  }
  // Axis lines
  for (let i = 0; i < n; i++) {
    svgHtml += `<line x1="0" y1="0" x2="${(Math.cos(angles[i]) * R).toFixed(1)}" y2="${(Math.sin(angles[i]) * R).toFixed(1)}" stroke="#262a33" stroke-width="1"/>`
  }

  // Data polygon
  const dataPts = angles.map((a, i) => {
    const key = STAT_DEFS[i].key as keyof typeof stats
    const v = (stats[key] || 0) / 100
    return `${(Math.cos(a) * R * v).toFixed(1)},${(Math.sin(a) * R * v).toFixed(1)}`
  }).join(" ")
  svgHtml += `<polygon points="${dataPts}" fill="rgba(255,77,61,0.25)" stroke="#ff4d3d" stroke-width="2"/>`

  // Data points + labels
  for (let i = 0; i < n; i++) {
    const key = STAT_DEFS[i].key as keyof typeof stats
    const v = (stats[key] || 0) / 100
    svgHtml += `<circle cx="${(Math.cos(angles[i]) * R * v).toFixed(1)}" cy="${(Math.sin(angles[i]) * R * v).toFixed(1)}" r="3" fill="#ff4d3d"/>`
    const lx = Math.cos(angles[i]) * (R + 22)
    const ly = Math.sin(angles[i]) * (R + 22)
    svgHtml += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${STAT_DEFS[i].color}" font-size="12" font-weight="700" text-anchor="middle" alignment-baseline="middle">${STAT_DEFS[i].name}</text>`
  }

  return (
    <div className="section mt-5">
      <h3 className="section-h">Attributes</h3>
      <div className="grid grid-cols-2 gap-5 items-center max-sm:grid-cols-1">
        <svg viewBox="-150 -150 300 300" className="w-full max-w-[280px] aspect-square mx-auto block" dangerouslySetInnerHTML={{ __html: svgHtml }} />
        <div className="flex flex-col gap-2.5">
          {STAT_DEFS.map(s => {
            const v = Math.round(stats[s.key as keyof typeof stats] || 0)
            return (
              <div key={s.key} className="grid grid-cols-[80px_1fr_40px] gap-2.5 items-center">
                <div className="text-xs font-bold tracking-wider" style={{ color: s.color }}>{s.label}</div>
                <div className="h-2 bg-[#0a0b0e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: s.color }} />
                </div>
                <div className="text-sm font-bold text-right">{v}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
