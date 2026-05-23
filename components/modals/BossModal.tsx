"use client"

import { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { BOSSES, GACHA_GEAR } from "@/lib/constants"
import type { BossConfig } from "@/lib/constants"
import { dayStreak } from "@/lib/game-logic"

// ── Color helper ──────────────────────────────────────────────────────────────

function darken(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amt)))
    const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amt)))
    const b = Math.max(0, Math.round((n & 0xff) * (1 - amt)))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}

// ── Boss sprite (PX=7 — slightly smaller than standalone card) ────────────────

const PX = 7

function buildBossSprite(bodyColor: string): (string | null)[][] {
  const _ = null
  const K = "#0d0d1a", G = "#ffd700", g = "#b8860b"
  const S = "#ffc899"
  const E = "#1a0a00", H = "#ffffff"
  const c = "#ff9eb5", L = "#e8335a", M = "#8b0000"
  const B = bodyColor, b = darken(bodyColor, 0.28)
  return [
    [_,_,_,K,G,K,_,G,K,G,_,K,G,K,_,_,_,_],
    [_,_,K,G,G,G,G,G,G,G,G,G,G,G,K,_,_,_],
    [_,_,K,g,G,g,G,G,G,G,G,G,g,G,K,_,_,_],
    [_,_,K,S,S,S,S,S,S,S,S,S,S,S,K,_,_,_],
    [_,_,K,S,S,E,S,S,H,S,S,E,S,S,K,_,_,_],
    [_,_,K,S,S,E,E,S,S,S,E,E,S,S,K,_,_,_],
    [_,_,K,S,S,S,S,S,S,S,S,S,S,S,K,_,_,_],
    [_,_,K,S,c,S,S,S,S,S,S,S,c,S,K,_,_,_],
    [_,_,K,S,S,M,M,L,L,L,M,M,S,S,K,_,_,_],
    [_,_,K,S,S,S,H,H,H,H,S,S,S,S,K,_,_,_],
    [_,_,_,K,S,S,S,S,S,S,S,S,S,K,_,_,_,_],
    [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_,_],
    [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_],
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
    [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_],
    [_,_,B,B,b,B,B,B,B,B,B,b,B,B,_,_,_,_],
    [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_,_,_],
    [_,_,_,B,B,B,_,_,_,_,B,B,B,_,_,_,_,_],
    [_,_,_,B,B,B,_,_,_,_,B,B,B,_,_,_,_,_],
    [_,_,_,K,K,K,_,_,_,_,K,K,K,_,_,_,_,_],
  ]
}

