import { createClient } from "@/lib/supabase/client"
import type { AppState } from "@/lib/types"

export interface PublicProfile {
  user_id: string
  username: string
}

export async function loadCurrentProfile(): Promise<PublicProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from("profiles")
    .select("user_id, username")
    .eq("user_id", user.id)
    .single()
  return (data as PublicProfile | null)
}

export async function setUserProfile(username: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, username: username.trim().toLowerCase() }, { onConflict: "user_id" })
  if (error) {
    if (error.code === "23505") return { error: "Username already taken — try another" }
    if (error.code === "23514") return { error: "3–20 chars, letters / numbers / underscore only" }
    return { error: error.message }
  }
  return {}
}

export async function searchByUsername(query: string): Promise<PublicProfile[]> {
  if (query.trim().length < 2) return []
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("user_id, username")
    .ilike("username", `%${query.trim()}%`)
    .limit(8)
  return (data as PublicProfile[]) || []
}

export async function fetchFriendData(userId: string): Promise<AppState | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", userId)
    .single()
  return (data?.data as AppState) || null
}

export async function resolveBatch(userIds: string[]): Promise<PublicProfile[]> {
  if (!userIds.length) return []
  const supabase = createClient()
  const { data } = await supabase
    .from("profiles")
    .select("user_id, username")
    .in("user_id", userIds)
  return (data as PublicProfile[]) || []
}
