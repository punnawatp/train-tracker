"use client"

import { useRef, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { estimateETA, fmtDateLong } from "@/lib/game-logic"

function drawSpark(history: { ts: number; value: number }[], goalVal: number | null): string {
  if (!history || history.length === 0) return `<text x="150" y="34" fill="#8a90a0" font-size="12" text-anchor="middle">No data yet</text>`
  const values = history.map(h => h.value)
  const W = 300, H = 60, pad = 6
  const allVals = [...values]
  if (goalVal != null) allVals.push(goalVal)
  const minV = Math.min(...allVals)
  const maxV = Math.max(...allVals)
  const range = Math.max(0.5, maxV - minV)
  const pts = values.map((v, i) => {
    const x = pad + (values.length === 1 ? W / 2 - pad : (i / (values.length - 1)) * (W - pad * 2))
    const y = H - pad - ((v - minV) / range) * (H - pad * 2)
    return [x, y]
  })
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ")
  let html = ""
  if (goalVal != null) {
    const gy = H - pad - ((goalVal - minV) / range) * (H - pad * 2)
    html += `<line x1="${pad}" y1="${gy}" x2="${W - pad}" y2="${gy}" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>`
    html += `<text x="${W - pad - 2}" y="${gy - 3}" fill="#fbbf24" font-size="9" text-anchor="end">goal ${goalVal}kg</text>`
  }
  html += `<path d="${path}" fill="none" stroke="#4cc9f0" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
  for (const p of pts) html += `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#4cc9f0"/>`
  const lastP = pts[pts.length - 1]
  html += `<text x="${lastP[0]}" y="${lastP[1] - 6}" fill="#e8eaf0" font-size="10" text-anchor="middle" font-weight="700">${values[values.length - 1]}</text>`
  return html
}

export default function Bodyweight() {
  const data = useTrainStore(s => s.data)
  const logBodyweight = useTrainStore(s => s.logBodyweight)
  const updateBwGoal = useTrainStore(s => s.updateBwGoal)

  const hist = data.bodyweight.history
  const last = hist.length ? hist[hist.length - 1].value : null
  const [curInput, setCurInput] = useState(last != null ? String(last) : "")
  const [goalInput, setGoalInput] = useState(data.bodyweight.goal != null ? String(data.bodyweight.goal) : "")

  function handleCurrentBlur() {
    const v = parseFloat(curInput)
    if (!v || v <= 0) return
    logBodyweight(v)
  }

  function handleGoalBlur() {
    const v = parseFloat(goalInput)
    updateBwGoal(v > 0 ? v : null)
  }

  const etaInfo = (() => {
    if (last == null || data.bodyweight.goal == null) return null
    if (Math.abs(last - data.bodyweight.goal) < 0.1) return { type: "done" as const }
    const res = estimateETA(hist.map(h => ({ ts: h.ts, weight: h.value })), last, data.bodyweight.goal)
    return { type: res.status as string, msg: res.msg }
  })()

  const svgHtml = drawSpark(hist, data.bodyweight.goal)

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Bodyweight
        <span className="ml-auto">
          <button onClick={() => { const v = parseFloat(curInput); if (!v || v <= 0) { alert("Enter your current weight first."); return } logBodyweight(v) }} className="mini-btn solid">+ Log today</button>
        </span>
      </h3>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center max-sm:grid-cols-1">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider">Current</div>
          <input
            type="number" step="0.1" value={curInput}
            onChange={e => setCurInput(e.target.value)}
            onBlur={handleCurrentBlur}
            className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
            placeholder="—"
          />
          <div className="text-xs text-muted mt-1">kg</div>
        </div>
        <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-15" dangerouslySetInnerHTML={{ __html: svgHtml }} />
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider">Goal</div>
          <input
            type="number" step="0.1" value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onBlur={handleGoalBlur}
            className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
            placeholder="—"
          />
          {etaInfo && (
            <div className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
              etaInfo.type === "done" ? "bg-good/10 text-good" :
              etaInfo.type === "ok"   ? "bg-good/10 text-good" :
              etaInfo.type === "need_more" ? "bg-gold/10 text-gold" :
              "bg-accent/10 text-accent"
            }`}>
              {etaInfo.type === "done" ? "🎯 Goal hit" : etaInfo.msg}
            </div>
          )}
          {!etaInfo && <div className="mt-1 text-xs text-muted">Set goal to see ETA</div>}
        </div>
      </div>
    </div>
  )
}
