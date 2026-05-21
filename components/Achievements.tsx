"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { ACHIEVEMENTS } from "@/lib/constants"

export default function Achievements() {
  const unlocked = useTrainStore(s => s.data.unlocked)
  const count = Object.keys(unlocked).length

  return (
    <div className="section mt-5">
      <h3 className="section-h">Achievements ({count}/{ACHIEVEMENTS.length})</h3>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = !!unlocked[a.id]
          return (
            <div
              key={a.id}
              className={`bg-panel2 border rounded-xl p-3 text-center transition-all ${isUnlocked ? "" : "opacity-40 grayscale"}`}
              style={{
                borderColor: isUnlocked ? "rgba(251,191,36,0.4)" : "#262a33",
                boxShadow: isUnlocked ? "0 0 16px rgba(251,191,36,0.1)" : undefined,
              }}
            >
              <div className="text-[28px] leading-none">{a.icon}</div>
              <div className="text-xs font-bold mt-1.5">{a.name}</div>
              <div className="text-[11px] text-muted mt-0.5 min-h-7">{a.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
