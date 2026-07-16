import { NavLink } from "react-router-dom"

import { NAV_SECTIONS } from "@/constants/party"
import { cn } from "@/lib/utils"

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderColor: "rgba(250, 0, 157, 0.15)",
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-4 py-3">
        {NAV_SECTIONS.map((s) => (
          <NavLink
            key={s.id}
            to={s.path}
            end={s.path === "/"}
            className={({ isActive }) =>
              cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#FA009D] bg-gradient-to-br from-[rgba(250,0,157,0.12)] to-[rgba(250,129,0,0.12)] text-[#FA009D]"
                  : "border-[#FFDCCD] bg-white text-gray-400 hover:border-[#FA009D]",
              )
            }
          >
            {s.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
