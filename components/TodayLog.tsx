"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { fmtTime, sessionVolume, todaySessions } from "@/lib/game-logic"

interface Props {
  onOpenGymModal: (sessId?: number) => void
}

const TAG_COLORS: Record<string, string> = {
  gym: "rgba(76,201,240,0.15):#4cc9f0",
  bjj: "rgba(179,136,255,0.15):#b388ff",
  mma: "rgba(255,112,67,0.15):#ff7043",
}

export default function TodayLog({ onOpenGymModal }: Props) {
  const data = useTrainStore(s => s.data)
  const deleteSession = useTrainStore(s => s.deleteSession)
  const today = todaySessions(data.sessions)

  const todayGym = today.find(s => s.type === "gym")

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Today&apos;s Log{" "}
        <span className="text-[11px] text-muted font-normal">{today.length} session{today.length !== 1 ? "s" : ""}</span>
        <span className="ml-auto">
          {todayGym ? (
            <button onClick={() => onOpenGymModal(todayGym.id)} className="mini-btn solid">+ Add to today&apos;s gym</button>
          ) : (
            <button onClick={() => onOpenGymModal()} className="mini-btn solid">+ Log Gym</button>
          )}
        </span>
      </h3>

      {today.length === 0 ? (
        <div className="py-6 text-center text-muted text-sm border border-dashed border-line rounded-xl">
          Nothing logged yet today. Tap a training button above to start.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {today.map(s => {
            const vol = sessionVolume(s)
            const [bg, color] = (TAG_COLORS[s.type] || "rgba(255,77,61,0.15):#ff4d3d").split(":")
            return (
              <div
                key={s.id}
                onClick={() => onOpenGymModal(s.id)}
                className="bg-panel2 border border-line rounded-xl p-3 cursor-pointer transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase" style={{ background: bg, color }}>{s.type.toUpperCase()}</span>
                    <span className="text-muted text-sm">{fmtTime(s.ts)}</span>
                    <span className="text-gold text-xs font-bold">+{s.xpAwarded || 0} XP</span>
                    {vol > 0 && <span className="text-gym text-[11px] font-bold">{Math.round(vol).toLocaleString()}kg vol</span>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm("Delete this session?")) deleteSession(s.id) }}
                    className="text-muted hover:text-accent text-base px-1.5 py-0.5 rounded"
                  >×</button>
                </div>
                {s.exercises && s.exercises.length > 0 ? (
                  <div className="mt-2 text-muted text-xs leading-relaxed">
                    {s.exercises.map((e, i) => (
                      <span key={i} className="mr-3"><strong className="text-tx">{e.name}</strong> {e.weight || 0}kg × {e.reps || 0} × {e.sets || 0}</span>
                    ))}
                    {s.note && <div className="mt-1">📝 {s.note}</div>}
                  </div>
                ) : s.note ? (
                  <div className="mt-2 text-xs text-muted">📝 {s.note}</div>
                ) : (
                  <div className="mt-2 text-xs text-muted">No exercises logged. Click to add.</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
