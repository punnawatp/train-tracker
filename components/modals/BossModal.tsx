"use client"

import { useState, useRef, useEffect } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { BOSSES, GACHA_GEAR } from "@/lib/constants"
import type { BossConfig } from "@/lib/constants"
import {
  dayStreak,
  buildWheelSegments,
  rollWheelSegment,
  totalAttackPower,
  gearAttackPower,
} from "@/lib/game-logic"
import type { WheelSegment } from "@/lib/game-logic"
import type { GearItem } from "@/lib/types"

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

function rarityColor(r: GearItem["rarity"]): string {
  return ({ common: "#94a3b8", rare: "#60a5fa", epic: "#b388ff", legendary: "#fbbf24" })[r]
}

// ── Boss sprite ───────────────────────────────────────────────────────────────

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
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
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

// ── Spin wheel ────────────────────────────────────────────────────────────────

function buildConicGradient(segs: WheelSegment[]): string {
  let cum = 0
  const stops: string[] = []
  for (const s of segs) {
    if (s.pct < 0.05) { cum += s.pct; continue }
    const next = cum + s.pct
    stops.push(`${s.color} ${cum.toFixed(2)}% ${next.toFixed(2)}%`)
    cum = next
  }
  return `conic-gradient(from 0deg, ${stops.join(", ")})`
}

