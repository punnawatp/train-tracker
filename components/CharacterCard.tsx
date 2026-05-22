"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { GACHA_GEAR, BOSSES, STAT_DEFS } from "@/lib/constants"
import type { BossConfig } from "@/lib/constants"

// ── Color helpers ─────────────────────────────────────────────────────────────

function darken(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amt)))
    const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amt)))
    const b = Math.max(0, Math.round((n & 0xff) * (1 - amt)))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}

function lighten(hex: string, amt: number): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * amt))
    const g = Math.min(255, Math.round(((n >> 8) & 0xff)  + (255 - ((n >> 8) & 0xff))  * amt))
    const b = Math.min(255, Math.round((n & 0xff)          + (255 - (n & 0xff))          * amt))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}

// ── Rarity maps ───────────────────────────────────────────────────────────────

const RARITY_ARMOR: Record<string, string> = {
  common: "#94a3b8", rare: "#4ade80", epic: "#b388ff", legendary: "#ffa500",
}
const RARITY_COLOR: Record<string, string> = {
  common: "#94a3b8", rare: "#4ade80", epic: "#b388ff", legendary: "#ffd700",
}

// ── D&D Knight sprite — Mega Man X proportions (20w × 23h, PX=7) ─────────────
// Chunky 3/4 armor panels · orange skin face · magic teal rune · big helmet

const PX = 7

