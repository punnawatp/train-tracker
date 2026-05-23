"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"

import ToastStack from "@/components/ui/Toast"
import PRFlash from "@/components/ui/PRFlash"
import ConfettiCanvas from "@/components/ui/Confetti"

import CharacterCard from "@/components/CharacterCard"
import Quests from "@/components/Quests"
import LogRow from "@/components/LogRow"
import TodayLog from "@/components/TodayLog"
import Widgets from "@/components/Widgets"
import Attributes from "@/components/Attributes"
import MuscleBalance from "@/components/MuscleBalance"
import Bodyweight from "@/components/Bodyweight"
import Lifts from "@/components/Lifts"
import WeekBar from "@/components/WeekBar"
import Heatmap from "@/components/Heatmap"
import Stats from "@/components/Stats"
import History from "@/components/History"

import FriendsPage from "@/components/social/FriendsPage"
import GymModal from "@/components/modals/GymModal"
import LiftModal from "@/components/modals/LiftModal"
import AddLiftModal from "@/components/modals/AddLiftModal"
import WidgetModal from "@/components/modals/WidgetModal"
import SettingsModal from "@/components/modals/SettingsModal"
import ActivityModal from "@/components/modals/ActivityModal"
import ShopModal from "@/components/modals/ShopModal"
import BossModal from "@/components/modals/BossModal"
import GachaModal from "@/components/modals/GachaModal"

type Page = "character" | "training" | "progress" | "history" | "friends"

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: "character", icon: "⚔",  label: "Character" },
  { id: "training",  icon: "💪", label: "Training"  },
  { id: "progress",  icon: "📊", label: "Progress"  },
  { id: "history",   icon: "📜", label: "History"   },
  { id: "friends",   icon: "👥", label: "Friends"   },
]

