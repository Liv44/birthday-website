import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isSupabaseConfigured, supabase, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import type { IGuest, GuestStatus, ISupabaseGuest } from "@/types"

type GuestSort = "name" | "name-desc" | "group" | "presence" | "children"

const SORT_OPTIONS: { value: GuestSort; label: string }[] = [
  { value: "name", label: "Nom (A → Z)" },
  { value: "name-desc", label: "Nom (Z → A)" },
  { value: "group", label: "Groupe" },
  { value: "presence", label: "Présence" },
  { value: "children", label: "Enfants d’abord" },
]

const PRESENCE_RANK: Record<GuestStatus, number> = {
  confirmed: 0,
  afternoon: 1,
  pending: 2,
  declined: 3,
}

const STATUS_BADGE: Record<GuestStatus, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmé",
    className: "border-emerald-500/80 bg-emerald-50 text-emerald-800",
  },
  afternoon: {
    label: "Après-midi",
    className: "border-orange-400/80 bg-orange-50 text-orange-900",
  },
  pending: {
    label: "En attente",
    className: "border-amber-500/80 bg-amber-50 text-amber-900",
  },
  declined: {
    label: "Absent·e",
    className: "border-rose-500/80 bg-rose-50 text-rose-800",
  },
}

function normalizeFr(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

/** Notion : « QUE L'APRS-MIDI » (typo fréquente sans « è »). */
const isAfternoonValue = (value: string | null | undefined): boolean => {
  return /apr?e?s[\s-]*midi/.test(normalizeFr(value))
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, "fr", { sensitivity: "base" })
}

function sortGuests(guests: IGuest[], sort: GuestSort): IGuest[] {
  const sorted = [...guests]
  sorted.sort((a, b) => {
    switch (sort) {
      case "name-desc":
        return compareNames(b.name, a.name)
      case "group": {
        const groupCmp = compareNames(a.group || "zzz", b.group || "zzz")
        return groupCmp !== 0 ? groupCmp : compareNames(a.name, b.name)
      }
      case "presence": {
        const presentCmp = Number(b.isPresent) - Number(a.isPresent)
        if (presentCmp !== 0) return presentCmp
        const rankCmp = PRESENCE_RANK[a.status] - PRESENCE_RANK[b.status]
        return rankCmp !== 0 ? rankCmp : compareNames(a.name, b.name)
      }
      case "children": {
        const childCmp = Number(b.isChild) - Number(a.isChild)
        return childCmp !== 0 ? childCmp : compareNames(a.name, b.name)
      }
      default:
        return compareNames(a.name, b.name)
    }
  })
  return sorted
}

const mapRsvpToDomain = (rsvp: string): GuestStatus => {
  const normalized = normalizeFr(rsvp)
  if (normalized.includes("absent")) return "declined"
  if (isAfternoonValue(rsvp)) return "afternoon"
  if (normalized.includes("confirme")) return "confirmed"
  return "pending"
}

const isChildAge = (age: string | null | undefined): boolean => {
  return normalizeFr(age) === "enfant"
}

