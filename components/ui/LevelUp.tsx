"use client"

import { useTrainStore } from "@/store/useTrainStore"

export default function LevelUp() {
  const levelUpInfo = useTrainStore(s => s.levelUpInfo)
  const close = useTrainStore(s => s.closeLevelUp)

  if (!levelUpInfo) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[250]" style={{ animation: "bgIn 0.3s ease" }}>
      <div
        className="rounded-[20px] p-8 text-center max-w-xs"
        style={{
          background: "linear-gradient(135deg, #1f2330, #14161c)",
          border: "2px solid #fbbf24",
          boxShadow: "0 0 60px rgba(251,191,36,0.4)",
          animation: "popIn 0.5s cubic-bezier(.2,.9,.4,1.3)",
        }}
      >
        <h2 className="text-gold text-sm font-bold tracking-[3px]">LEVEL UP</h2>
        <div className="text-[56px] font-extrabold my-2 tracking-tight">{levelUpInfo.level}</div>
        <div className="text-lg mb-3">
          {levelUpInfo.beltName}{levelUpInfo.stripes > 0 ? " · " + "▮".repeat(levelUpInfo.stripes) : ""}
        </div>
        <div className="text-muted text-sm mb-4">
          {levelUpInfo.stripes === 0 ? "New belt unlocked. Earned, not given." : "Keep showing up. The work compounds."}
        </div>
        <button onClick={close} className="bg-gold text-black font-bold px-6 py-2 rounded-lg text-sm">
          Onwards
        </button>
      </div>
    </div>
  )
}