function BossSprite({ bodyColor, anim }: { bodyColor: string; anim: "idle" | "hit" }) {
  const sprite = buildBossSprite(bodyColor)
  return (
    <div
      className={anim === "hit" ? "boss-hit" : "boss-idle"}
      style={{ imageRendering: "pixelated", display: "inline-block" }}
    >
      {sprite.map((row, y) => (
        <div key={y} style={{ display: "flex", height: PX }}>
          {row.map((px, x) => (
            <div key={x} style={{ width: PX, height: PX, background: px ?? "transparent", flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100)
  const critical = pct < 25
  const barColor = critical ? "#ff4d3d" : pct < 50 ? "#ff9f43" : color
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color }}>HP</span>
          {critical && <span className="text-[9px] text-red-400 animate-pulse">⚠ CRITICAL</span>}
        </div>
        <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
          {Math.ceil(current).toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 14, background: "#0a0b0e", border: "1px solid #1a1d24", borderRadius: 3, overflow: "hidden" }}>
        <div
          className={critical ? "hp-critical" : ""}
          style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${darken(barColor, 0.2)}, ${barColor})`,
            boxShadow: `0 0 10px ${barColor}88`,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  )
}

// ── Phase strip ───────────────────────────────────────────────────────────────

function PhaseStrip({
  selectedIdx, bossKills, currentBossIdx, onSelect,
}: {
  selectedIdx: number | null
  bossKills: Record<number, number>
  currentBossIdx: number | null
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
      {BOSSES.map((cfg, i) => {
        const kills      = bossKills[i] || 0
        const isCurrent  = i === currentBossIdx
        const isSelected = i === selectedIdx
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 flex flex-col items-center gap-1"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all"
              style={{
                background: isCurrent ? cfg.color + "22" : "#0d0e12",
                border: `2px solid ${isSelected ? cfg.color : isCurrent ? cfg.color : "#1a1d24"}`,
                boxShadow: isSelected ? `0 0 18px ${cfg.color}cc` : isCurrent ? `0 0 14px ${cfg.color}88` : "none",
                transform: isSelected ? "scale(1.18)" : "scale(1)",
              }}
            >
              {isCurrent
                ? <span className="text-xs font-extrabold" style={{ color: cfg.color }}>⚔</span>
                : <span className="text-xs font-bold" style={{ color: kills > 0 ? "#ffd700" : "#8a90a0" }}>{i + 1}</span>
              }
            </div>
            <div className="text-[7px] font-bold text-center" style={{ color: isCurrent ? cfg.color : kills > 0 ? "#ffd700" : "#8a90a0", maxWidth: 40, lineHeight: 1.2 }}>
              {cfg.name.split(" ").slice(-1)[0]}
              {kills > 0 && <div>×{kills} 💀</div>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export default function BossModal({ open, onClose }: Props) {
  const data         = useTrainStore(s => s.data)
  const currentBoss  = useTrainStore(s => s.data.currentBoss)
  const bossKills    = useTrainStore(s => s.data.bossKills || {})
  const startBoss    = useTrainStore(s => s.startBossBattle)
  const abandonBoss  = useTrainStore(s => s.abandonBoss)

  const [selectedIdx, setSelectedIdx] = useState<number | null>(currentBoss?.idx ?? null)

  if (!open) return null

  const streak = dayStreak(data)

  const cfg: BossConfig | null = selectedIdx !== null ? BOSSES[Math.min(selectedIdx, BOSSES.length - 1)] : null
  const maxHp    = cfg ? cfg.hp + Math.max(0, (selectedIdx ?? 0) - (BOSSES.length - 1)) * 500 : 0
  const currentHp = (currentBoss && currentBoss.idx === selectedIdx) ? currentBoss.hp : maxHp
  const isFighting = currentBoss?.idx === selectedIdx

  function handleStart() {
    if (selectedIdx === null || currentBoss) return
    startBoss(selectedIdx)
    onClose()
  }

  function handleAbandon() {
    if (!confirm("Abandon this fight? All progress on this boss is lost.")) return
    abandonBoss()
    onClose()
  }

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">⚔ Boss Battle</h2>
            <p className="text-muted text-xs">Select a boss · Log sessions to deal damage · Win for gacha loot</p>
          </div>
          <button onClick={onClose} className="text-muted text-sm px-2">✕</button>
        </div>

        {/* Active fight notice */}
        {currentBoss && currentBoss.idx !== selectedIdx && (
          <div className="mb-3 rounded-xl px-3 py-2 text-[11px] font-bold"
            style={{ background: "rgba(255,77,61,0.1)", border: "1px solid rgba(255,77,61,0.25)", color: "#ff4d3d" }}>
            ⚔ Currently fighting {BOSSES[Math.min(currentBoss.idx, BOSSES.length-1)].name} — tap its icon above
          </div>
        )}

        {/* Phase strip */}
        <PhaseStrip
          selectedIdx={selectedIdx}
          bossKills={bossKills}
          currentBossIdx={currentBoss?.idx ?? null}
          onSelect={i => setSelectedIdx(prev => prev === i ? null : i)}
        />

        {/* Boss detail */}
        {cfg && selectedIdx !== null && (
          <div
            className="rounded-2xl mb-4"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${cfg.color}1a 0%, #10121a 70%)`,
              border: `1px solid ${cfg.color}44`,
            }}
          >
            <div className="px-4 pt-4 pb-4">
              {/* Sprite + info */}
              <div className="flex items-center gap-4 mb-3">
                <div style={{ flexShrink: 0, transform: "scale(0.72)", transformOrigin: "left center" }}>
                  <BossSprite bodyColor={cfg.color} anim={isFighting ? "hit" : "idle"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-extrabold tracking-tight mb-0.5" style={{ color: cfg.color }}>
                    {cfg.name}
                  </div>
                  <div className="text-[11px] italic mb-2" style={{ color: cfg.color + "88" }}>
                    "{cfg.taunt}"
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                      style={{ background: cfg.color + "22", color: cfg.color }}>
                      {maxHp.toLocaleString()} HP
                    </span>
                    {(bossKills[selectedIdx] || 0) > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                        style={{ background: "rgba(250,191,25,0.15)", color: "#fbbf24" }}>
                        💀 Slain ×{bossKills[selectedIdx]}
                      </span>
                    )}
                    {isFighting && (
                      <span className="text-[10px] px-2 py-1 rounded-lg font-bold animate-pulse"
                        style={{ background: "rgba(255,77,61,0.15)", color: "#ff4d3d" }}>
                        ⚔ Fighting
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* HP bar (if fighting this boss) */}
              {isFighting && (
                <div className="mb-3">
                  <HpBar current={currentHp} max={maxHp} color={cfg.color} />
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-muted mb-0.5">Streak</div>
                  <div className="font-extrabold" style={{ color: cfg.color }}>{streak}d 🔥</div>
                </div>
                <div className="rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-muted mb-0.5">Loot tier</div>
                  <div className="font-extrabold" style={{ color: cfg.color }}>
                    {selectedIdx <= 1 ? "Common / Rare"
                     : selectedIdx <= 3 ? "Rare / Epic"
                     : selectedIdx <= 5 ? "Epic / Legendary"
                     : "Legendary"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedIdx === null && (
          <div className="text-center text-muted text-sm py-4">Tap a boss above to see details</div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {isFighting ? (
            <>
              <button onClick={handleAbandon} className="btn-secondary flex-1">Abandon</button>
              <button onClick={onClose} className="btn-secondary flex-1">Close</button>
            </>
          ) : currentBoss ? (
            <button onClick={onClose} className="btn-secondary w-full">Close (fight in progress)</button>
          ) : (
            <>
              <button
                onClick={handleStart}
                disabled={selectedIdx === null}
                className="flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all"
                style={{
                  background: selectedIdx !== null ? "rgba(255,77,61,0.15)" : "rgba(255,255,255,0.05)",
                  color: selectedIdx !== null ? "#ff4d3d" : "#555",
                  border: `1px solid ${selectedIdx !== null ? "rgba(255,77,61,0.3)" : "transparent"}`,
                  cursor: selectedIdx !== null ? "pointer" : "not-allowed",
                }}
              >
                ⚔ Start Battle
              </button>
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
