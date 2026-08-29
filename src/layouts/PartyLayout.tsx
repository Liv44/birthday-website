import { Outlet } from "react-router-dom"

import Nav from "@/components/Nav"
import { NAV_SECTIONS_HEIGHT } from "@/constants/party"

export default function PartyLayout() {
  return (
    <div
      className="min-h-screen min-w-screen h-0 w-0 font-body overflow-y-auto overflow-x-hidden"
      // style={{
      //   background: "linear-gradient(135deg, #FFDCCD 0%, #fff5f0 40%, #fff0f8 100%)",
      // }}
    >
      <Nav />
      <main className="mx-auto w-full px-4 py-8" style={{minHeight: `calc(100vh - ${NAV_SECTIONS_HEIGHT}`}}>
        <Outlet />
      </main>
    </div>
  )
}
