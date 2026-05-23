"use client"

import React, { useState } from "react"
import { useTrainStore } from "@/store/useTrainStore"
import { SECTION_LABELS } from "@/lib/constants"
import { dayKey } from "@/lib/game-logic"
import type { AppState } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
  const data = useTrainStore(s => s.data)
  const toggleSection = useTrainStore(s => s.toggleSection)
  const setTheme = useTrainStore(s => s.setTheme)
  const addCategory = useTrainStore(s => s.addCategory)
  const renameCategory = useTrainStore(s => s.renameCategory)
  const deleteCategory = useTrainStore(s => s.deleteCategory)
  const importData = useTrainStore(s => s.importData)
  const resetAllData = useTrainStore(s => s.resetAllData)

  const [newCatName, setNewCatName] = useState("")
  const router = useRouter()

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    router.push("/login")
    router.refresh()
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `train-tracker-${dayKey(new Date())}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string) as AppState
        if (!confirm("This will replace ALL current data. Continue?")) return
        importData(raw)
      } catch { alert("Invalid JSON file.") }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  function handleReset() {
    if (!confirm("This wipes EVERYTHING. Are you absolutely sure?")) return
    if (!confirm("Last chance. All your training history, coins, and PRs will be gone.")) return
    resetAllData()
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <h2 className="text-lg font-bold mb-1">Settings</h2>
        <p className="text-muted text-sm mb-5">You&apos;re the admin. Tweak everything.</p>

        {/* Theme */}
        <div className="set-grp">
          <h3>Theme</h3>
          <div className="flex gap-2">
            {(["dark", "light"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: data.ui.theme === t ? "#ff4d3d" : "var(--color-panel2)",
                  color: data.ui.theme === t ? "#fff" : "var(--color-muted)",
                  border: `1.5px solid ${data.ui.theme === t ? "#ff4d3d" : "var(--color-line)"}`,
                }}
              >
                {t === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
            ))}
          </div>
        </div>

        {/* Section visibility */}
        <div className="set-grp">
          <h3>Dashboard sections</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
            {Object.keys(SECTION_LABELS).map(k => (
              <label key={k} className="flex items-center gap-2 bg-panel2 px-2.5 py-2 rounded-lg cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={data.ui.sectionsVisible[k] ?? true}
                  onChange={e => toggleSection(k, e.target.checked)}
                  className="cursor-pointer"
                />
                {SECTION_LABELS[k]}
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="set-grp">
          <h3>Categories</h3>
          {data.categories.map(c => {
            const count = data.lifts.filter(l => l.cat === c.id).length
            return (
              <div key={c.id} className="flex items-center gap-2 mb-1.5">
                <input
                  type="text" defaultValue={c.name}
                  onBlur={e => renameCategory(c.id, e.target.value)}
                  className="flex-1 modal-input"
                />
                <span className="text-[11px] text-muted whitespace-nowrap">{count} lift{count !== 1 ? "s" : ""}</span>
                <button onClick={() => deleteCategory(c.id)} className="text-accent border border-accent/40 rounded px-2 py-1 text-xs hover:bg-accent/10">×</button>
              </div>
            )
          })}
          <div className="flex gap-1.5 mt-2">
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category name" className="flex-1 modal-input" />
            <button onClick={() => { if (!newCatName.trim()) return; addCategory(newCatName.trim()); setNewCatName("") }} className="mini-btn solid">+ Add</button>
          </div>
        </div>

        {/* Data */}
        <div className="set-grp">
          <h3>Data</h3>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportData} className="mini-btn">⬇ Export JSON</button>
            <label className="mini-btn cursor-pointer">
              ⬆ Import JSON
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleReset} className="mini-btn" style={{ borderColor: "rgba(255,77,61,0.4)", color: "#ff4d3d" }}>⚠ Reset all data</button>
          </div>
        </div>

        {/* Account */}
        <div className="set-grp">
          <h3>Account</h3>
          <button onClick={handleLogout} className="mini-btn" style={{ borderColor: "rgba(255,77,61,0.4)", color: "#ff4d3d" }}>Sign out</button>
        </div>

        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="btn-primary">Done</button>
        </div>
      </div>
    </div>
  )
}
