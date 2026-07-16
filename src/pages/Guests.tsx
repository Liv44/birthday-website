import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { isSupabaseConfigured, supabase, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import type { Guest, GuestStatus } from "@/types"

function isGuestStatus(value: string): value is GuestStatus {
  return value === "confirmed" || value === "pending" || value === "declined"
}

function normalizeGuest(row: {
  id: string
  name: string
  status: string
  created_at: string
}): Guest {
  return {
    id: row.id,
    name: row.name,
    status: isGuestStatus(row.status) ? row.status : "pending",
    created_at: row.created_at,
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      if (!isSupabaseConfigured()) {
        setError(SUPABASE_CONFIG_HELP)
        setGuests([])
        setLoading(false)
        return
      }
      const { data, error: fetchError } = await supabase
        .from("guests")
        .select("id,name,status,created_at")
        .order("name")

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setGuests([])
      } else {
        setGuests((data ?? []).map((row) => normalizeGuest(row as Guest)))
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    let confirmed = 0
    let pending = 0
    let declined = 0
    for (const g of guests) {
      if (g.status === "confirmed") confirmed += 1
      else if (g.status === "declined") declined += 1
      else pending += 1
    }
    return { confirmed, pending, declined }
  }, [guests])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-display mb-2 text-3xl font-black text-gray-800">Invité·e·s</h2>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Confirmés · …</span>
          <span>En attente · …</span>
          <span>Absents · …</span>
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl bg-brand-peach/50"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="font-display mb-4 text-3xl font-black text-gray-800">Invité·e·s</h2>
        <div className="card-glass rounded-2xl p-6 text-center">
        <p className="font-display text-lg font-bold text-gray-800">Impossible de charger la liste</p>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display mb-2 text-3xl font-black text-gray-800">Invité·e·s</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>Confirmés · {counts.confirmed}</span>
        <span>En attente · {counts.pending}</span>
        <span>Absents · {counts.declined}</span>
      </div>

      {guests.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Aucun invité pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {guests.map((g) => (
            <li key={g.id} className="card-glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <div
                style={{ background: "linear-gradient(135deg, #FA009D, #FA8100)" }}
                className="font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              >
                {initialsFromName(g.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">{g.name}</p>
              </div>
              {g.status === "confirmed" && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/80 bg-emerald-50 text-emerald-800"
                >
                  Confirmé
                </Badge>
              )}
              {g.status === "pending" && (
                <Badge variant="outline" className="border-amber-500/80 bg-amber-50 text-amber-900">
                  En attente
                </Badge>
              )}
              {g.status === "declined" && (
                <Badge variant="outline" className="border-rose-500/80 bg-rose-50 text-rose-800">
                  Absent·e
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
