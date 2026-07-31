export type SectionId = "hero" | "guests" | "planning" | "gallery" | "add-photos"

export const CELEBRANT_FIRST_NAME = "Olivia"

export const NAV_SECTIONS: { id: SectionId; path: string; label: string }[] = [
  { id: "hero", path: "/", label: "🌸 Accueil" },
  { id: "guests", path: "/guests", label: "🪩 Invités" },
  { id: "planning", path: "/planning", label: "📅 Planning" },
  { id: "gallery", path: "/gallery", label: "📸 Galerie" },
]
