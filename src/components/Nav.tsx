import { NavLink } from "react-router-dom"

import { NAV_SECTIONS, NAV_SECTIONS_HEIGHT } from "@/constants/party"
import { cn } from "@/lib/utils"

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md flex justify-between items-center text-5xl"
      style={{
         height: NAV_SECTIONS_HEIGHT
      }}
    >
      {/*<h1 className="py-3 px-4 gradient-text">Les 25+1 ans d’Olivia</h1>*/}
      <img src="/logo/logo-medium.png" className="size-16 m-2"/>
      <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2 px-4 py-3">
        {NAV_SECTIONS.map((s) => (
          <NavLink
            key={s.id}
            to={s.path}
            end={s.path === "/"}
            className={({ isActive }) =>
              cn(
                "rounded-full px-3 py-1.5 font-medium transition-colors",
                isActive
                  ? "text-[#FA009D]"
                  : "text-black hover:text-[#FF8FDD]",
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
