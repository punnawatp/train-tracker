"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { GACHA_GEAR, GACHA_SHOP_RATES } from "@/lib/constants"
import type { GearItem } from "@/lib/types"

const RARITY_CONFIG: Record<string, { color: string; label: string }> = {
  common:    { color: "#94a3b8", label: "Common" },
  rare:      { color: "#4ade80", label: "Rare" },
  epic:      { color: "#b388ff", label: "Epic" },
  legendary: { color: "#ffd700", label: "Legendary" },
}

const RARITY_ORDER = ["legendary", "epic", "rare", "common"] as const
const SLOT_LABELS: Record<GearItem["slot"], string> = {
  weapon: "Weapon", helmet: "Helmet", armor: "Armor", ring: "Ring",
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function ShopModal({ open, onClose }: Props) {
  const gold      = useTrainStore(s => s.data.gold || 0)
  const gear      = useTrainStore(s => s.data.gear || {})
  const equipped  = useTrainStore(s => s.data.equipped || { weapon: null, helmet: null, armor: null, ring: null })
  const pullGacha = useTrainStore(s => s.pullGacha)
  const equipGear = useTrainStore(s => s.equipGear)

  if (!open) return null

  const ownedGear = GACHA_GEAR.filter(g => (gear[g.id] || 0) > 0)
    .sort((a, b) =>
      RARITY_ORDER.indexOf(a.rarity as typeof RARITY_ORDER[number]) -
      RARITY_ORDER.indexOf(b.rarity as typeof RARITY_ORDER[number])
    )

  // Group owned gear by slot
  const bySlot = (["weapon", "helmet", "armor", "ring"] as const).map(slot => ({
    slot,
    items: ownedGear.filter(g => g.slot === slot),
  })).filter(s => s.items.length > 0)

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 440 }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">⭐ Gacha</h2>
            <p className="text-muted text-xs">Spend gold to pull for weapons and gear</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-extrabold px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(250,191,25,0.12)", border: "1px solid rgba(250,191,25,0.3)", color: "#fbbf24" }}>
              🪙 {gold.toLocaleString()}g
            </div>
            <button onClick={onClose} className="text-muted text-sm px-2">✕</button>
          </div>
        </div>

        {/* ── Pull buttons ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => pullGacha(1)}
            disabled={gold < 50}
            className="rounded-2xl p-4 text-center transition-all"
            style={{
              background: gold >= 50 ? "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${gold >= 50 ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
              opacity: gold < 50 ? 0.5 : 1,
              cursor: gold >= 50 ? "pointer" : "not-allowed",
            }}
          >
            <div className="text-2xl mb-1">🎲</div>
            <div className="text-sm font-extrabold" style={{ color: gold >= 50 ? "#ffd700" : "#555" }}>Pull ×1</div>
            <div className="text-[11px] font-bold mt-0.5" style={{ color: "#fbbf24" }}>50 🪙</div>
          </button>

          <button
            onClick={() => pullGacha(10)}
            disabled={gold < 500}
            className="rounded-2xl p-4 text-center transition-all"
            style={{
              background: gold >= 500 ? "radial-gradient(ellipse at 50% 0%, rgba(179,136,255,0.18) 0%, rgba(179,136,255,0.06) 100%)" : "rgba(255,255,255,0.03)",
              border: `2px solid ${gold >= 500 ? "rgba(179,136,255,0.5)" : "rgba(255,255,255,0.08)"}`,
              opacity: gold < 500 ? 0.5 : 1,
              cursor: gold >= 500 ? "pointer" : "not-allowed",
            }}
          >
            <div className="text-2xl mb-1">✨</div>
            <div className="text-sm font-extrabold" style={{ color: gold >= 500 ? "#b388ff" : "#555" }}>Pull ×10</div>
            <div className="text-[11px] font-bold mt-0.5" style={{ color: "#fbbf24" }}>500 🪙</div>
          </button>
        </div>

        {/* ── Drop rates ── */}
        <div className="rounded-xl px-3 py-2.5 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-muted mb-2">Drop Rates</div>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="text-center rounded-lg py-1.5" style={{ background: "rgba(100,100,120,0.1)" }}>
              <div className="text-sm font-extrabold tabular-nums" style={{ color: "#6b7280" }}>{GACHA_SHOP_RATES.salt}%</div>
              <div className="text-[8px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "#6b728099" }}>Salt</div>
            </div>
            {(["common", "rare", "epic", "legendary"] as const).map(rarity => {
              const { color, label } = RARITY_CONFIG[rarity]
              const rate = GACHA_SHOP_RATES[rarity]
              return (
                <div key={rarity} className="text-center rounded-lg py-1.5" style={{ background: `${color}0e` }}>
                  <div className="text-sm font-extrabold tabular-nums" style={{ color }}>{rate}%</div>
                  <div className="text-[8px] font-bold uppercase tracking-wide mt-0.5" style={{ color: color + "aa" }}>{label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Gear collection by slot ── */}
        {bySlot.length > 0 && (
          <div className="mb-4">
            <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-muted mb-2">Your Gear</div>
            <div className="flex flex-col gap-1.5">
              {bySlot.map(({ slot, items }) => (
                <div key={slot}>
                  <div className="text-[8px] font-extrabold uppercase tracking-[2px] text-muted mb-1 pl-1">
                    {SLOT_LABELS[slot]}
                  </div>
                  {items.map(g => {
                    const { color } = RARITY_CONFIG[g.rarity]
                    const count = gear[g.id] || 0
                    const isEquipped = equipped[slot] === g.id
                    return (
                      <div key={g.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2 mb-1"
                        style={{ background: `${color}0d`, border: `1px solid ${color}22` }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{g.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold leading-tight">{g.name}</div>
                          <div className="text-[10px] font-bold" style={{ color }}>
                            {g.rarity.toUpperCase()} {count > 1 && `· ×${count} owned`}
                          </div>
                        </div>
                        {isEquipped ? (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0"
                            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                            Equipped
                          </span>
                        ) : (
                          <button onClick={() => equipGear(slot, g.id)}
                            className="text-[9px] font-extrabold px-2 py-0.5 rounded-md flex-shrink-0"
                            style={{ background: "rgba(255,255,255,0.06)", color: "#8a90a0", border: "1px solid rgba(255,255,255,0.1)" }}>
                            Equip
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-secondary w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
