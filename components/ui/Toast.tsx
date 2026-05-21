"use client"

import { useTrainStore } from "@/store/useTrainStore"

export default function ToastStack() {
  const toasts = useTrainStore(s => s.toasts)
  const remove = useTrainStore(s => s.removeToast)

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{
            animation: "slideIn 0.4s cubic-bezier(.2,.7,.2,1), fadeOut 0.4s ease 3.6s forwards",
            borderColor: t.kind === "xp" ? "#ff4d3d" : "#fbbf24",
          }}
          className="bg-gradient-to-br from-[#1f2330] to-[#161922] border rounded-xl px-4 py-3 shadow-xl min-w-60 max-w-80 pointer-events-auto cursor-pointer"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.kind === "xp" ? "#ff4d3d" : "#fbbf24" }}>{t.title}</div>
          <div className="text-sm font-semibold mt-0.5">{t.body}</div>
          {t.sub && <div className="text-xs text-muted mt-0.5">{t.sub}</div>}
        </div>
      ))}
    </div>
  )
}
