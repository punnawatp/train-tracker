"use client"

import { useEffect, useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"

import ToastStack from "@/components/ui/Toast"
import PRFlash from "@/components/ui/PRFlash"
import LevelUp from "@/components/ui/LevelUp"
import ConfettiCanvas from "@/components/ui/Confetti"

import Hero from "@/components/Hero"
import Quests from "@/components/Quests"
import TrainingCards from "@/components/TrainingCards"
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

import GymModal from "@/components/modals/GymModal"
import LiftModal from "@/components/modals/LiftModal"
import AddLiftModal from "@/components/modals/AddLiftModal"
import WidgetModal from "@/components/modals/WidgetModal"
import SettingsModal from "@/components/modals/SettingsModal"
import ActivityModal from "@/components/modals/ActivityModal"

export default function Dashboard() {
  const load = useTrainStore(s => s.load)
  const loading = useTrainStore(s => s.loading)
  const sections = useTrainStore(s => s.data.ui.sectionsVisible)
  const resetWeek = useTrainStore(s => s.resetWeek)

  const [gymModal, setGymModal] = useState<{ open: boolean; activityId?: string; sessId?: number }>({ open: false })
  const [activityModal, setActivityModal] = useState<{ open: boolean; activityId?: string }>({ open: false })
  const [liftModal, setLiftModal] = useState<{ open: boolean; liftId: string | null }>({ open: false, liftId: null })
  const [addLiftModal, setAddLiftModal] = useState(false)
  const [widgetModal, setWidgetModal] = useState<{ open: boolean; editId?: string }>({ open: false })
  const [settingsModal, setSettingsModal] = useState(false)

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Loading your training data…</div>
      </div>
    )
  }

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })

  return (
    <>
      <ToastStack />
      <PRFlash />
      <LevelUp />
      <ConfettiCanvas />

      <GymModal
        open={gymModal.open}
        activityId={gymModal.activityId}
        sessId={gymModal.sessId}
        onClose={() => setGymModal({ open: false })}
      />
      <ActivityModal
        open={activityModal.open}
        activityId={activityModal.activityId}
        onClose={() => setActivityModal({ open: false })}
      />
      <LiftModal open={liftModal.open} liftId={liftModal.liftId} onClose={() => setLiftModal({ open: false, liftId: null })} />
      <AddLiftModal open={addLiftModal} onClose={() => setAddLiftModal(false)} />
      <WidgetModal open={widgetModal.open} editId={widgetModal.editId} onClose={() => setWidgetModal({ open: false })} />
      <SettingsModal open={settingsModal} onClose={() => setSettingsModal(false)} />

      <div className="max-w-[980px] mx-auto px-5 py-6 pb-20">
        <header className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_14px_#ff4d3d]" />
              Train
            </h1>
            <div className="text-muted text-sm mt-0.5">{dateLabel}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSettingsModal(true)} className="reset-btn">⚙ Settings</button>
            <button onClick={() => { if (confirm("Clear this week's logged sessions? (XP & PRs preserved.)")) resetWeek() }} className="reset-btn">Reset week</button>
          </div>
        </header>

        {sections.hero       && <Hero />}
        {sections.quests     && <Quests />}
        {sections.training   && (
          <div className="mb-5">
            <TrainingCards
              onOpenExerciseModal={(actId) => setGymModal({ open: true, activityId: actId })}
              onOpenActivityModal={(actId) => setActivityModal({ open: true, activityId: actId })}
            />
          </div>
        )}
        {sections.todayLog   && <TodayLog onOpenGymModal={(id) => setGymModal({ open: true, sessId: id })} />}
        {sections.widgets    && <Widgets onOpenWidgetModal={(id) => setWidgetModal({ open: true, editId: id })} />}
        {sections.attributes    && <Attributes />}
        {sections.muscleBalance && <MuscleBalance />}
        {sections.bodyweight    && <Bodyweight />}
        {sections.lifts      && (
          <Lifts
            onOpenAddLift={() => setAddLiftModal(true)}
            onOpenLift={(id) => setLiftModal({ open: true, liftId: id })}
          />
        )}
        {sections.thisWeek   && <WeekBar />}
        {sections.heatmap    && <Heatmap />}
        {sections.stats      && <Stats />}
        {sections.history    && <History onOpenGymModal={(id) => setGymModal({ open: true, sessId: id })} />}

        <footer className="text-center mt-8 text-muted text-xs">Your data lives in the cloud. You&apos;re the admin — bend it to your will.</footer>
      </div>
    </>
  )
}
