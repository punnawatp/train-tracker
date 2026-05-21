"use client"

import { useTrainStore } from "@/store/useTrainStore"
import { beltFor, comboMultiplier, dayStreak, levelProgress } from "@/lib/game-logic"

export default function Hero() {
  const data = useTrainStore(s => s.data)
  const prog = levelProgress(data.xp)
  const belt = beltFor(prog.level)
  const multi = comboMultiplier(data)
  const streak = dayStreak(data)

  const textColor = (belt.color === "#0a0a0a" || belt.color === "#b91c1c") ? "#fff" : "#000"

  return (
    <div
      className="rounded-2xl p-5 mb-3.5 grid gap-4 items-center"
      style={{
        background: "linear-gradient(135deg, #1b1f29, #14161c)",
        border: "1px solid #262a33",
        gridTemplateColumns: "auto 1fr auto",
      }}
    >
      {/* Belt badge */}
      <div
        className="w-20 h-20 rounded-[14px] relative flex items-center justify-center shrink-0"
        style={{
          background: belt.color,
          boxShadow: "0 6px 22px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(0,0,0,0.1)",
        }}
      >
        <span className="text-[26px] font-extrabold z-10" style={{ color: textColor, letterSpacing: "-1px" }}>
          {prog.level}
        </span>
        {belt.stripes > 0 && (
          <span
            className="absolute right-2 top-2 bottom-2 w-3 rounded"
            style={{ background: belt.stripe }}
          />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="text-[13px] font-bold uppercase tracking-[1.5px] text-gold">
          {belt.name}{belt.stripes > 0 ? " · " + "▮".repeat(belt.stripes) : ""}
        </div>
        <div className="text-xl font-bold mt-0.5 mb-2">
          Level {prog.level} · <span className="text-gold">{data.xp}</span> XP
        </div>
        <div className="h-3 bg-[#0a0b0e] rounded-lg overflow-hidden border border-line">
          <div
            className="h-full rounded-lg xpfill"
            style={{
              width: `${Math.min(100, prog.pct)}%`,
              background: "linear-gradient(90deg, #fbbf24, #ff8c3d)",
              boxShadow: "0 0 18px rgba(251,191,36,0.4)",
            }}
          />
        </div>
        <div className="text-xs text-muted mt-1">{prog.inLevel} / {prog.need} XP to Lvl {prog.level + 1}</div>
      </div>

      {/* Combo */}
      <div
        className="text-center px-3.5 py-2.5 rounded-xl min-w-24 shrink-0"
        style={{ background: "rgba(255,77,61,0.1)", border: "1px solid rgba(255,77,61,0.3)" }}
      >
        <div className="text-[22px] font-extrabold text-accent tracking-tight">{multi.toFixed(2)}×</div>
        <div className="text-[10px] text-muted uppercase tracking-wider">{streak}d streak</div>
      </div>
    </div>
  )
}
