"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { fmtTime, sessionVolume, todaySessions } from "@/lib/game-logic"

interface Props {
  onOpenGymModal: (sessId?: number) => void
}

export default function TodayLog({ onOpenGymModal }: Props) {
  const data = useTrainStore(s => s.data)
  const deleteSession = useTrainStore(s => s.deleteSession)
  const today = todaySessions(data.sessions)

  function actColor(type: string) {
    return data.activityTypes.find(a => a.id === type)?.color ?? "#ff4d3d"
  }

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Today&apos;s Log{" "}
        <span className="text-[11px] text-muted font-normal">{today.length} session{today.length !== 1 ? "s" : ""}</span>
      </h3>

      {today.length === 0 ? (
        <div className="py-6 text-center text-muted text-sm border border-dashed border-line rounded-xl">
          Nothing logged yet today. Tap a training button above to start.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {today.map(s => {
            const vol = sessionVolume(s)
            const color = actColor(s.type)
            const actName = data.activityTypes.find(a => a.id === s.type)?.name ?? s.type
            return (
              <div
                key={s.id}
                onClick={() => onOpenGymModal(s.id)}
                className="bg-panel2 border border-line rounded-xl p-3 cursor-pointer transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase" style={{ background: color + "26", color }}>{actName}</span>
                    <span className="text-muted text-sm">{fmtTime(s.ts)}</span>
                    <span className="text-accent text-xs font-bold">-{s.xpAwarded || 0} HP</span>
                    {vol > 0 && <span className="text-[11px] font-bold" style={{ color }}>{Math.round(vol).toLocaleString()}kg vol</span>}
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
