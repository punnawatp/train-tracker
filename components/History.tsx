"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { fmtDate, fmtTime, sessionVolume } from "@/lib/game-logic"

interface Props {
  onOpenGymModal: (sessId: number) => void
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  gym: { bg: "rgba(76,201,240,0.15)",  color: "#4cc9f0" },
  bjj: { bg: "rgba(179,136,255,0.15)", color: "#b388ff" },
  mma: { bg: "rgba(255,112,67,0.15)",  color: "#ff7043" },
}

export default function History({ onOpenGymModal }: Props) {
  const sessions = useTrainStore(s => s.data.sessions)
  const deleteSession = useTrainStore(s => s.deleteSession)

  return (
    <div className="section mt-5">
      <h3 className="section-h">
        Recent sessions <span className="text-[11px] text-muted font-normal">click any to edit</span>
      </h3>
      {sessions.length === 0 ? (
        <div className="text-muted text-sm text-center py-5">No sessions yet. Tap a log button to earn XP.</div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
          {sessions.slice(0, 30).map(s => {
            const vol = sessionVolume(s)
            const tc = TAG_COLORS[s.type] || { bg: "rgba(255,77,61,0.15)", color: "#ff4d3d" }
            return (
              <div
                key={s.id}
                onClick={() => onOpenGymModal(s.id)}
                className="flex flex-col p-2.5 bg-panel2 rounded-lg text-sm cursor-pointer transition hover:bg-[#232831]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase" style={tc}>{s.type.toUpperCase()}</span>
                    <span>{fmtDate(s.ts)} · <span className="text-muted">{fmtTime(s.ts)}</span></span>
                    <span className="text-gold text-xs font-bold">+{s.xpAwarded || 0} XP</span>
                    {vol > 0 && <span className="text-gym text-[11px] font-bold">{Math.round(vol).toLocaleString()} kg vol</span>}
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
