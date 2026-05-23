"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { GACHA_GEAR, STAT_DEFS, STRENGTH_LEVELS } from "@/lib/constants"
import { est1RM } from "@/lib/game-logic"
import type { AppState } from "@/lib/types"
import type { PublicProfile } from "@/lib/social"
import { searchByUsername, fetchFriendData, resolveBatch } from "@/lib/social"

// ── Color helpers (local) ──────────────────────────────────────────────────────
function darken(hex: string, amt: number) {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amt)))
    const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amt)))
    const b = Math.max(0, Math.round((n & 0xff) * (1 - amt)))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}
function lighten(hex: string, amt: number) {
  try {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * amt))
    const g = Math.min(255, Math.round(((n >> 8) & 0xff)  + (255 - ((n >> 8) & 0xff))  * amt))
    const b = Math.min(255, Math.round((n & 0xff)          + (255 - (n & 0xff))          * amt))
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`
  } catch { return hex }
}

const RARITY_ARMOR: Record<string, string> = {
  common: "#94a3b8", rare: "#4ade80", epic: "#b388ff", legendary: "#ffa500",
}
const RARITY_COLOR: Record<string, string> = {
  common: "#94a3b8", rare: "#4ade80", epic: "#b388ff", legendary: "#ffd700",
}

// ── Mini hero sprite (PX=4) ───────────────────────────────────────────────────
const PX = 4

function buildMiniSprite(armorColor: string): (string | null)[][] {
  const _ = null
  const K = "#0a0a0f"
  const SK = "#f0a040", SKm = "#c07820", SKd = "#904808"
  const RG = "#ff2828"
  const TL = "#38d8c8"
  const WH = "#d8e8f8", Wm = "#9baabb", wh = "#607080"
  const GD = "#ffd020", gd = "#b09000"
  const DK = "#1a2430", Dk = "#283448"
  const Hl = lighten(armorColor, 0.65)
  const H4 = lighten(armorColor, 0.38)
  const H3 = armorColor
  const H2 = darken(armorColor, 0.28)
  const H1 = darken(armorColor, 0.55)
  void H1
  return [
    [_,_,_,_,_,K,Hl,H4,H3,H2,H3,H4,Hl,K,_,_,_,_,_,_],
    [_,_,_,_,K,H4,Hl,H4,H3,H3,H3,H4,Hl,H4,K,_,_,_,_,_],
    [_,_,_,K,H3,H4,H4,H4,RG,RG,H4,H4,H4,H3,K,_,_,_,_,_],
    [_,_,_,K,H2,H3,H4,SK,SK,SK,SK,H4,H3,H2,K,_,_,_,_,_],
    [_,_,K,H2,H3,SKm,SKm,SK,SK,SK,SK,SKm,SKm,H3,H2,K,_,_,_,_],
    [_,_,K,H2,H3,SK,K,SK,SK,SK,K,SK,H3,H2,K,_,_,_,_,_],
    [_,_,_,K,H3,SK,SKm,SKd,SKd,SKd,SKm,SK,H3,K,_,_,_,_,_],
    [_,_,_,K,wh,WH,Wm,wh,wh,wh,wh,Wm,WH,wh,K,_,_,_,_,_],
    [K,H4,H3,K,H3,H4,Hl,H4,H3,H3,H4,Hl,H4,K,H3,H4,H3,H2,K,_],
    [K,H3,H4,K,WH,H3,H4,H4,H3,H3,H4,H4,H3,WH,K,H2,H4,H3,K,_],
    [K,H2,H3,K,H3,H4,Hl,TL,H4,H4,TL,Hl,H4,H3,K,H3,H3,H2,K,_],
    [K,wh,WH,K,H3,H3,H4,H4,Hl,Hl,H4,H4,H3,H3,K,wh,WH,wh,K,_],
    [_,K,WH,WH,K,GD,gd,H2,H3,H3,H2,gd,GD,K,WH,WH,K,_,_,_],
    [_,K,H2,H3,H3,H2,H3,H4,H3,H3,H4,H3,H2,H3,H3,H2,K,_,_,_],
    [_,_,K,H2,H3,H4,H3,H2,H2,H2,H2,H3,H4,H3,H2,K,_,_,_,_],
    [_,_,K,H2,H3,H2,K,_,_,_,_,K,H2,H3,H2,K,_,_,_,_],
    [_,_,K,Dk,DK,Dk,K,_,_,_,_,K,Dk,DK,Dk,K,_,_,_,_],
    [_,K,H3,H4,Hl,H4,H3,K,_,_,K,H3,H4,Hl,H4,H3,K,_,_,_],
    [_,_,K,DK,Dk,DK,K,_,_,_,_,K,DK,Dk,DK,K,_,_,_,_],
    [_,_,K,Dk,DK,Dk,K,_,_,_,_,K,Dk,DK,Dk,K,_,_,_,_],
    [_,K,H2,H3,H3,H3,H2,K,_,_,K,H2,H3,H3,H3,H2,K,_,_,_],
    [_,K,DK,H2,H3,H2,DK,K,_,_,K,DK,H2,H3,H2,DK,K,_,_,_],
    [_,K,DK,DK,DK,DK,DK,K,_,_,K,DK,DK,DK,DK,DK,K,_,_,_],
  ]
}

function MiniSprite({ armorColor }: { armorColor: string }) {
  const rows = buildMiniSprite(armorColor)
  return (
    <div style={{ imageRendering: "pixelated", display: "inline-block" }}>
      {rows.map((row, y) => (
        <div key={y} style={{ display: "flex", height: PX }}>
          {row.map((px, x) => (
            <div key={x} style={{ width: PX, height: PX, background: px ?? "transparent", flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Friend profile modal ───────────────────────────────────────────────────────
function FriendProfileModal({
  profile, data: fd, myData,
  onClose, onRemove,
}: {
  profile: PublicProfile
  data: AppState
  myData: AppState
  onClose: () => void
  onRemove: () => void
}) {
  const rarityOrder = ["legendary", "epic", "rare", "common"]
  const friendEquipped = fd.equipped || { weapon: null, helmet: null, armor: null, ring: null }
  const friendGear = fd.gear || {}

  const friendWeapon = GACHA_GEAR.find(g => g.id === friendEquipped.weapon)
  const friendHelmet = GACHA_GEAR.find(g => g.id === friendEquipped.helmet)
  const friendArmor  = GACHA_GEAR.find(g => g.id === friendEquipped.armor)
  const friendRing   = GACHA_GEAR.find(g => g.id === friendEquipped.ring)

  const ownedByFriend = GACHA_GEAR.filter(g => (friendGear[g.id] || 0) > 0)
  const equippedRarity = friendArmor?.rarity ?? friendWeapon?.rarity
  const bestRarity = equippedRarity ?? rarityOrder.find(r => ownedByFriend.some(g => g.rarity === r))
  const armorColor = bestRarity ? RARITY_ARMOR[bestRarity] : "#4cc9f0"

  // Top PRs
  const topPRs = [...(fd.lifts || [])]
    .filter(l => (l.current || 0) > 0)
    .sort((a, b) => (b.current || 0) - (a.current || 0))
    .slice(0, 5)

  // My stats for comparison
  const myStats = myData.stats

  function StatBar({ label, color, myVal, theirVal }: { label: string; color: string; myVal: number; theirVal: number }) {
    const max = Math.max(myVal, theirVal, 10)
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
          <span className="text-[10px] text-muted">{Math.round(theirVal)} vs {Math.round(myVal)} (you)</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "#0a0b0e" }}>
          {/* Mine (behind, muted) */}
          <div className="absolute inset-0 flex items-center">
            <div style={{ width: `${(myVal / max) * 100}%`, height: "100%", background: color + "33", borderRadius: 9999 }} />
          </div>
          {/* Theirs (front, full color) */}
          <div className="absolute inset-0 flex items-center">
            <div style={{ width: `${(theirVal / max) * 100}%`, height: "50%", background: color, borderRadius: 9999, marginTop: "auto" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-bg show" style={{ zIndex: 300 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-extrabold">@{profile.username}</div>
            <div className="text-[11px] text-muted mt-0.5">{(fd.sessions || []).length} sessions · {(fd.gold || 0).toLocaleString()}🪙</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm(`Remove @${profile.username} from friends?`)) { onRemove(); onClose() } }}
              className="text-[10px] px-2.5 py-1 rounded-lg font-bold"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
              Remove
            </button>
            <button onClick={onClose} className="text-muted text-sm px-2">✕</button>
          </div>
        </div>

        {/* Character + gear */}
        <div className="flex gap-4 mb-4 p-3 rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${armorColor}18 0%, #10121a 70%)`, border: `1px solid ${armorColor}28` }}>
          <div className="flex items-center justify-center" style={{ minWidth: 90 }}>
            <div className="hero-idle">
              <MiniSprite armorColor={armorColor} />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-muted mb-2">Equipment</div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Weapon", item: friendWeapon },
                { label: "Helmet", item: friendHelmet },
                { label: "Armor",  item: friendArmor  },
                { label: "Ring",   item: friendRing   },
              ].map(({ label, item }) => {
                const color = item ? RARITY_COLOR[item.rarity] : "#2a2d36"
                return (
                  <div key={label} className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                    style={{ background: item ? `${color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${color}30` }}>
                    <span style={{ fontSize: 14 }}>{item ? item.icon : "—"}</span>
                    <div>
                      <div className="text-[8px] text-muted leading-none">{label}</div>
                      <div className="text-[10px] font-bold leading-tight" style={{ color: item ? color : "#3a3d46" }}>
                        {item ? item.name : "Empty"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats comparison */}
        <div className="mb-4">
          <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-muted mb-2">
            Attributes — <span style={{ color: "#6b7280" }}>solid = theirs · faded = yours</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {STAT_DEFS.map(s => (
              <StatBar
                key={s.key}
                label={s.label}
                color={s.color}
                myVal={myStats[s.key as keyof typeof myStats] || 0}
                theirVal={(fd.stats || {})[s.key as keyof typeof fd.stats] || 0}
              />
            ))}
          </div>
        </div>

        {/* Top PRs */}
        {topPRs.length > 0 && (
          <div className="mb-4">
            <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-muted mb-2">Top PRs</div>
            <div className="flex flex-col gap-1">
              {topPRs.map(lift => {
                const best1RM = lift.history.reduce((b, h) => Math.max(b, est1RM(h.weight, h.reps)), lift.current || 0)
                return (
                  <div key={lift.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-sm font-bold">{lift.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-extrabold" style={{ color: "#fbbf24" }}>{lift.current} kg</span>
                      {best1RM > lift.current && (
                        <span className="text-[10px] text-muted ml-1.5">~{Math.round(best1RM)}kg 1RM</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button className="btn-secondary w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── Strength level badge ───────────────────────────────────────────────────────
function RarityDot({ rarity }: { rarity?: string }) {
  if (!rarity) return null
  return <span style={{ color: RARITY_COLOR[rarity], fontSize: 8 }}>⬥</span>
}

// ── Main FriendsPage ──────────────────────────────────────────────────────────
export default function FriendsPage() {
  const username     = useTrainStore(s => s.username)
  const myData       = useTrainStore(s => s.data)
  const setUsername  = useTrainStore(s => s.setUsername)
  const addFriend    = useTrainStore(s => s.addFriend)
  const removeFriend = useTrainStore(s => s.removeFriend)
  const friendIds    = myData.friends || []

  const [nameInput, setNameInput]       = useState("")
  const [nameError, setNameError]       = useState<string | null>(null)
  const [nameSaving, setNameSaving]     = useState(false)
  const [editing, setEditing]           = useState(false)

  const [searchQ, setSearchQ]           = useState("")
  const [results, setResults]           = useState<PublicProfile[]>([])
  const [searching, setSearching]       = useState(false)

  const [friendProfiles, setFriendProfiles] = useState<PublicProfile[]>([])
  const [viewing, setViewing]           = useState<{ profile: PublicProfile; data: AppState } | null>(null)
  const [loadingView, setLoadingView]   = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load friend usernames on mount / when friendIds change
  useEffect(() => {
    if (!friendIds.length) { setFriendProfiles([]); return }
    resolveBatch(friendIds).then(setFriendProfiles)
  }, [friendIds.join(",")])  // eslint-disable-line

  // Debounced username search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQ.trim().length < 2) { setResults([]); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const res = await searchByUsername(searchQ)
      // Exclude self and existing friends
      setResults(res.filter(r => !friendIds.includes(r.user_id)))
      setSearching(false)
    }, 400)
  }, [searchQ])  // eslint-disable-line

  const handleSaveName = useCallback(async () => {
    if (!nameInput.trim()) return
    setNameSaving(true)
    setNameError(null)
    const { error } = await setUsername(nameInput.trim())
    setNameSaving(false)
    if (error) { setNameError(error); return }
    setEditing(false)
    setNameInput("")
  }, [nameInput, setUsername])

  const handleViewFriend = useCallback(async (profile: PublicProfile) => {
    setLoadingView(profile.user_id)
    const data = await fetchFriendData(profile.user_id)
    setLoadingView(null)
    if (data) setViewing({ profile, data })
  }, [])

  const handleAddFriend = useCallback((profile: PublicProfile) => {
    addFriend(profile.user_id)
    setFriendProfiles(prev => prev.some(p => p.user_id === profile.user_id) ? prev : [...prev, profile])
    setResults(prev => prev.filter(r => r.user_id !== profile.user_id))
    setSearchQ("")
  }, [addFriend])

  const handleRemoveFriend = useCallback((userId: string) => {
    removeFriend(userId)
    setFriendProfiles(prev => prev.filter(p => p.user_id !== userId))
  }, [removeFriend])

  return (
    <>
      {viewing && (
        <FriendProfileModal
          profile={viewing.profile}
          data={viewing.data}
          myData={myData}
          onClose={() => setViewing(null)}
          onRemove={() => handleRemoveFriend(viewing.profile.user_id)}
        />
      )}

      {/* ── Username section ── */}
      <div className="section mb-4">
        {username && !editing ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-muted mb-0.5">Your Username</div>
              <div className="text-lg font-extrabold">@{username}</div>
              <div className="text-[11px] text-muted mt-0.5">Share your username so friends can find you</div>
            </div>
            <button onClick={() => { setEditing(true); setNameInput(username) }}
              className="text-[11px] px-3 py-1.5 rounded-lg font-bold"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--color-muted)", border: "1px solid var(--color-line)" }}>
              Change
            </button>
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[2px] text-muted mb-2">
              {username ? "Change Username" : "Set Your Username"}
            </div>
            <p className="text-[11px] text-muted mb-3">
              Choose a username so friends can find and add you. Letters, numbers, underscores · 3–20 chars.
            </p>
            <div className="flex gap-2">
              <input
                className="modal-input flex-1"
                placeholder="e.g. iron_will99"
                value={nameInput}
                onChange={e => setNameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                maxLength={20}
              />
              <button
                onClick={handleSaveName}
                disabled={nameSaving || nameInput.trim().length < 3}
                className="btn-primary"
                style={{ opacity: nameInput.trim().length < 3 ? 0.5 : 1 }}>
                {nameSaving ? "Saving…" : "Save"}
              </button>
              {editing && (
                <button onClick={() => { setEditing(false); setNameError(null) }} className="btn-ghost">Cancel</button>
              )}
            </div>
            {nameError && <p className="text-[11px] mt-2" style={{ color: "#ef4444" }}>{nameError}</p>}
          </div>
        )}
      </div>

      {/* ── Find friends ── */}
      <div className="section mb-4">
        <h3 className="section-h">Find Friends</h3>
        <input
          className="modal-input mb-3"
          placeholder="Search by username…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />

        {searching && <div className="text-[11px] text-muted text-center py-2">Searching…</div>}

        {!searching && results.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {results.map(r => (
              <div key={r.user_id} className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="font-bold text-sm">@{r.username}</span>
                <button
                  onClick={() => handleAddFriend(r)}
                  className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}

        {!searching && searchQ.trim().length >= 2 && results.length === 0 && (
          <div className="text-[11px] text-muted text-center py-2">No users found</div>
        )}
      </div>

      {/* ── Friends list ── */}
      <div className="section">
        <h3 className="section-h">Friends ({friendProfiles.length})</h3>

        {friendProfiles.length === 0 ? (
          <div className="py-6 text-center text-muted text-sm border border-dashed rounded-xl" style={{ borderColor: "var(--color-line)" }}>
            No friends yet — search by username above to add someone
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {friendProfiles.map(fp => {
              const isLoading = loadingView === fp.user_id
              return (
                <div key={fp.user_id} className="flex items-center justify-between rounded-xl px-3 py-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm"
                      style={{ background: "rgba(255,77,61,0.15)", color: "#ff4d3d" }}>
                      {fp.username[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-sm">@{fp.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewFriend(fp)}
                      disabled={isLoading}
                      className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-muted)", border: "1px solid var(--color-line)" }}>
                      {isLoading ? "Loading…" : "View Profile"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
