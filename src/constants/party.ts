export type SectionId = "hero" | "guests" | "rsvp" | "animations" | "planning"

export const CELEBRANT_FIRST_NAME = "Olivia"

export const NAV_SECTIONS: { id: SectionId; path: string; label: string }[] = [
  { id: "hero", path: "/", label: "🌸 Accueil" },
  { id: "guests", path: "/guests", label: "🪩 Invités" },
  { id: "rsvp", path: "/rsvp", label: "✉️ RSVP" },
  { id: "animations", path: "/animations", label: "🎤 Animations" },
  { id: "planning", path: "/planning", label: "📅 Planning" },
]
