"use client"

import { useEffect, useRef, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"

// ── Boss roster ───────────────────────────────────────────────────────────────

interface BossConfig { name: string; color: string; hp: number; taunt: string }

const BOSSES: BossConfig[] = [
  { name: "Couch Potato",     color: "#ff8fab", hp: 300,  taunt: "I ain't movin' for nobody." },
  { name: "Sugar Queen",      color: "#ff9f43", hp: 500,  taunt: "You can't out-sugar me." },
  { name: "Pizza Princess",   color: "#ffd700", hp: 800,  taunt: "Extra cheese, extra me." },
  { name: "Deep Fry Duchess", color: "#a8e063", hp: 1200, taunt: "Everything's better fried." },
  { name: "The Sloth",        color: "#4cc9f0", hp: 1800, taunt: "Maybe tomorrow... zzz." },
  { name: "Lady Laziness",    color: "#b388ff", hp: 2500, taunt: "Effort is so overrated." },
  { name: "The Final Boss",   color: "#ff4d3d", hp: 4000, taunt: "You will NEVER defeat me!" },
]

function getBossState(xp: number) {
  let rem = xp, idx = 0, totalDefeated = 0
  while (true) {
    const cfg = BOSSES[Math.min(idx, BOSSES.length - 1)]
    const maxHp = cfg.hp + Math.max(0, idx - (BOSSES.length - 1)) * 500
    if (rem < maxHp) return { idx, cfg: { ...cfg, hp: maxHp }, currentHp: maxHp - rem, maxHp, totalDefeated }
    rem -= maxHp; idx++; totalDefeated++
  }
}

// ── Color util ────────────────────────────────────────────────────────────────

function darken(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amt)))
    const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amt)))
    const b = Math.max(0, Math.round((n & 0xff) * (1 - amt)))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}

// ── 16-bit sprite (18 wide × 21 tall) ────────────────────────────────────────

const PX = 9 // pixels per cell

function buildSprite(bodyColor: string): (string | null)[][] {
  const _ = null
  const K = "#0d0d1a", G = "#ffd700", g = "#b8860b"
  const S = "#ffc899", s = "#d4904e"
  const E = "#1a0a00", H = "#ffffff"
  const c = "#ff9eb5", L = "#e8335a", M = "#8b0000"
  const B = bodyColor, b = darken(bodyColor, 0.28)
  void s // used implicitly in shading notes
  return [
    [_,_,_,K,G,K,_,G,K,G,_,K,G,K,_,_,_,_],  //  0 crown spikes
    [_,_,K,G,G,G,G,G,G,G,G,G,G,G,K,_,_,_],  //  1 crown band
    [_,_,K,g,G,g,G,G,G,G,G,G,g,G,K,_,_,_],  //  2 crown detail
    [_,_,K,S,S,S,S,S,S,S,S,S,S,S,K,_,_,_],  //  3 forehead
    [_,_,K,S,S,E,S,S,H,S,S,E,S,S,K,_,_,_],  //  4 eyes top
    [_,_,K,S,S,E,E,S,S,S,E,E,S,S,K,_,_,_],  //  5 eyes lower
    [_,_,K,S,S,S,S,S,S,S,S,S,S,S,K,_,_,_],  //  6 nose/mid
    [_,_,K,S,c,S,S,S,S,S,S,S,c,S,K,_,_,_],  //  7 blush
    [_,_,K,S,S,M,M,L,L,L,M,M,S,S,K,_,_,_],  //  8 mouth
    [_,_,K,S,S,S,H,H,H,H,S,S,S,S,K,_,_,_],  //  9 teeth
    [_,_,_,K,S,S,S,S,S,S,S,S,S,K,_,_,_,_],  // 10 chin
    [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_,_],  // 11 chest
    [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_],  // 12 body
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_],  // 13 widest (arms)
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_],  // 14 widest
    [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_],  // 15 body
    [_,_,B,B,b,B,B,B,B,B,B,b,B,B,_,_,_,_],  // 16 lower body (shadow detail)
    [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_,_,_],  // 17 pelvis
    [_,_,_,B,B,B,_,_,_,_,B,B,B,_,_,_,_,_],  // 18 upper legs
    [_,_,_,B,B,B,_,_,_,_,B,B,B,_,_,_,_,_],  // 19 legs
    [_,_,_,K,K,K,_,_,_,_,K,K,K,_,_,_,_,_],  // 20 feet
  ]
}