const mapSupabaseTypeToDomain = (supabaseGuest: ISupabaseGuest): IGuest => {
  const status = mapRsvpToDomain(supabaseGuest.rsvp)
  return {
    id: supabaseGuest.notion_id,
    name: supabaseGuest.nom,
    status,
    created_at: supabaseGuest.updated_at,
    group: supabaseGuest.groupe,
    isChild: isChildAge(supabaseGuest.age),
    isPresent: status === "confirmed" || status === "afternoon",
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Guests() {
  const [guests, setGuests] = useState<IGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [onlyPresent, setOnlyPresent] = useState(true)
  const [sort, setSort] = useState<GuestSort>("name")

  const visibleByPresence = useMemo(() => {
    if (!onlyPresent) return guests
    return guests.filter((g) => g.isPresent)
  }, [guests, onlyPresent])

  const groupOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const guest of visibleByPresence) {
      if (!guest.group) continue
      counts.set(guest.group, (counts.get(guest.group) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([group, count]) => ({ label: group, value: group, count }))
  }, [visibleByPresence])

  const filteredGuests = useMemo(() => {
    const filtered =
      selectedGroups.length === 0
        ? visibleByPresence
        : visibleByPresence.filter((g) => selectedGroups.includes(g.group))
    return sortGuests(filtered, sort)
  }, [visibleByPresence, selectedGroups, sort])

  const toggleGroup = (group: string, checked: boolean) => {
    setSelectedGroups((previous) =>
      checked ? [...previous, group] : previous.filter((g) => g !== group)
    )
  }

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
        .select("notion_id,nom,age,rsvp,hebergement,groupe,updated_at")
        .order("nom")

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setGuests([])
      } else {
        setGuests((data ?? []).map((row) => mapSupabaseTypeToDomain(row as ISupabaseGuest)))
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
    let afternoon = 0
    let pending = 0
    let declined = 0
    let children = 0
    let present = 0
    for (const g of guests) {
      if (g.status === "confirmed") confirmed += 1
      else if (g.status === "afternoon") afternoon += 1
      else if (g.status === "declined") declined += 1
      else pending += 1
      if (g.isChild) children += 1
      if (g.isPresent) present += 1
    }
    return { confirmed, afternoon, pending, declined, children, present }
  }, [guests])

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-black text-gray-800">Invité·e·s</h2>
        <div className="flex flex-wrap gap-x-3 text-xs text-gray-500">
          <span>Présent·e·s · …</span>
          <span>Absents · …</span>
          <span>Enfants · …</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-brand-peach/50" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-black text-gray-800">Invité·e·s</h2>
        <div className="card-glass rounded-xl p-4 text-center">
          <p className="font-display text-base font-bold text-gray-800">
            Impossible de charger la liste
          </p>
          <p className="mt-1 text-xs text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-black text-gray-800">Invité·e·s</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span>Présent·e·s · {counts.present}</span>
          <span>Absents · {counts.declined}</span>
          <span>Enfants · {counts.children}</span>
        </div>
      </div>

      <div className="card-glass space-y-2.5 rounded-xl px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700">
              <Checkbox checked={onlyPresent} onCheckedChange={setOnlyPresent} />
              <span>Présent·e·s uniquement</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Trier</span>
              <Select
                value={sort}
                items={SORT_OPTIONS}
                onValueChange={(value) => {
                  if (value) setSort(value as GuestSort)
                }}
              >
                <SelectTrigger size="sm" className="h-7 border-brand-magenta/20 bg-white/70 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" alignItemWithTrigger={false}>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {groupOptions.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Groupes</p>
                {selectedGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedGroups([])}
                    className="text-xs text-brand-magenta underline-offset-2 hover:underline"
                  >
                    Tous les groupes
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {groupOptions.map((group) => (
                  <label
                    key={group.value}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700"
                  >
                    <Checkbox
                      checked={selectedGroups.includes(group.value)}
                      onCheckedChange={(checked) => toggleGroup(group.value, checked)}
                    />
                    <span>{group.label}</span>
                    <span className="text-gray-400">({group.count})</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

      {filteredGuests.length === 0 ? (
        <p className="text-center text-xs text-gray-500">Aucun invité pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredGuests.map((g) => (
            <li
              key={g.id}
              className="card-glass flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center"
            >
              <div
                style={{ background: "linear-gradient(135deg, #FA009D, #FA8100)" }}
                className="font-display flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              >
                {initialsFromName(g.name)}
              </div>
              <p className="w-full truncate text-sm font-medium text-gray-800">{g.name}</p>
              <div className="flex max-w-full flex-wrap justify-center gap-1">
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", STATUS_BADGE[g.status].className)}
                >
                  {STATUS_BADGE[g.status].label}
                </Badge>
                {g.isChild && (
                  <Badge
                    variant="outline"
                    className="border-sky-400/70 bg-sky-50 text-[10px] text-sky-800"
                  >
                    Enfant
                  </Badge>
                )}
                {g.group && (
                  <Badge
                    variant="outline"
                    className="max-w-full border-brand-magenta/30 bg-white/50 text-[10px] text-gray-600"
                  >
                    {g.group}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
