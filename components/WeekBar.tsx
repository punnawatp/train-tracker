"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { startOfWeek } from "@/lib/game-logic"

const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TYPE_COLORS: Record<string, string> = { gym: "#4cc9f0", bjj: "#b388ff", mma: "#ff7043" }

export default function WeekBar() {
  const sessions = useTrainStore(s => s.data.sessions)
  const start = startOfWeek()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  return (
    <div className="section mt-5">
      <h3 className="section-h">This week</h3>
      <div className="flex gap-1.5">
        {LABELS.map((lbl, i) => {
          const day = new Date(start); day.setDate(start.getDate() + i)
          const dayStart = day.getTime()
          const dayEnd = dayStart + 86400000
          const sess = sessions.filter(s => s.ts >= dayStart && s.ts < dayEnd)
          const isToday = day.getTime() === today.getTime()
          return (
            <div
              key={i}
              className={`flex-1 aspect-[1.2] rounded-lg flex flex-col items-center justify-center text-[11px] relative ${sess.length ? "text-tx" : "text-muted"}`}
              style={{
                background: sess.length ? "linear-gradient(135deg, #20242d, #2a2f3a)" : "#1c1f26",
                outline: isToday ? "2px solid #ff4d3d" : undefined,
              }}
            >
              <div>{lbl}</div>
              <div className="text-[13px] font-bold">{day.getDate()}</div>
              <div className="flex gap-0.5 mt-0.5">
                {sess.slice(0, 3).map((s, j) => (
                  <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[s.type] || "#ff4d3d" }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
