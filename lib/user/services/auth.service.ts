import { supabase } from "@/lib/supabase/client"

export async function ensureAnonUser() {
  const { data: { user } } = await supabase.auth.getUser()

  // EXISTING SESSION
  if (user) {
    console.log("ENSURE EXISTING:", user.id);
    return user
  }

  // CREATE ANONYMOUS USER
  const { data, error } =
    await supabase.auth.signInAnonymously()

  if (error || !data.user) {
    throw new Error("Failed to create anonymous user")
  }

  console.log("ENSURE NEW:", data.user.id);
  return data.user
}