function BossSprite({ bodyColor, anim }: { bodyColor: string; anim: "idle" | "hit" | "dead" }) {
  const sprite = buildSprite(bodyColor)
  return (
    <div
      className={anim === "dead" ? "boss-dead" : anim === "hit" ? "boss-hit" : "boss-idle"}
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

// ── Phase strip ───────────────────────────────────────────────────────────────

function PhaseStrip({
  current, defeated, selectedIdx, onSelect,
}: {
  current: number; defeated: number; selectedIdx: number | null; onSelect: (i: number) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
      {BOSSES.map((cfg, i) => {
        const isDefeated = i < defeated
        const isCurrent  = i === current
        const isLocked   = i > current
        const isSelected = i === selectedIdx
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 flex flex-col items-center gap-1 transition-opacity"
            style={{ opacity: isLocked ? 0.4 : 1, background: "none", border: "none", padding: 0, cursor: "pointer" }}
            title={isLocked ? "???" : cfg.name}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all"
              style={{
                background: isDefeated ? "#0a0b0e" : isCurrent ? cfg.color + "22" : "#0d0e12",
                border: `2px solid ${isSelected ? cfg.color : isDefeated ? "#1a1d24" : isCurrent ? cfg.color : "#1a1d24"}`,
                boxShadow: isSelected ? `0 0 18px ${cfg.color}cc` : isCurrent ? `0 0 14px ${cfg.color}88` : "none",
                transform: isSelected ? "scale(1.18)" : "scale(1)",
              }}
            >
              {isDefeated ? (
                <span style={{ fontSize: 18 }}>💀</span>
              ) : isCurrent ? (
                <span className="text-xs font-extrabold" style={{ color: cfg.color }}>{i + 1}</span>
              ) : (
                <span className="text-xs font-bold" style={{ color: isLocked ? "#333" : "#8a90a0" }}>{i + 1}</span>
              )}
              {isCurrent && !isSelected && (
                <div className="absolute -inset-[3px] rounded-xl border-2 animate-pulse"
                  style={{ borderColor: cfg.color + "66" }} />
              )}
            </div>
            <div className="text-[7px] font-bold text-center" style={{
              color: isDefeated ? "#555" : isCurrent ? cfg.color : isLocked ? "#333" : "#8a90a0",
              maxWidth: 40, lineHeight: 1.2,
            }}>
              {isLocked ? "???" : cfg.name.split(" ").slice(-1)[0]}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Boss detail panel (shown when a strip icon is clicked) ────────────────────

function BossDetailPanel({
  idx, status, onClose,
}: {
  idx: number; status: "defeated" | "current" | "locked"; onClose: () => void
}) {
  const cfg = BOSSES[idx]
  const isLocked = status === "locked"
  const isDefeated = status === "defeated"
  return (
    <div
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        background: isLocked ? "#0d0e12" : `radial-gradient(ellipse at 50% 0%, ${cfg.color}22 0%, #10121a 70%)`,
        border: `1px solid ${isLocked ? "#1a1d24" : cfg.color + "44"}`,
      }}
    >
      <div className="px-4 pt-4 pb-4">
        {/* Close bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[2px]"
            style={{ color: isLocked ? "#555" : cfg.color }}>
            {isDefeated ? "💀 Defeated" : isLocked ? "🔒 Locked" : "⚔ Current Enemy"}
          </span>
          <button onClick={onClose} className="text-muted hover:text-tx transition text-sm px-1.5">✕ close</button>
        </div>

        {/* Sprite + info side by side */}
        <div className="flex items-center gap-5">
          {/* Sprite (silhouette if locked) */}
          <div style={{
            filter: isLocked ? "brightness(0.1) grayscale(1)" : isDefeated ? "grayscale(0.6) brightness(0.7)" : "none",
            flexShrink: 0,
            transform: "scale(0.7)",
            transformOrigin: "left center",
          }}>
            <BossSprite bodyColor={isLocked ? "#666" : cfg.color} anim="idle" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-lg font-extrabold tracking-tight mb-0.5"
              style={{ color: isLocked ? "#444" : cfg.color }}>
              {isLocked ? "???" : cfg.name}
            </div>
            {!isLocked && (
              <div className="text-[11px] italic mb-2" style={{ color: cfg.color + "88" }}>
                "{cfg.taunt}"
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                style={{
                  background: isLocked ? "rgba(255,255,255,0.04)" : cfg.color + "22",
                  color: isLocked ? "#444" : cfg.color,
                }}>
                {isLocked ? "??? HP" : `${cfg.hp.toLocaleString()} HP`}
              </span>
              {isDefeated && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                  style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
                  ✓ Slain
                </span>
              )}
              {!isLocked && !isDefeated && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-bold animate-pulse"
                  style={{ background: "rgba(255,77,61,0.15)", color: "#ff4d3d" }}>
                  ⚔ Fighting now
                </span>
              )}
              {isLocked && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-bold"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#444" }}>
                  Defeat #{idx} to unlock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HP bar ────────────────────────────────────────────────────────────────────

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100)
  const critical = pct < 25
  const barColor = critical ? "#ff4d3d" : pct < 50 ? "#ff9f43" : color
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color }}>HP</span>
          {critical && <span className="text-[9px] font-bold text-red-400 animate-pulse">⚠ CRITICAL</span>}
        </div>
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
          {Math.ceil(current).toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 18, background: "#0a0b0e", border: "1px solid #1a1d24", borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div
          className={critical ? "hp-critical" : ""}
          style={{
            width: `${pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${darken(barColor, 0.2)}, ${barColor})`,
            boxShadow: `0 0 14px ${barColor}88`,
            transition: "width 0.5s ease",
          }}
        />
        {[10,20,30,40,50,60,70,80,90].map(n => (
          <div key={n} style={{ position: "absolute", top: 0, bottom: 0, left: `${n}%`, width: 1, background: "rgba(0,0,0,0.5)" }} />
        ))}
      </div>
    </div>
  )
}

// ── Particles ─────────────────────────────────────────────────────────────────

interface Particle { id: number; x: string; y: string; dx: number; dy: number; rot: number; size: number; color: string; delay: number }

function spawnExplosion(color: string): Particle[] {
  const palette = [color, "#ffd700", "#ff4d3d", "#ffffff", darken(color, 0.3)]
  return Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360 + (Math.random() - 0.5) * 25
    const dist  = 70 + Math.random() * 130
    const rad   = (angle * Math.PI) / 180
    return {
      id: Date.now() + i,
      x: `${38 + Math.random() * 24}%`,
      y: `${20 + Math.random() * 35}%`,
      dx: Math.cos(rad) * dist,
      dy: Math.sin(rad) * dist,
      rot: (Math.random() - 0.5) * 720,
      size: 4 + Math.random() * 10,
      color: palette[Math.floor(Math.random() * palette.length)],
      delay: Math.random() * 200,
    }
  })
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface HitEvent { id: number; dmg: number; x: number }

interface BossCardProps {
  onShopOpen: () => void
}

export default function BossCard({ onShopOpen }: BossCardProps) {
  const xp = useTrainStore(s => s.data.xp)
  const gold = useTrainStore(s => s.data.gold || 0)
  const activeEffects = useTrainStore(s => s.data.activeEffects || {})
  const prevXpRef = useRef(xp)
  const [anim, setAnim] = useState<"idle" | "hit" | "dead">("idle")
  const [hits, setHits] = useState<HitEvent[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const boss = getBossState(xp)

  useEffect(() => {
    const prev = prevXpRef.current
    prevXpRef.current = xp
    if (xp <= prev) return

    const dmg = xp - prev
    const prevBoss = getBossState(prev)
    const currBoss = getBossState(xp)
    const bossDefeated = currBoss.totalDefeated > prevBoss.totalDefeated

    if (bossDefeated) {
      setAnim("dead")
      setParticles(spawnExplosion(prevBoss.cfg.color))
      setTimeout(() => { setAnim("idle"); setParticles([]) }, 1800)
    } else {
      setAnim("hit")
      setTimeout(() => setAnim("idle"), 750)
    }

    const id = Date.now()
    setHits(p => [...p, { id, dmg, x: 22 + Math.random() * 56 }])
    setTimeout(() => setHits(p => p.filter(h => h.id !== id)), 1400)
  }, [xp])

  return (
    <div
      className="rounded-2xl mb-3.5 overflow-hidden relative select-none"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${boss.cfg.color}15 0%, #10121a 65%)`,
        border: `1px solid ${boss.cfg.color}30`,
      }}
    >
      {/* Screen flash on hit */}
      {anim === "hit" && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{ background: `${boss.cfg.color}14`, animation: "screen-flash 0.35s ease-out" }} />
      )}

      <div className="px-5 pt-4 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[2px]" style={{ color: boss.cfg.color }}>
            ⚔ Boss Battle
          </span>
          <div className="flex items-center gap-2">
            {boss.totalDefeated > 0 && (
              <span className="text-[10px] text-muted">{boss.totalDefeated} defeated 💀</span>
            )}
            <button
              onClick={onShopOpen}
              className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all"
              style={{ background: "rgba(250,191,25,0.12)", color: "#fbbf24", border: "1px solid rgba(250,191,25,0.25)" }}
            >
              🪙 {gold.toLocaleString()}g · Shop
            </button>
          </div>
        </div>

        {/* Active buffs row */}
        {((activeEffects.dmg_boost ?? 1) > 1 || (activeEffects.gold_boost ?? 1) > 1) && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {(activeEffects.dmg_boost ?? 1) > 1 && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md animate-pulse"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                ⚔ ×{activeEffects.dmg_boost} NEXT HIT
              </span>
            )}
            {(activeEffects.gold_boost ?? 1) > 1 && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md animate-pulse"
                style={{ background: "rgba(250,191,25,0.15)", color: "#fbbf24", border: "1px solid rgba(250,191,25,0.25)" }}>
                🪙 ×{activeEffects.gold_boost} GOLD BOOST
              </span>
            )}
          </div>
        )}

        {/* Phase strip */}
        <PhaseStrip
          current={boss.idx}
          defeated={boss.totalDefeated}
          selectedIdx={selectedIdx}
          onSelect={(i) => setSelectedIdx(prev => prev === i ? null : i)}
        />

        {/* Boss detail panel (when a strip icon is tapped) */}
        {selectedIdx !== null && (
          <BossDetailPanel
            idx={selectedIdx}
            status={selectedIdx < boss.totalDefeated ? "defeated" : selectedIdx === boss.idx ? "current" : "locked"}
            onClose={() => setSelectedIdx(null)}
          />
        )}

        {/* Arena */}
        <div className="relative flex justify-center items-end mb-3" style={{ minHeight: 210 }}>
          {/* Explosion particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute pointer-events-none"
              style={{
                left: p.x, top: p.y,
                width: p.size, height: p.size,
                background: p.color,
                imageRendering: "pixelated",
                animationDelay: `${p.delay}ms`,
                animation: "particle-fly 1.6s ease-out forwards",
                "--px-dx": `${p.dx}px`,
                "--px-dy": `${p.dy}px`,
                "--px-rot": `${p.rot}deg`,
              } as React.CSSProperties}
            />
          ))}

          {/* Floating damage numbers */}
          {hits.map(hit => (
            <div
              key={hit.id}
              className="absolute pointer-events-none z-20"
              style={{ left: `${hit.x}%`, top: "12%", animation: "dmg-float 1.4s ease-out forwards" }}
            >
              <span style={{
                fontFamily: "monospace",
                fontSize: 28,
                fontWeight: 900,
                color: "#ff4d3d",
                textShadow: "0 0 18px #ff4d3d, 0 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000",
                lineHeight: 1,
              }}>
                -{hit.dmg}
              </span>
            </div>
          ))}

          {/* Boss sprite */}
          <BossSprite bodyColor={boss.cfg.color} anim={anim} />
        </div>

        {/* Name & taunt */}
        <div className="text-center mb-4">
          <div className="text-xl font-extrabold tracking-tight mb-0.5"
            style={{ color: boss.cfg.color, textShadow: `0 0 24px ${boss.cfg.color}55` }}>
            {boss.cfg.name}
          </div>
          <div className="text-[11px] italic mb-1" style={{ color: boss.cfg.color + "77" }}>
            "{boss.cfg.taunt}"
          </div>
          <div className="text-[10px] text-muted">
            {boss.currentHp / boss.maxHp < 0.25
              ? "⚠ She's ENRAGED — don't stop now!"
              : boss.currentHp / boss.maxHp < 0.5
              ? "She's weakening... keep going!"
              : "Barely scratched. Hit harder!"}
          </div>
        </div>

        {/* HP bar */}
        <HpBar current={boss.currentHp} max={boss.maxHp} color={boss.cfg.color} />
      </div>
    </div>
  )
}
