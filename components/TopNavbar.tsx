"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  sectionId?: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "About", href: "#about", sectionId: "about" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "skills", label: "Skills", href: "#skills", sectionId: "skills" },
  { id: "experience", label: "Experience", href: "#experience", sectionId: "experience" },
  { id: "organizations", label: "Organizations", href: "#organizations", sectionId: "organizations" },
  { id: "certificates", label: "Certificates", href: "#certificates", sectionId: "certificates" },
  { id: "contact", label: "Contact", href: "#contact", sectionId: "contact" },
];

export default function TopNavbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("about");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 12);

      if (currentY < 24) {
        setVisible(true);
      } else if (delta > 8) {
        setVisible(false);
      } else if (delta < -8) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) return;
        const nextId = visibleEntries[0].target.getAttribute("id");
        if (!nextId) return;
        setActiveId(nextId);
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      }
    );

    NAV_ITEMS.forEach((item) => {
      if (!item.sectionId) return;
      const section = document.getElementById(item.sectionId);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const navClass = useMemo(
    () =>
      `fixed left-1/2 top-4 z-[60] w-[min(96vw,1120px)] -translate-x-1/2 transition-all duration-350 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
      }`,
    [visible]
  );

  return (
    <div className={navClass}>
      <nav
        className="mx-auto flex items-center justify-between gap-2 overflow-hidden rounded-full px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2"
        style={{
          background: scrolled ? "rgba(8,8,16,0.86)" : "rgba(8,8,16,0.62)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(14px)",
          boxShadow: scrolled
            ? "0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <a
          href="#about"
          onClick={() => setActiveId("about")}
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.18em]"
          style={{
            color: "#ddd6fe",
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.4)",
          }}
        >
          Portfolio
        </a>

        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto px-1 sm:gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            const itemStyle = {
              color: isActive ? "#ede9fe" : "#9ca3af",
              background: isActive ? "rgba(124,58,237,0.22)" : "transparent",
              border: `1px solid ${isActive ? "rgba(124,58,237,0.45)" : "transparent"}`,
            };

            if (item.href.startsWith("/")) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveId(item.id)}
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em] transition-all duration-250 sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em]"
                  style={itemStyle}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveId(item.id)}
                className="whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em] transition-all duration-250 sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em]"
                style={itemStyle}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
