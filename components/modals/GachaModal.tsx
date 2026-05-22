"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import type { GearItem } from "@/lib/types"

const RARITY_CONFIG: Record<GearItem["rarity"], { color: string; label: string; glow: string; bg: string }> = {
  common:    { color: "#94a3b8", label: "COMMON",    glow: "#94a3b888", bg: "rgba(148,163,184,0.08)" },
  rare:      { color: "#4ade80", label: "RARE",       glow: "#4ade8088", bg: "rgba(74,222,128,0.10)" },
  epic:      { color: "#b388ff", label: "EPIC",       glow: "#b388ff88", bg: "rgba(179,136,255,0.12)" },
  legendary: { color: "#ffd700", label: "LEGENDARY",  glow: "#ffd70099", bg: "rgba(255,215,0,0.14)" },
}

const RARITY_STARS: Record<GearItem["rarity"], string> = {
  common: "⬥", rare: "⬥⬥", epic: "⬥⬥⬥", legendary: "⬥⬥⬥⬥",
}

const SLOT_LABELS: Record<GearItem["slot"], string> = {
  weapon: "Weapon", helmet: "Helmet", armor: "Armor", ring: "Ring",
}

interface Props {
  result: Array<GearItem | "salt"> | null
}

export default function GachaModal({ result }: Props) {
  const claimGachaResult = useTrainStore(s => s.claimGachaResult)
  const ownedGear        = useTrainStore(s => s.data.gear || {})
  const equipGear        = useTrainStore(s => s.equipGear)
  const equipped         = useTrainStore(s => s.data.equipped || { weapon: null, helmet: null, armor: null, ring: null })

  const [phase, setPhase] = useState<"spinning" | "reveal">("spinning")

  useEffect(() => {
    if (!result) { setPhase("spinning"); return }
    setPhase("spinning")
    const t = setTimeout(() => setPhase("reveal"), 1600)
    return () => clearTimeout(t)
  }, [result])

  if (!result) return null

  const isSingle = result.length === 1
  const singleResult = isSingle ? result[0] : null

  // ── Spinning orb phase ──────────────────────────────────────────────────────
  if (phase === "spinning") {
    return (
      <div className="modal-bg show" style={{ zIndex: 200 }}>
        <div className="modal text-center" style={{ maxWidth: 320, background: "#10121a", border: "1px solid #2a2d36" }}>
          <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-muted mb-6">
            {isSingle ? "Rolling..." : `Rolling ×10...`}
          </div>
          <div className="flex justify-center mb-6">
            <div className="gacha-orb-spin" style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #e0e8ff 0%, #6080ff 40%, #1020a0 100%)",
              boxShadow: "0 0 40px #4060ff88, 0 0 80px #2040ff44",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>✨</div>
          </div>
          <div className="text-xs text-muted animate-pulse">Fate is being decided…</div>
        </div>
      </div>
    )
  }

  // ── Single result ───────────────────────────────────────────────────────────
  if (isSingle) {
    if (singleResult === "salt") {
      return (
        <div className="modal-bg show" style={{ zIndex: 200 }}>
          <div className="modal text-center" style={{
            maxWidth: 300,
            background: "radial-gradient(ellipse at 50% 20%, rgba(100,100,120,0.12) 0%, #10121a 70%)",
            border: "1px solid #2a2d3688",
          }}>
            <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-muted mb-3">
              Gacha Result
            </div>
            <div className="gacha-item flex justify-center mb-4" style={{ fontSize: 64, lineHeight: 1 }}>
              🪨
            </div>
            <div className="text-xl font-extrabold mb-1" style={{ color: "#6b7280" }}>Nothing...</div>
            <div className="text-xs text-muted mb-5">Just a pile of salt. Better luck next time.</div>
            <button onClick={claimGachaResult} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      )
    }

    const gear = singleResult as GearItem
    const { color, label, glow, bg } = RARITY_CONFIG[gear.rarity]
    const isDuplicate = (ownedGear[gear.id] || 0) > 0
    const isAlreadyEquipped = equipped[gear.slot] === gear.id

    function handleCollect(equip?: boolean) {
      claimGachaResult()
      if (equip) equipGear(gear.slot, gear.id)
    }

    return (
      <div className="modal-bg show" style={{ zIndex: 200 }}>
        <div className="modal text-center" style={{
          maxWidth: 340,
          background: `radial-gradient(ellipse at 50% 20%, ${bg} 0%, #10121a 70%)`,
          border: `1px solid ${color}44`,
          boxShadow: `0 0 60px ${glow}`,
        }}>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[2px] text-muted">
            {SLOT_LABELS[gear.slot]} Drop!
          </div>
          <div className="text-lg font-extrabold mb-4" style={{ color }}>Loot Drop</div>

          <div className="flex justify-center mb-4">
            <div className="rarity-ring" style={{
              width: 110, height: 110, borderRadius: "50%",
              background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`,
              border: `2px solid ${color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div className="gacha-item" style={{ fontSize: 52, lineHeight: 1 }}>{gear.icon}</div>
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full tracking-widest"
              style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
              {RARITY_STARS[gear.rarity]} {label}
            </span>
          </div>

          <div className="text-2xl font-extrabold tracking-tight mb-0.5" style={{ color }}>{gear.name}</div>
          <div className="text-[11px] text-muted mb-4 uppercase tracking-widest">{SLOT_LABELS[gear.slot]}</div>

          {isDuplicate && (
            <div className="text-[11px] mb-3 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "#8a90a0" }}>
              You already own this — adding another copy
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!isAlreadyEquipped && (
              <button onClick={() => handleCollect(true)}
                className="w-full py-2.5 rounded-xl font-extrabold text-sm"
                style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}>
                Collect &amp; Equip
              </button>
            )}
            <button onClick={() => handleCollect(false)} className="btn-secondary w-full">
              {isAlreadyEquipped ? "Collect" : `Collect (keep current ${SLOT_LABELS[gear.slot].toLowerCase()})`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Multi-pull (10) grid reveal ──────────────────────────────────────────────
  const gearCount = result.filter(r => r !== "salt").length
  const saltCount = result.filter(r => r === "salt").length

  return (
    <div className="modal-bg show" style={{ zIndex: 200 }}>
      <div className="modal" style={{ maxWidth: 500 }}>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-extrabold">×10 Pull Results</div>
            <div className="text-[11px] text-muted mt-0.5">
              {gearCount > 0 ? `${gearCount} item${gearCount !== 1 ? "s" : ""} found` : "No items found"}
              {saltCount > 0 && ` · ${saltCount} salt`}
            </div>
          </div>
        </div>

        {/* 5×2 grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {result.map((item, i) => (
            <PullCard key={i} item={item} index={i} />
          ))}
        </div>

        <button onClick={claimGachaResult} className="btn-secondary w-full">
          Collect All &amp; Close
        </button>
      </div>
    </div>
  )
}

function PullCard({ item, index }: { item: GearItem | "salt"; index: number }) {
  if (item === "salt") {
    return (
      <div
        className="gacha-item flex flex-col items-center justify-center rounded-xl py-3 gap-1"
        style={{
          background: "rgba(100,100,120,0.08)",
          border: "1px solid rgba(100,100,120,0.2)",
          animationDelay: `${index * 80}ms`,
        }}
      >
        <span style={{ fontSize: 22 }}>🪨</span>
        <span className="text-[8px] font-extrabold uppercase tracking-wide" style={{ color: "#4a4d58" }}>Salt</span>
      </div>
    )
  }

  const { color, bg } = RARITY_CONFIG[item.rarity]

  return (
    <div
      className="gacha-item flex flex-col items-center justify-center rounded-xl py-3 gap-1"
      style={{
        background: bg,
        border: `1px solid ${color}44`,
        boxShadow: `0 0 8px ${color}22`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <span style={{ fontSize: 22 }}>{item.icon}</span>
      <span className="text-[8px] font-extrabold text-center leading-tight px-1" style={{ color }}>
        {item.name.split(" ").slice(-1)[0]}
      </span>
      <span className="text-[7px] font-bold" style={{ color: color + "88" }}>
        {RARITY_STARS[item.rarity]}
      </span>
    </div>
  )
}
