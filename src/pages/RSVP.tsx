import { useMemo, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { isSupabaseConfigured, supabase, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const DIETARY_OPTIONS = [
  { value: "none", label: "Aucune" },
  { value: "vegetarian", label: "Végétarien·ne" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Sans gluten" },
  { value: "lactose_free", label: "Sans lactose" },
  { value: "nut_allergy", label: "Allergie aux noix" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Casher" },
  { value: "other", label: "Autre" },
] as const

type DietaryValue = (typeof DIETARY_OPTIONS)[number]["value"]

const DIETARY_LABELS: Record<DietaryValue, string> = Object.fromEntries(
  DIETARY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<DietaryValue, string>

export default function RSVP() {
  const dietaryItems = useMemo(
    () => Object.fromEntries(DIETARY_OPTIONS.map((o) => [o.value, o.label])),
    [],
  )

  const [form, setForm] = useState({
    name: "",
    coming: "" as "" | "yes" | "no",
    dietary: "none" as DietaryValue,
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || form.coming === "") {
      setError("Merci d’indiquer ton nom et si tu viens.")
      return
    }
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      return
    }
    setLoading(true)
    setError(null)
    const dietaryLabel =
      form.coming === "yes" && form.dietary !== "none"
        ? DIETARY_LABELS[form.dietary]
        : null
    const { error: insertError } = await supabase.from("rsvps").insert({
      name: form.name.trim(),
      coming: form.coming === "yes",
      dietary: dietaryLabel,
      message: form.message.trim() || null,
    })
    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <h2 className="font-display mb-6 text-center text-3xl font-black text-gray-800">RSVP</h2>
        <div className="card-glass mx-auto max-w-md rounded-2xl p-8 text-center">
        <p className="text-4xl" aria-hidden>
          🎉
        </p>
        <h2 className="font-display mt-4 text-2xl font-bold text-gray-800">Merci !</h2>
        <p className="mt-2 text-sm text-gray-600">
          Ta réponse est bien enregistrée. À très vite sur la piste !
        </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display mb-4 text-3xl font-black text-gray-800">RSVP</h2>
      <form onSubmit={handleSubmit} className="card-glass space-y-5 rounded-2xl p-6">
      <div>
        <label htmlFor="rsvp-name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Ton prénom &amp; nom
        </label>
        <Input
          id="rsvp-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ex. Camille Dupont"
          required
          className="w-full bg-white"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Tu viens ?</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, coming: "yes" }))}
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
              form.coming === "yes"
                ? "border-2 border-brand-magenta shadow-sm"
                : "border border-gray-200 bg-white",
            )}
            style={
              form.coming === "yes"
                ? {
                    background:
                      "linear-gradient(135deg, rgba(255,220,205,0.65), rgba(250,0,157,0.12))",
                  }
                : undefined
            }
          >
            Oui, j&apos;arrive ! 🎉
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, coming: "no" }))}
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
              form.coming === "no"
                ? "border-2 border-brand-magenta shadow-sm"
                : "border border-gray-200 bg-white",
            )}
            style={
              form.coming === "no"
                ? {
                    background:
                      "linear-gradient(135deg, rgba(255,220,205,0.65), rgba(250,0,157,0.12))",
                  }
                : undefined
            }
          >
            Non, je ne peux pas 😢
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="rsvp-dietary" className="mb-1.5 block text-sm font-medium text-gray-700">
          Restrictions alimentaires
        </label>
        <Select
          items={dietaryItems}
          value={form.dietary}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, dietary: v as DietaryValue }))
          }
        >
          <SelectTrigger id="rsvp-dietary" className="w-full min-w-0 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIETARY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="rsvp-message" className="mb-1.5 block text-sm font-medium text-gray-700">
          Message (optionnel)
        </label>
        <Textarea
          id="rsvp-message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Une dédicace, une idée…"
          rows={4}
          className="bg-white"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border-0 px-7 py-2.5 font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:translate-y-0"
        style={{ background: "linear-gradient(135deg, #FA009D, #FA8100)" }}
      >
        {loading ? "Envoi…" : "Envoyer ma réponse"}
      </Button>
    </form>
    </div>
  )
}