function buildHeroSprite(armorColor: string): (string | null)[][] {
  const _ = null
  const K = "#0a0a0f"

  // Orange skin (Mega Man X-style)
  const SK  = "#f0a040"
  const SKm = "#c07820"
  const SKd = "#904808"

  // Red gem on helm
  const RG = "#ff2828"

  // Teal magic accent (D&D rune glow)
  const TL = "#38d8c8"

  // Silver / inner joints
  const WH = "#d8e8f8"
  const Wm = "#9baabb"
  const wh = "#607080"

  // Gold belt buckle / trim
  const GD = "#ffd020"
  const gd = "#b09000"

  // Dark greaves / boot iron
  const DK = "#1a2430"
  const Dk = "#283448"

  // Armor — 5 shades from armorColor
  const Hl = lighten(armorColor, 0.65)  // specular
  const H4 = lighten(armorColor, 0.38)  // highlight
  const H3 = armorColor                  // base
  const H2 = darken(armorColor, 0.28)   // shadow
  const H1 = darken(armorColor, 0.55)   // darkest

  // col:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19
  return [
    [  _,   _,   _,   _,   _,   K,   Hl,  H4,  H3,  H2,  H3,  H4,  Hl,  K,   _,   _,   _,   _,   _,   _],  //  0 helm crest tip
    [  _,   _,   _,   _,   K,   H4,  Hl,  H4,  H3,  H3,  H3,  H4,  Hl,  H4,  K,   _,   _,   _,   _,   _],  //  1 helm upper
    [  _,   _,   _,   K,   H3,  H4,  H4,  H4,  RG,  RG,  H4,  H4,  H4,  H3,  K,   _,   _,   _,   _,   _],  //  2 helm crown + gem
    [  _,   _,   _,   K,   H2,  H3,  H4,  SK,  SK,  SK,  SK,  H4,  H3,  H2,  K,   _,   _,   _,   _,   _],  //  3 helm + face opens
    [  _,   _,   K,   H2,  H3, SKm, SKm,  SK,  SK,  SK,  SK, SKm, SKm,  H3,  H2,  K,   _,   _,   _,   _],  //  4 eyebrow row
    [  _,   _,   K,   H2,  H3,  SK,  K,   SK,  SK,  SK,  K,   SK,  H3,  H2,  K,   _,   _,   _,   _,   _],  //  5 eyes
    [  _,   _,   _,   K,   H3,  SK, SKm, SKd, SKd, SKd, SKm,  SK,  H3,  K,   _,   _,   _,   _,   _,   _],  //  6 lower face / mouth
    [  _,   _,   _,   K,   wh,  WH,  Wm,  wh,  wh,  wh,  wh,  Wm,  WH,  wh,  K,   _,   _,   _,   _,   _],  //  7 gorget / neck joint
    [  K,   H4,  H3,  K,   H3,  H4,  Hl,  H4,  H3,  H3,  H4,  Hl,  H4,  K,   H3,  H4,  H3,  H2,  K,   _],  //  8 pauldrons wide
    [  K,   H3,  H4,  K,   WH,  H3,  H4,  H4,  H3,  H3,  H4,  H4,  H3,  WH,  K,   H2,  H4,  H3,  K,   _],  //  9 upper arm + chest
    [  K,   H2,  H3,  K,   H3,  H4,  Hl,  TL,  H4,  H4,  TL,  Hl,  H4,  H3,  K,   H3,  H3,  H2,  K,   _],  // 10 arm + chest (teal rune)
    [  K,   wh,  WH,  K,   H3,  H3,  H4,  H4,  Hl,  Hl,  H4,  H4,  H3,  H3,  K,   wh,  WH,  wh,  K,   _],  // 11 lower arm + chest
    [  _,   K,   WH,  WH,  K,   GD,  gd,  H2,  H3,  H3,  H2,  gd,  GD,  K,   WH,  WH,  K,   _,   _,   _],  // 12 belt + wrist/fist
    [  _,   K,   H2,  H3,  H3,  H2,  H3,  H4,  H3,  H3,  H4,  H3,  H2,  H3,  H3,  H2,  K,   _,   _,   _],  // 13 hip plates
    [  _,   _,   K,   H2,  H3,  H4,  H3,  H2,  H2,  H2,  H2,  H3,  H4,  H3,  H2,  K,   _,   _,   _,   _],  // 14 lower hip
    [  _,   _,   K,   H2,  H3,  H2,  K,   _,   _,   _,   _,   K,   H2,  H3,  H2,  K,   _,   _,   _,   _],  // 15 thigh top (split)
    [  _,   _,   K,   Dk,  DK,  Dk,  K,   _,   _,   _,   _,   K,   Dk,  DK,  Dk,  K,   _,   _,   _,   _],  // 16 thighs
    [  _,   K,   H3,  H4,  Hl,  H4,  H3,  K,   _,   _,   K,   H3,  H4,  Hl,  H4,  H3,  K,   _,   _,   _],  // 17 knee guards
    [  _,   _,   K,   DK,  Dk,  DK,  K,   _,   _,   _,   _,   K,   DK,  Dk,  DK,  K,   _,   _,   _,   _],  // 18 shins
    [  _,   _,   K,   Dk,  DK,  Dk,  K,   _,   _,   _,   _,   K,   Dk,  DK,  Dk,  K,   _,   _,   _,   _],  // 19 lower shins
    [  _,   K,   H2,  H3,  H3,  H3,  H2,  K,   _,   _,   K,   H2,  H3,  H3,  H3,  H2,  K,   _,   _,   _],  // 20 boot cuff
    [  _,   K,   DK,  H2,  H3,  H2,  DK,  K,   _,   _,   K,   DK,  H2,  H3,  H2,  DK,  K,   _,   _,   _],  // 21 boots
    [  _,   K,   DK,  DK,  DK,  DK,  DK,  K,   _,   _,   K,   DK,  DK,  DK,  DK,  DK,  K,   _,   _,   _],  // 22 boot soles
  ]
}

// ── Sword overlay — changes color by rarity ───────────────────────────────────
// 5w × 14h vertical sword (tip up, pommel down)

