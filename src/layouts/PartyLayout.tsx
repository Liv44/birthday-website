import { Outlet } from "react-router-dom"

import Nav from "@/components/Nav"
import { CELEBRANT_FIRST_NAME } from "@/constants/party"

export default function PartyLayout() {
  return (
    <div
      className="min-h-screen font-body"
      style={{
        background: "linear-gradient(135deg, #FFDCCD 0%, #fff5f0 40%, #fff0f8 100%)",
      }}
    >
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="font-body py-8 text-center text-xs text-gray-400">
        Fait avec 💜 pour les 30 ans de {CELEBRANT_FIRST_NAME} · Fleurs &amp; Disco 2025
      </footer>
    </div>
  )
}
