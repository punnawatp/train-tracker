"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/")
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-panel border border-line rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-muted text-sm">We sent a confirmation link to <strong className="text-tx">{email}</strong>. Click it to activate your account, then come back and log in.</p>
          <button onClick={() => { setSent(false); setMode("login") }} className="mt-6 text-accent text-sm hover:underline">Back to login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-panel border border-line rounded-2xl p-8 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_14px_#ff4d3d]" />
          <h1 className="text-2xl font-bold tracking-tight">Train</h1>
        </div>

        <h2 className="text-lg font-semibold mb-1">{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="text-muted text-sm mb-6">{mode === "login" ? "Log in to continue your training." : "Start your grind. Free forever."}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-tx focus:outline-none focus:border-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-lg px-3 py-2 text-sm text-tx focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-accent text-sm">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-accent text-white font-bold rounded-lg py-3 text-sm transition hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "…" : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          {mode === "login" ? "No account?" : "Already have one?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }} className="text-accent hover:underline">
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  )
}
