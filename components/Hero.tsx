"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { beltFor, comboMultiplier, countByType, dayStreak, levelProgress, thisWeekSessions } from "@/lib/game-logic"

function Ring({ pct, color, value, label, sub }: {
  pct: number; color: string; value: string; label: string; sub?: string
}) {
  const size = 96
  const sw = 8
  const r = (size - sw) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ

  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="absolute inset-0">
          <circle cx={c} cy={c} r={r} fill="none" stroke="#1a1d24" strokeWidth={sw} />
          <circle
            cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color}99)`, transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[17px] font-extrabold leading-none">{value}</span>
          {sub && <span className="text-[9px] text-muted leading-none">{sub}</span>}
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted text-center">{label} ›</div>
    </div>
  )
}

export default function Hero() {
  const data = useTrainStore(s => s.data)
  const prog = levelProgress(data.xp)
  const belt = beltFor(prog.level)
  const multi = comboMultiplier(data)
  const streak = dayStreak(data)

  const wk = thisWeekSessions(data.sessions)
  const c = countByType(wk)
  const withGoals = Object.entries(data.targets).filter(([, g]) => g > 0)
  const weekPct = withGoals.length === 0 ? 0
    : withGoals.reduce((acc, [type, goal]) => acc + Math.min(1, (c[type] || 0) / goal), 0) / withGoals.length * 100

  const streakColor = multi >= 2 ? "#4ade80" : multi >= 1.5 ? "#60a5fa" : multi >= 1.25 ? "#fbbf24" : "#6b7280"
  const streakPct = Math.min(100, (streak / 14) * 100)
  const beltTextColor = (belt.color === "#0a0a0a" || belt.color === "#b91c1c") ? "#fff" : "#000"

  return (
    <div
      className="rounded-2xl px-5 pt-5 pb-5 mb-3.5"
      style={{ background: "linear-gradient(135deg, #1b1f29, #14161c)", border: "1px solid #262a33" }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-7 h-7 rounded-[7px] flex items-center justify-center text-xs font-extrabold shrink-0"
          style={{ background: belt.color, color: beltTextColor }}
        >
          {prog.level}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gold uppercase tracking-[1px]">{belt.name}</span>
          {belt.stripes > 0 && <span className="text-gold text-[10px]">{"▮".repeat(belt.stripes)}</span>}
        </div>
        <div className="ml-auto text-[11px] text-muted">{prog.inLevel} / {prog.need} XP</div>
      </div>

      <div className="h-[3px] bg-[#0a0b0e] rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, prog.pct)}%`,
            background: "linear-gradient(90deg, #fbbf24, #ff8c3d)",
            boxShadow: "0 0 8px rgba(251,191,36,0.5)",
            transition: "width 0.6s ease",
          }}
        />
      </div>

      <div className="flex gap-2 justify-around">
        <Ring pct={prog.pct} color="#fbbf24" value={`${Math.round(prog.pct)}%`} label="Level" sub={`Lvl ${prog.level}`} />
        <Ring pct={weekPct} color="#4cc9f0" value={`${Math.round(weekPct)}%`} label="Week" sub={`${wk.length} sess`} />
        <Ring pct={streakPct} color={streakColor} value={`${streak}d`} label="Streak" sub={`×${multi.toFixed(2)}`} />
      </div>
    </div>
  )
}
