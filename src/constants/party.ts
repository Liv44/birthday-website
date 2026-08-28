export type SectionId = "hero" | "guests" | "planning" | "gallery" | "add-photos"

export const CELEBRANT_FIRST_NAME = "Olivia"

/** Jour de la fête (date locale). Le zip galerie n'est proposé qu'après. */
export const PARTY_DATE = "2026-08-31"

/** Lendemain matin : les invités ne saturent pas le wifi en téléchargeant tout pendant la soirée. */
export const GALLERY_ZIP_AVAILABLE_FROM = new Date("2026-08-31T08:00:00+02:00")

export function isGalleryZipAvailable(now = new Date()): boolean {
  return now.getTime() >= GALLERY_ZIP_AVAILABLE_FROM.getTime()
}

export const NAV_SECTIONS: { id: SectionId; path: string; label: string }[] = [
  { id: "hero", path: "/", label: "Accueil" },
  { id: "guests", path: "/guests", label: "Invités" },
  { id: "planning", path: "/planning", label: "Planning" },
  { id: "gallery", path: "/gallery", label: "Galerie" },
]

export const NAV_SECTIONS_HEIGHT = "100px";
