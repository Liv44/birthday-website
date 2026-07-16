import { useCallback, useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isSupabaseConfigured, supabase, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import type { Animation } from "@/types"

function initialsFromAuthor(author: string): string {
  const parts = author.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Animations() {
  const [animations, setAnimations] = useState<Animation[]>([])
  const [form, setForm] = useState({ author: "", idea: "" })
  const [success, setSuccess] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnimations = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      setAnimations([])
      return
    }
    const { data, error: fetchError } = await supabase
      .from("animations")
      .select("id,author,idea,created_at")
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setAnimations([])
      return
    }
    setAnimations((data ?? []) as Animation[])
    setError(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingList(true)
      await fetchAnimations()
      if (!cancelled) setLoadingList(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [fetchAnimations])

  useEffect(() => {
    if (!success) return
    const t = window.setTimeout(() => setSuccess(false), 3000)
    return () => window.clearTimeout(t)
  }, [success])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.author.trim() || !form.idea.trim()) return
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      return
    }
    setLoadingSubmit(true)
    setError(null)
    const { error: insertError } = await supabase.from("animations").insert({
      author: form.author.trim(),
      idea: form.idea.trim(),
    })
    if (insertError) {
      setError(insertError.message)
      setLoadingSubmit(false)
      return
    }
    setForm({ author: "", idea: "" })
    await fetchAnimations()
    setSuccess(true)
    setLoadingSubmit(false)
  }

  if (loadingList) {
    return (
      <div className="space-y-4">
        <h2 className="font-display mb-2 text-3xl font-black text-gray-800">Animations</h2>
        <div className="h-40 animate-pulse rounded-2xl bg-brand-peach/50" />
        <div className="h-24 animate-pulse rounded-2xl bg-brand-peach/40" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="font-display text-3xl font-black text-gray-800">Animations</h2>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-glass space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-black text-gray-800">Proposer une animation</h2>
        <div>
          <label htmlFor="anim-author" className="mb-1.5 block text-sm font-medium text-gray-700">
            Ton nom
          </label>
          <Input
            id="anim-author"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="w-full bg-white"
            required
          />
        </div>
        <div>
          <label htmlFor="anim-idea" className="mb-1.5 block text-sm font-medium text-gray-700">
            Ton idée
          </label>
          <Textarea
            id="anim-idea"
            value={form.idea}
            onChange={(e) => setForm((f) => ({ ...f, idea: e.target.value }))}
            rows={4}
            className="bg-white"
            required
          />
        </div>
        {success && (
          <p className="text-sm font-medium text-emerald-700">Idée envoyée — merci !</p>
        )}
        <Button
          type="submit"
          disabled={loadingSubmit}
          className="rounded-full border-0 px-7 py-2.5 font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #FA009D, #FA8100)" }}
        >
          {loadingSubmit ? "Envoi…" : "Envoyer"}
        </Button>
      </form>

      <div>
        <h2 className="font-display mb-4 text-2xl font-black text-gray-800">Idées des invité·e·s</h2>
        {animations.length === 0 ? (
          <p className="text-sm text-gray-500">Pas encore d&apos;idées — sois le·a premier·ère !</p>
        ) : (
          <ul className="space-y-3">
            {animations.map((a) => (
              <li key={a.id} className="card-glass flex gap-3 rounded-2xl p-4">
                <div
                  style={{ background: "linear-gradient(135deg, #FA009D, #FA5500)" }}
                  className="font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                >
                  {initialsFromAuthor(a.author)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800">{a.author}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{a.idea}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
