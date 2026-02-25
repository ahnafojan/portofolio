"use client";

import { useEffect, useRef } from "react";
import { Organization } from "@/lib/types";

function formatRange(start?: string, end?: string, isCurrent?: boolean) {
  const s = start ? new Date(start).getFullYear() : null;
  const e = isCurrent ? "Now" : end ? new Date(end).getFullYear() : null;
  if (!s && !e) return "";
  if (s && !e) return `${s}`;
  if (!s && e) return `${e}`;
  return `${s} — ${e}`;
}

export default function Organizations({ items }: { items: Organization[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll<HTMLElement>("[data-anim]");
            cards.forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!items?.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#0e0e16 0%,#0c0c13 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-1/4 w-[450px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-0 w-[350px] h-[250px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(60px)" }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          data-anim
          style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>
            Involvement
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12">
            Organization &amp; Committee
          </h2>
        </div>

        <div className="grid gap-4">
          {items.map((o) => (
            <div
              key={o._id}
              data-anim
              className="group relative rounded-2xl p-6 overflow-hidden"
              style={{
                opacity: 0,
                transform: "translateY(20px)",
                transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, background 0.3s",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.045)";
                el.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.025)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              {/* Top shine on hover */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)" }} />
              {/* Inner glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.06) 0%,transparent 60%)" }} />

              <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.85)" strokeWidth="1.8">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{o.role}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#a78bfa" }}>{o.name}</p>
                    {o.description && (
                      <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: "#6b7280" }}>
                        {o.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 self-start text-xs font-mono px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
                  style={{ color: "#9ca3af", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {o.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  )}
                  {formatRange(o.startDate, o.endDate, o.isCurrent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
