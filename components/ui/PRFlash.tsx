"use client"

import { useTrainStore } from "@/store/useTrainStore"

export default function PRFlash() {
  const prFlash = useTrainStore(s => s.prFlash)
  if (!prFlash) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[240] flex items-center justify-center flex-col"
      style={{
        background: "radial-gradient(circle at center, rgba(251,191,36,0.3), rgba(0,0,0,0.6) 60%)",
        animation: "prFlash 0.8s ease-out forwards",
      }}
    >
      <div className="text-[14px] text-gold font-extrabold tracking-[5px]">NEW PERSONAL RECORD</div>
      <div
        className="text-[44px] font-extrabold text-white my-2 text-center px-5"
        style={{ textShadow: "0 0 30px rgba(251,191,36,0.8)", animation: "prShake 0.4s ease-out 2" }}
      >
        {prFlash.name}
      </div>
      <div className="text-[28px] font-bold text-gold">{prFlash.val}</div>
    </div>
  )
}
