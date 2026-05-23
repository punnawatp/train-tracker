"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { fmtDate, fmtTime, sessionVolume } from "@/lib/game-logic"

interface Props {
  onOpenGymModal: (sessId: number) => void
}

export default function History({ onOpenGymModal }: Props) {
  const sessions = useTrainStore(s => s.data.sessions)
  const activityTypes = useTrainStore(s => s.data.activityTypes)
  const deleteSession = useTrainStore(s => s.deleteSession)

  function actColor(type: string) {
    return activityTypes.find(a => a.id === type)?.color ?? "#ff4d3d"
  }

  function actName(type: string) {
    return activityTypes.find(a => a.id === type)?.name ?? type
  }

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Recent sessions <span className="text-[11px] text-muted font-normal">click any to edit</span>
      </h3>
      {sessions.length === 0 ? (
        <div className="text-muted text-sm text-center py-5">No sessions yet. Log a session to earn coins.</div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
          {sessions.slice(0, 30).map(s => {
            const vol = sessionVolume(s)
            const color = actColor(s.type)
            return (
              <div
                key={s.id}
                onClick={() => onOpenGymModal(s.id)}
                className="flex flex-col p-2.5 bg-panel2 rounded-lg text-sm cursor-pointer transition hover:bg-[#232831]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase" style={{ background: color + "26", color }}>{actName(s.type)}</span>
                    <span>{fmtDate(s.ts)} · <span className="text-muted">{fmtTime(s.ts)}</span></span>
                    {(s.coinsEarned || 0) > 0 && <span className="text-gold text-xs font-bold">+{s.coinsEarned}🪙</span>}
                    {vol > 0 && <span className="text-[11px] font-bold" style={{ color }}>{Math.round(vol).toLocaleString()} kg vol</span>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm("Delete this session?")) deleteSession(s.id) }}
                    className="text-muted hover:text-accent text-base px-1.5 rounded"
                  >×</button>
                </div>
                {s.exercises && s.exercises.length > 0 && (
                  <div className="mt-1.5 text-muted text-xs">
                    {s.exercises.map((e, i) => (
                      <span key={i} className="mr-3"><strong className="text-tx">{e.name}</strong> {e.weight || 0}kg × {e.reps || 0} × {e.sets || 0}</span>
                    ))}
                    {s.note && <div className="mt-1">📝 {s.note}</div>}
                  </div>
                )}
                {(!s.exercises || s.exercises.length === 0) && s.note && (
                  <div className="mt-1.5 text-xs text-muted">📝 {s.note}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
