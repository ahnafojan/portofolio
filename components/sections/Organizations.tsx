"use client";

import { useEffect, useRef, useState } from "react";
import { Organization } from "@/lib/types";

function formatRange(start?: string, end?: string, isCurrent?: boolean) {
  const s = start ? new Date(start).getFullYear() : null;
  const e = isCurrent ? "Now" : end ? new Date(end).getFullYear() : null;
  if (!s && !e) return "";
  if (s && !e) return `${s}`;
  if (!s && e) return `${e}`;
  return `${s} — ${e}`;
}

function OrgCard({ org, index }: { org: Organization; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  // ✅ Hitung style di luar JSX — tidak ada duplicate keys
  const cardTransform = hovered
    ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(4px)`
    : "translateY(0)";

  const cardTransition = hovered
    ? "transform 0.15s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s"
    : `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms, background 0.3s, border-color 0.3s, box-shadow 0.3s`;

  const cardBackground = hovered
    ? "rgba(255,255,255,0.042)"
    : "rgba(255,255,255,0.022)";

  const cardBorder = hovered
    ? "1px solid rgba(255,255,255,0.12)"
    : "1px solid rgba(255,255,255,0.06)";

  const cardBoxShadow = hovered
    ? "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)"
    : "none";

  return (
    <div
      ref={cardRef}
      data-anim
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl p-6 overflow-hidden"
      style={{
        opacity: 0,
        transform: cardTransform,
        transition: cardTransition,
        background: cardBackground,
        border: cardBorder,
        boxShadow: cardBoxShadow,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.55),transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Left accent for current */}
      {org.isCurrent && (
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full transition-all duration-500"
          style={{
            background: hovered
              ? "linear-gradient(to bottom,#a78bfa,rgba(124,58,237,0.3))"
              : "linear-gradient(to bottom,rgba(124,58,237,0.6),rgba(124,58,237,0.1))",
          }}
        />
      )}

      {/* Inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.07) 0%,transparent 65%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: hovered ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.1)",
              border: `1px solid ${hovered ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.18)"}`,
              boxShadow: hovered ? "0 0 20px rgba(124,58,237,0.25)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hovered ? "rgba(196,181,253,1)" : "rgba(167,139,250,0.75)"}
              strokeWidth="1.7"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-white leading-snug">{org.role}</p>
            <p className="text-sm mt-0.5 font-medium" style={{ color: "#a78bfa" }}>{org.name}</p>
            {org.description && (
              <p className="mt-2.5 text-sm leading-relaxed max-w-2xl" style={{ color: "#6b7280" }}>
                {org.description}
              </p>
            )}
          </div>
        </div>

        <span
          className="shrink-0 self-start text-xs font-mono px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-2 transition-all duration-300"
          style={{
            color: org.isCurrent ? "#a3e635" : "#9ca3af",
            background: org.isCurrent ? "rgba(163,230,53,0.07)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${org.isCurrent ? "rgba(163,230,53,0.2)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {org.isCurrent && (
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shrink-0" />
          )}
          {formatRange(org.startDate, org.endDate, org.isCurrent)}
        </span>
      </div>
    </div>
  );
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
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!items?.length) return null;

  const currentItems = items.filter(o => o.isCurrent);
  const pastItems = items.filter(o => !o.isCurrent);

  return (
    <section
      id="organizations"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden border-t py-24 lg:py-32"
      style={{
        background: "linear-gradient(180deg,#0b0b14 0%,#09090f 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-1/4 w-[450px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-0 w-[350px] h-[250px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div data-anim style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
            <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Involvement</p>
          </div>
          <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Organizations &amp;<br className="sm:hidden" /> Committees
            </h2>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {items.length} role{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Current */}
        {currentItems.length > 0 && (
          <div className="mb-8">
            <div data-anim className="flex items-center gap-3 mb-4"
              style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s" }}>
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#6b7280" }}>Active</p>
            </div>
            <div className="grid gap-3">
              {currentItems.map((o, i) => <OrgCard key={o._id} org={o} index={i} />)}
            </div>
          </div>
        )}

        {/* Past */}
        {pastItems.length > 0 && (
          <div>
            {currentItems.length > 0 && (
              <div data-anim className="flex items-center gap-3 mb-4 mt-6"
                style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#374151" }} />
                <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#374151" }}>Past</p>
              </div>
            )}
            <div className="grid gap-3">
              {pastItems.map((o, i) => <OrgCard key={o._id} org={o} index={i + currentItems.length} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
