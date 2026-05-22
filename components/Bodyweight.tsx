"use client"

import { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { estimateETA } from "@/lib/game-logic"

function drawSpark(history: { ts: number; value: number }[], goalVal: number | null, suffix = ""): string {
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
    html += `<text x="${W - pad - 2}" y="${gy - 3}" fill="#fbbf24" font-size="9" text-anchor="end">goal ${goalVal}${suffix}</text>`
  }
  html += `<path d="${path}" fill="none" stroke="#4cc9f0" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`
  for (const p of pts) html += `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="#4cc9f0"/>`
  const lastP = pts[pts.length - 1]
  html += `<text x="${lastP[0]}" y="${lastP[1] - 6}" fill="#e8eaf0" font-size="10" text-anchor="middle" font-weight="700">${values[values.length - 1]}${suffix}</text>`
  return html
}

export default function Bodyweight() {
  const data = useTrainStore(s => s.data)
  const logBodyweight = useTrainStore(s => s.logBodyweight)
  const updateBwGoal = useTrainStore(s => s.updateBwGoal)
  const logBodyfat = useTrainStore(s => s.logBodyfat)
  const updateBfGoal = useTrainStore(s => s.updateBfGoal)

  const hist = data.bodyweight.history
  const lastBw = hist.length ? hist[hist.length - 1].value : null
  const [bwInput, setBwInput] = useState(lastBw != null ? String(lastBw) : "")
  const [bwGoalInput, setBwGoalInput] = useState(data.bodyweight.goal != null ? String(data.bodyweight.goal) : "")

  const bfHist = data.bodyweight.bodyfat.history
  const lastBf = bfHist.length ? bfHist[bfHist.length - 1].value : null
  const [bfInput, setBfInput] = useState(lastBf != null ? String(lastBf) : "")
  const [bfGoalInput, setBfGoalInput] = useState(data.bodyweight.bodyfat.goal != null ? String(data.bodyweight.bodyfat.goal) : "")

  function handleBwBlur() {
    const v = parseFloat(bwInput)
    if (!v || v <= 0) return
    logBodyweight(v)
  }

  function handleBwGoalBlur() {
    const v = parseFloat(bwGoalInput)
    updateBwGoal(v > 0 ? v : null)
  }

  function handleBfBlur() {
    const v = parseFloat(bfInput)
    if (!v || v <= 0 || v >= 100) return
    logBodyfat(v)
  }

  function handleBfGoalBlur() {
    const v = parseFloat(bfGoalInput)
    updateBfGoal(v > 0 && v < 100 ? v : null)
  }

  const bwEta = (() => {
    if (lastBw == null || data.bodyweight.goal == null) return null
    if (Math.abs(lastBw - data.bodyweight.goal) < 0.1) return { type: "done" as const }
    const res = estimateETA(hist.map(h => ({ ts: h.ts, weight: h.value })), lastBw, data.bodyweight.goal)
    return { type: res.status as string, msg: res.msg }
  })()

  const bfEta = (() => {
    if (lastBf == null || data.bodyweight.bodyfat.goal == null) return null
    if (Math.abs(lastBf - data.bodyweight.bodyfat.goal) < 0.1) return { type: "done" as const }
    const res = estimateETA(bfHist.map(h => ({ ts: h.ts, weight: h.value })), lastBf, data.bodyweight.bodyfat.goal)
    return { type: res.status as string, msg: res.msg }
  })()

  const leanMass = (lastBw != null && lastBf != null)
    ? Math.round(lastBw * (1 - lastBf / 100) * 10) / 10
    : null

  return (
    <div className="section mt-5">
      <h3 className="section-h">Body Metrics</h3>

      {/* Weight */}
      <div className="mb-1">
        <div className="text-[11px] text-muted font-bold uppercase tracking-[2px] mb-2">Weight</div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center max-sm:grid-cols-1">
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider">Current</div>
            <input
              type="number" step="0.1" value={bwInput}
              onChange={e => setBwInput(e.target.value)}
              onBlur={handleBwBlur}
              className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
              placeholder="—"
            />
            <div className="text-xs text-muted mt-1">kg</div>
            <button
              onClick={() => { const v = parseFloat(bwInput); if (!v || v <= 0) return; logBodyweight(v) }}
              className="mini-btn solid mt-2"
            >+ Log today</button>
          </div>
          <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-15" dangerouslySetInnerHTML={{ __html: drawSpark(hist, data.bodyweight.goal, "kg") }} />
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider">Goal</div>
            <input
              type="number" step="0.1" value={bwGoalInput}
              onChange={e => setBwGoalInput(e.target.value)}
              onBlur={handleBwGoalBlur}
              className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
              placeholder="—"
            />
            {bwEta && (
              <div className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                bwEta.type === "done" ? "bg-good/10 text-good" :
                bwEta.type === "ok"   ? "bg-good/10 text-good" :
                bwEta.type === "need_more" ? "bg-gold/10 text-gold" :
                "bg-accent/10 text-accent"
              }`}>
                {bwEta.type === "done" ? "🎯 Goal hit" : bwEta.msg}
              </div>
            )}
            {!bwEta && <div className="mt-1 text-xs text-muted">Set goal to see ETA</div>}
          </div>
        </div>
      </div>

      <div className="border-t border-line my-4" />

      {/* Body Fat */}
      <div>
        <div className="text-[11px] text-muted font-bold uppercase tracking-[2px] mb-2">Body Fat</div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center max-sm:grid-cols-1">
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider">Current</div>
            <input
              type="number" step="0.1" min="1" max="60" value={bfInput}
              onChange={e => setBfInput(e.target.value)}
              onBlur={handleBfBlur}
              className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
              placeholder="—"
            />
            <div className="text-xs text-muted mt-1">%</div>
            <button
              onClick={() => { const v = parseFloat(bfInput); if (!v || v <= 0 || v >= 100) return; logBodyfat(v) }}
              className="mini-btn solid mt-2"
            >+ Log today</button>
          </div>
          <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="w-full h-15" dangerouslySetInnerHTML={{ __html: drawSpark(bfHist, data.bodyweight.bodyfat.goal, "%") }} />
          <div>
            <div className="text-[11px] text-muted uppercase tracking-wider">Goal</div>
            <input
              type="number" step="0.1" min="1" max="60" value={bfGoalInput}
              onChange={e => setBfGoalInput(e.target.value)}
              onBlur={handleBfGoalBlur}
              className="mt-1 w-28 bg-panel2 border border-line rounded px-2 py-1.5 text-[22px] font-bold text-tx focus:outline-none focus:border-accent"
              placeholder="—"
            />
            {bfEta && (
              <div className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                bfEta.type === "done" ? "bg-good/10 text-good" :
                bfEta.type === "ok"   ? "bg-good/10 text-good" :
                bfEta.type === "need_more" ? "bg-gold/10 text-gold" :
                "bg-accent/10 text-accent"
              }`}>
                {bfEta.type === "done" ? "🎯 Goal hit" : bfEta.msg}
              </div>
            )}
            {!bfEta && <div className="mt-1 text-xs text-muted">Set goal to see ETA</div>}
          </div>
        </div>

        {leanMass !== null && (
          <div className="mt-3 text-xs text-muted">
            Lean mass: <strong className="text-tx">{leanMass} kg</strong>
            <span className="ml-2 opacity-60">· Fat mass: {Math.round((lastBw! - leanMass) * 10) / 10} kg</span>
          </div>
        )}
      </div>
    </div>
  )
}
