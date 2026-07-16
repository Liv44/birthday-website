export type GuestStatus = "confirmed" | "pending" | "declined"

export interface Guest {
  id: string
  name: string
  status: GuestStatus
  created_at: string
}

export interface Rsvp {
  id: string
  name: string
  coming: boolean
  dietary: string | null
  message: string | null
  created_at: string
}

export interface Animation {
  id: string
  author: string
  idea: string
  created_at: string
}

export interface PlanningItem {
  time: string
  icon: string
  label: string
}