const SWORD_COLORS: Record<string, { blade: string; edge: string; shadow: string; guard: string }> = {
  common:    { blade: "#b0b8c4", edge: "#e0e8f0", shadow: "#505860", guard: "#809090" },
  rare:      { blade: "#5cc8f8", edge: "#b0e8ff", shadow: "#2050a0", guard: "#40a0d0" },
  epic:      { blade: "#c080ff", edge: "#e8c0ff", shadow: "#5010b0", guard: "#9040e0" },
  legendary: { blade: "#ffd040", edge: "#fff8a0", shadow: "#a07800", guard: "#ff9000" },
}

function SwordSprite({ rarity }: { rarity: string }) {
  const c = SWORD_COLORS[rarity] ?? SWORD_COLORS.common
  const _ = null
  const K = "#0a0a0f"
  const BL = c.blade, BL2 = c.edge, BLS = c.shadow
  const GR = c.guard
  const HT = "#6b4028", HTl = "#8b5838"

  //  col: 0    1    2    3    4
  const pixels: (string | null)[][] = [
    [  _,   K,  BL2,  K,   _],   //  0 tip
    [  _,   K,  BL,  BLS,  K],   //  1 upper blade
    [  _,   K,  BL,  BLS,  K],   //  2 blade
    [  _,   K,  BL,  BLS,  K],   //  3 blade
    [  _,   K,  BL,  BLS,  K],   //  4 blade
    [  _,   K,  BL,  BLS,  K],   //  5 blade
    [  _,   K,  BL,  BLS,  K],   //  6 blade lower
    [  K,   GR,  GR,  GR,  K],   //  7 crossguard
    [  _,   K,  HTl,  HT,  K],   //  8 grip
    [  _,   K,  HTl,  HT,  K],   //  9 grip
    [  _,   K,  HTl,  HT,  K],   // 10 grip
    [  _,   K,   K,   K,   K],   // 11 pommel
  ]

  return (
    <div style={{ imageRendering: "pixelated", display: "inline-block" }}>
      {pixels.map((row, y) => (
        <div key={y} style={{ display: "flex", height: PX }}>
          {row.map((px, x) => (
            <div key={x} style={{ width: PX, height: PX, background: px ?? "transparent", flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function HeroSprite({ armorColor, anim, weaponRarity }: { armorColor: string; anim: "idle" | "hit"; weaponRarity: string | null }) {
  const sprite = buildHeroSprite(armorColor)
  return (
    <div className="relative" style={{ display: "inline-flex", alignItems: "flex-start" }}>
      <div
        className={anim === "hit" ? "boss-hit" : "hero-idle"}
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
      {/* Sword held at right arm — offset so grip aligns with arm (row ~11-12) */}
      {weaponRarity && (
        <div style={{ marginTop: PX * 4, marginLeft: -PX }}>
          <SwordSprite rarity={weaponRarity} />
        </div>
      )}
    </div>
  )
}

// ── Terraria-style gear slot ──────────────────────────────────────────────────

interface SlotProps {
  label: string; icon?: string; name?: string
  color?: string; empty?: boolean
  onEmpty?: () => void; onUnequip?: () => void
}

function GearSlot({ label, icon, name, color, empty, onEmpty, onUnequip }: SlotProps) {
  const borderColor = empty ? "#2a2d36" : (color ?? "#4cc9f0")
  const bg = empty ? "rgba(255,255,255,0.02)" : `${borderColor}14`
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={empty ? onEmpty : undefined}
        className="relative flex items-center justify-center rounded-xl transition-all"
        style={{
          width: 50, height: 50,
          background: bg,
          border: `2px solid ${borderColor}`,
          boxShadow: empty ? "none" : `0 0 10px ${borderColor}55`,
          cursor: empty ? "pointer" : "default",
        }}
        title={empty ? "Open Gacha" : name}
      >
        {icon ? (
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
        ) : (
          <span style={{ fontSize: 16, color: "#2a2d36" }}>?</span>
        )}
        {!empty && onUnequip && (
          <button
            onClick={onUnequip}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
            style={{ background: "#1a1d26", border: "1px solid #3a3d46", color: "#8a90a0" }}
          >
            ×
          </button>
        )}
      </button>
      <span className="text-[8px] font-extrabold uppercase tracking-widest"
        style={{ color: empty ? "#3a3d46" : borderColor }}>
        {label}
      </span>
    </div>
  )
}

// ── Active boss HP strip ──────────────────────────────────────────────────────

function ActiveBossStatus({ currentBoss }: { currentBoss: { idx: number; hp: number } }) {
  const cfg: BossConfig = BOSSES[Math.min(currentBoss.idx, BOSSES.length - 1)]
  const maxHp = cfg.hp + Math.max(0, currentBoss.idx - (BOSSES.length - 1)) * 500
  const pct = Math.max(0, (currentBoss.hp / maxHp) * 100)
  const barColor = pct < 25 ? "#ff4d3d" : pct < 50 ? "#ff9f43" : cfg.color
  return (
    <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: cfg.color }}>
          ⚔ {cfg.name}
        </span>
        <span className="text-[10px] tabular-nums text-muted">
          {currentBoss.hp.toLocaleString()} / {maxHp.toLocaleString()} HP
        </span>
      </div>
      <div style={{ height: 8, background: "#0a0b0e", border: "1px solid #1a1d24", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${darken(barColor, 0.2)}, ${barColor})`,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onShopOpen: () => void
  onBossOpen: () => void
}

export default function CharacterCard({ onShopOpen, onBossOpen }: Props) {
  const gold          = useTrainStore(s => s.data.gold || 0)
  const gear          = useTrainStore(s => s.data.gear || {})
  const equipped      = useTrainStore(s => s.data.equipped || { weapon: null, helmet: null, armor: null, ring: null })
  const activeEffects = useTrainStore(s => s.data.activeEffects || {})
  const currentBoss   = useTrainStore(s => s.data.currentBoss)
  const bossKills     = useTrainStore(s => s.data.bossKills || {})
  const stats         = useTrainStore(s => s.data.stats)
  const equipGear     = useTrainStore(s => s.equipGear)

  const weaponItem = GACHA_GEAR.find(g => g.id === equipped.weapon)
  const helmetItem = GACHA_GEAR.find(g => g.id === equipped.helmet)
  const armorItem  = GACHA_GEAR.find(g => g.id === equipped.armor)
  const ringItem   = GACHA_GEAR.find(g => g.id === equipped.ring)

  // Armor color: prefer equipped armor rarity, fall back to weapon, then best owned
  const rarityOrder = ["legendary", "epic", "rare", "common"]
  const equippedRarity = armorItem?.rarity ?? weaponItem?.rarity
  const ownedGear  = GACHA_GEAR.filter(g => (gear[g.id] || 0) > 0)
  const bestRarity = equippedRarity ?? rarityOrder.find(r => ownedGear.some(g => g.rarity === r))
  const armorColor = bestRarity ? RARITY_ARMOR[bestRarity] : "#4cc9f0"

  const goldBoost  = activeEffects.gold_boost ?? 1
  const totalKills = Object.values(bossKills).reduce((a, b) => a + b, 0)

  function scrollToAttributes(e: React.MouseEvent) {
    e.preventDefault()
    document.getElementById("attributes-section")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div
      className="rounded-2xl mb-3.5 overflow-hidden relative select-none"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${armorColor}1e 0%, #10121a 65%)`,
        border: `1px solid ${armorColor}30`,
      }}
    >
      <div className="px-5 pt-4 pb-5">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[2px]" style={{ color: armorColor }}>
            {totalKills > 0 ? `${totalKills} boss${totalKills !== 1 ? "es" : ""} slain 💀` : "Your Character"}
          </span>
          <button onClick={onShopOpen}
            className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(250,191,25,0.12)", color: "#fbbf24", border: "1px solid rgba(250,191,25,0.25)" }}>
            🪙 {gold.toLocaleString()}g · Gacha
          </button>
        </div>

        {/* ── Active buff ── */}
        {goldBoost > 1 && (
          <div className="flex gap-1.5 flex-wrap mb-2">
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md animate-pulse"
              style={{ background: "rgba(250,191,25,0.15)", color: "#fbbf24", border: "1px solid rgba(250,191,25,0.25)" }}>
              🪙 ×{goldBoost} GOLD BOOST
            </span>
          </div>
        )}

        {/* ── Centered sprite ── */}
        <div className="flex justify-center mt-2 mb-3">
          <HeroSprite armorColor={armorColor} anim="idle" weaponRarity={weaponItem?.rarity ?? null} />
        </div>

        {/* ── Terraria equipment slots (centered row) ── */}
        <div className="flex justify-center gap-3 mb-4">
          <GearSlot
            label="Weapon"
            icon={weaponItem?.icon}
            name={weaponItem?.name}
            color={weaponItem ? RARITY_COLOR[weaponItem.rarity] : undefined}
            empty={!weaponItem}
            onEmpty={onShopOpen}
            onUnequip={weaponItem ? () => equipGear("weapon", null) : undefined}
          />
          <GearSlot
            label="Helmet"
            icon={helmetItem?.icon}
            name={helmetItem?.name}
            color={helmetItem ? RARITY_COLOR[helmetItem.rarity] : undefined}
            empty={!helmetItem}
            onEmpty={onShopOpen}
            onUnequip={helmetItem ? () => equipGear("helmet", null) : undefined}
          />
          <GearSlot
            label="Armor"
            icon={armorItem?.icon}
            name={armorItem?.name}
            color={armorItem ? RARITY_COLOR[armorItem.rarity] : undefined}
            empty={!armorItem}
            onEmpty={onShopOpen}
            onUnequip={armorItem ? () => equipGear("armor", null) : undefined}
          />
          <GearSlot
            label="Ring"
            icon={ringItem?.icon}
            name={ringItem?.name}
            color={ringItem ? RARITY_COLOR[ringItem.rarity] : undefined}
            empty={!ringItem}
            onEmpty={onShopOpen}
            onUnequip={ringItem ? () => equipGear("ring", null) : undefined}
          />
        </div>

        {/* ── Attribute badges — all linked to Attributes section ── */}
        <div className="flex gap-2 flex-wrap mb-4">
          {STAT_DEFS.map(s => {
            const v = Math.round(stats[s.key as keyof typeof stats] || 0)
            return (
              <a
                key={s.key}
                href="#attributes-section"
                onClick={scrollToAttributes}
                className="flex flex-col items-center px-2.5 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-105 flex-1"
                style={{
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}2e`,
                  textDecoration: "none",
                  minWidth: 44,
                }}
              >
                <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: s.color }}>
                  {s.name}
                </span>
                <span className="text-sm font-extrabold tabular-nums" style={{ color: s.color }}>
                  {v}
                </span>
              </a>
            )
          })}
        </div>

        {/* ── Boss battle button ── */}
        <button
          onClick={onBossOpen}
          className="w-full py-2.5 rounded-xl font-extrabold text-sm tracking-wide transition-all"
          style={{
            background: currentBoss ? "rgba(239,68,68,0.15)" : "rgba(255,77,61,0.12)",
            color: "#ff4d3d",
            border: `1px solid ${currentBoss ? "rgba(239,68,68,0.4)" : "rgba(255,77,61,0.25)"}`,
            boxShadow: currentBoss ? "0 0 18px rgba(239,68,68,0.2)" : "none",
          }}
        >
          {currentBoss ? "⚔ Boss Fight in Progress — View Battle" : "⚔ Boss Battle"}
        </button>

        {currentBoss && <ActiveBossStatus currentBoss={currentBoss} />}
      </div>
    </div>
  )
}
