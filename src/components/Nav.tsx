import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { NAV_SECTIONS, NAV_SECTIONS_HEIGHT } from "@/constants/party";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on route change instead of on click: the menu stays mounted
  // during the view transition and closes once navigation commits,
  // which removes the flicker.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Close if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!isMobile) setIsOpen(false);
  }, [isMobile]);

  return (
    <>
      <nav
        className="sticky top-0 z-[51] flex items-center justify-between text-5xl backdrop-blur-md"
        style={{
          height: NAV_SECTIONS_HEIGHT,
        }}
      >
        <img src="/logo/logo-medium.png" alt="" className="m-2 size-16" />
        <div className="mx-4 flex lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <XIcon className="size-8" /> : <MenuIcon className="size-8" />}
          </Button>
        </div>
        <div className="hidden max-w-3xl flex-wrap items-center justify-center gap-2 px-4 py-3 lg:flex">
          <NavigationSections />
        </div>
      </nav>

      {isOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 overflow-y-auto bg-background text-5xl lg:hidden"
        >
          <NavigationSections
            onSamePageClick={(path) => path === pathname && setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}

function NavigationSections({
  onSamePageClick,
}: {
  onSamePageClick?: (path: string) => void;
}) {
  return (
    <>
      {NAV_SECTIONS.map((s) => (
        <NavLink
          key={s.id}
          to={s.path}
          end={s.path === "/"}
          viewTransition
          onClick={() => onSamePageClick?.(s.path)}
          className={({ isActive }) =>
            cn(
              "rounded-full px-3 py-1.5 font-medium transition-colors",
              isActive ? "text-[#FA009D]" : "text-black hover:text-[#FF8FDD]",
            )
          }
        >
          {s.label}
        </NavLink>
      ))}
    </>
  );
}
