"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { prCount, weekVolume } from "@/lib/game-logic"

export default function Stats() {
  const data = useTrainStore(s => s.data)

  return (
    <div className="section mt-5">
      <h3 className="section-h">Stats</h3>
      <div className="flex gap-3.5 flex-wrap">
        {[
          { label: "Weekly goal streak", value: (data.weeksGoalsHit || 0) + " 🔥" },
          { label: "Total sessions", value: String(data.sessions.length) },
          { label: "PRs hit", value: String(prCount(data)) },
          { label: "Volume this week", value: Math.round(weekVolume(data.sessions)).toLocaleString() + " kg" },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 min-w-32">
            <div className="text-sm text-muted">{label}</div>
            <div className="text-[22px] font-bold mt-0.5">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