export default function Dashboard() {
  const load       = useTrainStore(s => s.load)
  const loading    = useTrainStore(s => s.loading)
  const loadError  = useTrainStore(s => s.loadError)
  const saveError  = useTrainStore(s => s.saveError)
  const clearSaveError = useTrainStore(s => s.clearSaveError)
  const resetWeek  = useTrainStore(s => s.resetWeek)
  const gachaResult = useTrainStore(s => s.gachaResult)

  const [page, setPage] = useState<Page>("character")
  const [gymModal, setGymModal] = useState<{ open: boolean; activityId?: string; sessId?: number }>({ open: false })
  const [activityModal, setActivityModal] = useState<{ open: boolean; activityId?: string }>({ open: false })
  const [liftModal, setLiftModal] = useState<{ open: boolean; liftId: string | null }>({ open: false, liftId: null })
  const [addLiftModal, setAddLiftModal] = useState(false)
  const [widgetModal, setWidgetModal] = useState<{ open: boolean; editId?: string }>({ open: false })
  const [settingsModal, setSettingsModal] = useState(false)
  const [shopModal, setShopModal] = useState(false)
  const [bossModal, setBossModal] = useState(false)

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Loading your training data…</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-2xl mb-3">⚠️</div>
          <div className="font-bold mb-1">Failed to load data</div>
          <div className="text-muted text-sm mb-4">{loadError}</div>
          <button
            onClick={() => { useTrainStore.getState().load() }}
            className="btn-secondary px-6"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastStack />
      <PRFlash />
      <ConfettiCanvas />

      {saveError && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold"
          style={{ background: "#7f1d1d", borderBottom: "1px solid #991b1b" }}>
          <span>⚠ Save failed — check your connection. Changes may not be persisted. <span className="font-normal opacity-75">{saveError}</span></span>
          <button onClick={clearSaveError} className="opacity-75 hover:opacity-100 flex-shrink-0">✕</button>
        </div>
      )}

      <GymModal open={gymModal.open} activityId={gymModal.activityId} sessId={gymModal.sessId} onClose={() => setGymModal({ open: false })} />
      <ActivityModal open={activityModal.open} activityId={activityModal.activityId} onClose={() => setActivityModal({ open: false })} />
      <LiftModal open={liftModal.open} liftId={liftModal.liftId} onClose={() => setLiftModal({ open: false, liftId: null })} />
      <AddLiftModal open={addLiftModal} onClose={() => setAddLiftModal(false)} />
      <WidgetModal open={widgetModal.open} editId={widgetModal.editId} onClose={() => setWidgetModal({ open: false })} />
      <SettingsModal open={settingsModal} onClose={() => setSettingsModal(false)} />
      <ShopModal open={shopModal} onClose={() => setShopModal(false)} />
      <BossModal open={bossModal} onClose={() => setBossModal(false)} />
      <GachaModal result={gachaResult} />

      <div className="flex min-h-screen">

        {/* ── Sidebar (desktop) ──────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[200px] z-50"
          style={{ background: "var(--color-panel)", borderRight: "1px solid var(--color-line)" }}>

          {/* Logo */}
          <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--color-line)" }}>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_14px_#ff4d3d] flex-shrink-0" />
              <span className="text-[17px] font-bold tracking-tight">Train</span>
            </div>
            <div className="text-muted text-[10px] mt-0.5">
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: page === n.id ? "rgba(255,77,61,0.12)" : "transparent",
                  color: page === n.id ? "#ff4d3d" : "var(--color-muted)",
                  border: page === n.id ? "1px solid rgba(255,77,61,0.25)" : "1px solid transparent",
                  fontWeight: page === n.id ? 700 : 500,
                }}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                <span className="text-sm">{n.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-3 py-4 flex flex-col gap-1" style={{ borderTop: "1px solid var(--color-line)" }}>
            <button
              onClick={() => setSettingsModal(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ color: "var(--color-muted)", border: "1px solid transparent" }}
            >
              <span style={{ fontSize: 16 }}>⚙</span>
              <span className="text-sm">Settings</span>
            </button>
            <button
              onClick={() => { if (confirm("Clear this week's logged sessions?")) resetWeek() }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ color: "var(--color-muted)", border: "1px solid transparent" }}
            >
              <span style={{ fontSize: 16 }}>🔄</span>
              <span className="text-sm">Reset week</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────── */}
        <main className="flex-1 md:ml-[200px] overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-[760px] mx-auto px-4 py-6">

            {page === "character" && (
              <>
                <SectionHeader title="Character" sub="Your hero, gear & boss battles" />
                <CharacterCard onShopOpen={() => setShopModal(true)} onBossOpen={() => setBossModal(true)} />
              </>
            )}

            {page === "training" && (
              <>
                <SectionHeader title="Training" sub="Log sessions and complete quests" />
                <LogRow
                  onOpenExerciseModal={(actId) => setGymModal({ open: true, activityId: actId })}
                  onOpenActivityModal={(actId?: string) => setActivityModal({ open: true, activityId: actId })}
                />
                <Quests />
                <TodayLog onOpenGymModal={(id) => setGymModal({ open: true, sessId: id })} />
                <WeekBar />
              </>
            )}

            {page === "progress" && (
              <>
                <SectionHeader title="Progress" sub="Attributes, body stats & heatmap" />
                <Attributes />
                <MuscleBalance />
                <Bodyweight />
                <Heatmap />
                <Stats />
                <Widgets onOpenWidgetModal={(id) => setWidgetModal({ open: true, editId: id })} />
              </>
            )}

            {page === "history" && (
              <>
                <SectionHeader title="History" sub="Past sessions & strength goals" />
                <History onOpenGymModal={(id) => setGymModal({ open: true, sessId: id })} />
                <Lifts
                  onOpenAddLift={() => setAddLiftModal(true)}
                  onOpenLift={(id) => setLiftModal({ open: true, liftId: id })}
                />
              </>
            )}

            {page === "friends" && (
              <>
                <SectionHeader title="Friends" sub="Connect and compare with friends" />
                <FriendsPage />
              </>
            )}

          </div>
        </main>

        {/* ── Bottom tab bar (mobile) ────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
          style={{ background: "var(--color-panel)", borderTop: "1px solid var(--color-line)" }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all"
              style={{ color: page === n.id ? "#ff4d3d" : "var(--color-muted)" }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span className="text-[9px] font-bold tracking-wide">{n.label}</span>
            </button>
          ))}
          <button
            onClick={() => setSettingsModal(true)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5"
            style={{ color: "var(--color-muted)" }}
          >
            <span style={{ fontSize: 18 }}>⚙</span>
            <span className="text-[9px] font-bold tracking-wide">Settings</span>
          </button>
        </nav>

      </div>
    </>
  )
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted text-xs mt-0.5">{sub}</p>
    </div>
  )
}