function WheelDisplay({ segs, rotation, spinning, onEnd }: {
  segs: WheelSegment[]
  rotation: number
  spinning: boolean
  onEnd: () => void
}) {
  const SIZE = 200
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: SIZE, height: SIZE + 20 }}>
      {/* Pointer triangle */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        width: 0, height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderTop: "20px solid #f1f5f9",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.8))",
        zIndex: 20,
      }} />
      {/* Wheel */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          width: SIZE, height: SIZE,
          borderRadius: "50%",
          background: buildConicGradient(segs),
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          border: "4px solid #1a1d24",
          boxShadow: "0 0 30px rgba(0,0,0,0.6)",
        }}
        onTransitionEnd={onEnd}
      />
      {/* Center circle */}
      <div style={{
        position: "absolute", bottom: SIZE / 2 - 18, left: "50%",
        transform: "translateX(-50%)",
        width: 36, height: 36,
        borderRadius: "50%",
        background: "#10121a",
        border: "3px solid #2a2d34",
        zIndex: 10,
      }} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export default function BossModal({ open, onClose }: Props) {
  const data          = useTrainStore(s => s.data)
  const currentBoss   = useTrainStore(s => s.data.currentBoss)
  const bossKills     = useTrainStore(s => s.data.bossKills || {})
  const startBoss     = useTrainStore(s => s.startBossBattle)
  const abandonBoss   = useTrainStore(s => s.abandonBoss)
  const dealBossDmg   = useTrainStore(s => s.dealBossDamage)

  const [selectedIdx, setSelectedIdx] = useState<number | null>(currentBoss?.idx ?? null)
  const [spinning, setSpinning]       = useState(false)
  const [wheelRot, setWheelRot]       = useState(0)
  const [spinRes, setSpinRes]         = useState<{ label: string; dmg: number; color: string } | null>(null)
  const prevRotRef    = useRef(0)
  const pendingSegRef = useRef<number | null>(null)

  useEffect(() => {
    if (open) setSelectedIdx(currentBoss?.idx ?? null)
    else { setSpinning(false); setSpinRes(null) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const cfg: BossConfig | null = selectedIdx !== null ? BOSSES[Math.min(selectedIdx, BOSSES.length - 1)] : null
  const maxHp     = cfg ? cfg.hp + Math.max(0, (selectedIdx ?? 0) - (BOSSES.length - 1)) * 500 : 0
  const currentHp = (currentBoss && currentBoss.idx === selectedIdx) ? currentBoss.hp : maxHp
  const isFighting = currentBoss?.idx === selectedIdx && currentBoss !== null

  const atk      = totalAttackPower(data.equipped, GACHA_GEAR)
  const baseAtk  = Math.max(10, atk)
  const segments = buildWheelSegments(atk)

  function handleSpin() {
    if (spinning || !isFighting) return
    const segIdx = rollWheelSegment(segments)
    pendingSegRef.current = segIdx
    setSpinRes(null)

    // Midpoint angle of the target segment (degrees from top, clockwise)
    let midAngle = 0
    for (let i = 0; i < segIdx; i++) midAngle += segments[i].pct * 3.6
    midAngle += segments[segIdx].pct * 1.8

    // Rotate so midAngle ends up at the top pointer: rotate by (360 - midAngle) + N*360
    const prevR  = prevRotRef.current
    const offset = (360 - (midAngle % 360)) % 360
    const newRot = prevR + 1440 + offset
    prevRotRef.current = newRot

    setSpinning(true)
    setWheelRot(newRot)
  }

  function handleSpinEnd() {
    setSpinning(false)
    const segIdx = pendingSegRef.current
    if (segIdx === null) return
    pendingSegRef.current = null

    const seg = segments[segIdx]
    const dmg = Math.round(baseAtk * seg.dmgMultiplier)
    setSpinRes({ label: seg.label, dmg, color: seg.color })
    if (dmg > 0) dealBossDmg(dmg)
  }

  function handleStart() {
    if (selectedIdx === null || currentBoss) return
    startBoss(selectedIdx)
    onClose()
  }

  function handleAbandon() {
    if (!confirm("Abandon this fight? All progress on this boss is lost.")) return
    abandonBoss()
    setSpinRes(null)
    onClose()
  }

  // Equipped gear breakdown for ATK display
  const equippedSlots = (["weapon", "helmet", "armor", "ring"] as const)
    .map(slot => {
      const id = data.equipped?.[slot]
      return id ? GACHA_GEAR.find(g => g.id === id) ?? null : null
    })
    .filter((g): g is GearItem => g !== null)

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 440 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">⚔ Boss Battle</h2>
            <p className="text-muted text-xs">
              {isFighting
                ? "Spin the wheel to attack · Better gear = higher odds"
                : "Select a boss · Win for gacha loot"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted text-sm px-2">✕</button>
        </div>

        {/* Active fight notice when viewing a different boss */}
        {currentBoss && currentBoss.idx !== selectedIdx && (
          <div className="mb-3 rounded-xl px-3 py-2 text-[11px] font-bold"
            style={{ background: "rgba(255,77,61,0.1)", border: "1px solid rgba(255,77,61,0.25)", color: "#ff4d3d" }}>
            ⚔ Currently fighting {BOSSES[Math.min(currentBoss.idx, BOSSES.length - 1)].name} — tap its icon above
          </div>
        )}

        {/* Phase strip */}
        <PhaseStrip
          selectedIdx={selectedIdx}
          bossKills={bossKills}
          currentBossIdx={currentBoss?.idx ?? null}
          onSelect={i => setSelectedIdx(prev => prev === i ? null : i)}
        />

        {/* ── FIGHTING VIEW ──────────────────────────────────────── */}
        {isFighting && cfg && selectedIdx !== null && (
          <div>
            {/* Boss name + HP */}
            <div className="rounded-2xl px-4 pt-3 pb-4 mb-4"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${cfg.color}18 0%, #10121a 70%)`,
                border: `1px solid ${cfg.color}33`,
              }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ flexShrink: 0, transform: "scale(0.55)", transformOrigin: "left center", height: 90, overflow: "hidden" }}>
                  <BossSprite bodyColor={cfg.color} anim="hit" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-base tracking-tight mb-0.5" style={{ color: cfg.color }}>
                    {cfg.name}
                  </div>
                  <div className="text-[10px] italic mb-2" style={{ color: cfg.color + "88" }}>"{cfg.taunt}"</div>
                  <HpBar current={currentHp} max={maxHp} color={cfg.color} />
                </div>
              </div>
            </div>

            {/* Spin wheel */}
            <div className="flex flex-col items-center mb-3">
              <WheelDisplay
                segs={segments}
                rotation={wheelRot}
                spinning={spinning}
                onEnd={handleSpinEnd}
              />
            </div>

            {/* Spin result */}
            {spinRes && !spinning && (
              <div className="text-center rounded-xl px-4 py-2.5 mb-3"
                style={{ background: spinRes.color + "18", border: `1px solid ${spinRes.color}44` }}>
                <div className="text-lg font-extrabold tracking-wider" style={{ color: spinRes.color }}>
                  {spinRes.label}
                </div>
                <div className="text-[11px] font-bold text-muted mt-0.5">
                  {spinRes.dmg > 0 ? `−${spinRes.dmg} HP dealt` : "No damage — equip better gear!"}
                </div>
              </div>
            )}

            {/* Segment legend */}
            <div className="grid grid-cols-3 gap-1 mb-3">
              {segments.map(seg => (
                <div key={seg.label}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
                  style={{ background: seg.color + "18" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-[9px] font-bold" style={{ color: seg.color }}>{seg.label}</span>
                  <span className="text-[8px] text-muted ml-auto">{seg.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>

            {/* ATK info */}
            <div className="flex items-center gap-2 text-[10px] mb-4 px-1">
              <span className="text-muted">⚔ ATK</span>
              <span className="font-extrabold" style={{ color: cfg.color }}>{atk}</span>
              {equippedSlots.length > 0 ? (
                <span className="text-muted">({equippedSlots.map(g => `${g.icon}+${gearAttackPower(g.rarity)}`).join(" ")})</span>
              ) : (
                <span className="text-muted italic">— no gear equipped</span>
              )}
            </div>

            {/* ATK reference */}
            <div className="flex gap-2 mb-4 px-1">
              {(["common", "rare", "epic", "legendary"] as const).map(r => (
                <div key={r} className="flex items-center gap-1 text-[9px]">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: rarityColor(r) }} />
                  <span style={{ color: rarityColor(r) }}>{r[0].toUpperCase()}{r.slice(1)}</span>
                  <span className="text-muted">+{gearAttackPower(r)}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSpin}
                disabled={spinning}
                className="flex-1 py-3 rounded-xl font-extrabold text-sm transition-all"
                style={{
                  background: spinning ? "rgba(255,255,255,0.05)" : "rgba(255,77,61,0.15)",
                  color: spinning ? "#555" : "#ff4d3d",
                  border: `1px solid ${spinning ? "transparent" : "rgba(255,77,61,0.35)"}`,
                  cursor: spinning ? "not-allowed" : "pointer",
                }}
              >
                {spinning ? "⟳ Spinning…" : "⚔ Spin"}
              </button>
              <button onClick={handleAbandon} className="btn-secondary px-5">Abandon</button>
            </div>
          </div>
        )}

        {/* ── BOSS SELECT VIEW ──────────────────────────────────── */}
        {!isFighting && cfg && selectedIdx !== null && (
          <>
            <div
              className="rounded-2xl mb-4"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${cfg.color}1a 0%, #10121a 70%)`,
                border: `1px solid ${cfg.color}44`,
              }}
            >
              <div className="px-4 pt-4 pb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div style={{ flexShrink: 0, transform: "scale(0.72)", transformOrigin: "left center" }}>
                    <BossSprite bodyColor={cfg.color} anim="idle" />
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
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-muted mb-0.5">Your streak</div>
                    <div className="font-extrabold" style={{ color: cfg.color }}>{dayStreak(data)}d 🔥</div>
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
                  <div className="rounded-lg px-2.5 py-2 col-span-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-muted mb-0.5">Your ATK power</div>
                    <div className="font-extrabold" style={{ color: cfg.color }}>
                      {atk > 0 ? `${atk} (${equippedSlots.map(g => g.icon).join(" ")})` : "0 — equip gear from gacha"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStart}
                disabled={selectedIdx === null || !!currentBoss}
                className="flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all"
                style={{
                  background: !currentBoss ? "rgba(255,77,61,0.15)" : "rgba(255,255,255,0.05)",
                  color: !currentBoss ? "#ff4d3d" : "#555",
                  border: `1px solid ${!currentBoss ? "rgba(255,77,61,0.3)" : "transparent"}`,
                  cursor: !currentBoss ? "pointer" : "not-allowed",
                }}
              >
                {currentBoss ? "Fight in progress" : "⚔ Start Battle"}
              </button>
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            </div>
          </>
        )}

        {/* Empty state */}
        {selectedIdx === null && (
          <div className="text-center text-muted text-sm py-4">Tap a boss above to see details</div>
        )}

        {/* Close when no boss selected */}
        {selectedIdx === null && (
          <button onClick={onClose} className="btn-secondary w-full mt-3">Close</button>
        )}

      </div>
    </div>
  )
}
