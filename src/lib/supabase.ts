import { createClient } from "@supabase/supabase-js"

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!url || !key) return null
  return { url, key }
}

const config = getSupabaseConfig()

/** Client Supabase : n’appelle l’API que si `isSupabaseConfigured()` est vrai. */
export const supabase = createClient(
  config?.url ?? "https://placeholder.supabase.co",
  config?.key ?? "sb-placeholder-key-not-configured",
)

export function isSupabaseConfigured(): boolean {
  return config !== null
}

export const SUPABASE_CONFIG_HELP =
  "Ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_PUBLISHABLE_KEY) dans .env.local, puis redémarre le serveur Vite."
