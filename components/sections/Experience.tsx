"use client";

import { useEffect, useRef, useState } from "react";
import { Experience as ExperienceType } from "@/lib/types";

interface ExperienceProps { experiences: ExperienceType[]; }

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getDuration(start?: string, end?: string, isCurrent?: boolean): string {
  if (!start) return "";
  const s = new Date(start);
  const e = isCurrent ? new Date() : (end ? new Date(end) : new Date());
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 12) return `${months}mo`;
  const yr = Math.floor(months / 12);
  const mo = months % 12;
  return mo > 0 ? `${yr}y ${mo}mo` : `${yr}y`;
}

function ExperienceCard({ exp, index }: { exp: ExperienceType; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-anim
      className="group relative flex gap-6 sm:gap-8 pb-8 last:pb-0"
      style={{ opacity: 0, transform: "translateX(-16px)", transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms` }}
    >
      {/* Timeline dot + line */}
      <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: "20px" }}>
        <div
          className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center mt-4 transition-all duration-500"
          style={exp.isCurrent
            ? {
                background: "rgba(124,58,237,0.2)",
                border: "2px solid #7c3aed",
                boxShadow: hovered ? "0 0 20px rgba(124,58,237,0.7), 0 0 40px rgba(124,58,237,0.3)" : "0 0 12px rgba(124,58,237,0.5)",
              }
            : {
                background: hovered ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${hovered ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
              }
          }
        >
          {exp.isCurrent && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#7c3aed" }} />
          )}
        </div>
        {/* Vertical line */}
        <div className="flex-1 w-px mt-2 last:hidden"
          style={{ background: "linear-gradient(to bottom,rgba(124,58,237,0.3) 0%,rgba(255,255,255,0.04) 100%)" }} />
      </div>

      {/* Card */}
      <div
        className="flex-1 mb-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.022)",
            border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
            backdropFilter: "blur(16px)",
            transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
          }}
        >
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)",
              opacity: hovered ? 1 : 0,
            }} />

          {/* Side accent for current */}
          {exp.isCurrent && (
            <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
              style={{ background: "linear-gradient(to bottom,rgba(124,58,237,0.8),rgba(124,58,237,0.2))" }} />
          )}

          <div className="p-5 pl-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white text-base">{exp.role}</h3>
                  {exp.isCurrent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ color: "#a78bfa", background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.25)" }}>
                      ● Current
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium" style={{ color: "#7c3aed" }}>@ {exp.company}</p>
              </div>

              <div className="flex w-full flex-col items-start gap-1 sm:w-auto sm:shrink-0 sm:items-end">
                <p className="text-xs font-mono" style={{ color: "#4b5563" }}>
                  {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                </p>
                {exp.startDate && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {getDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                  </span>
                )}
              </div>
            </div>

            {exp.description && (
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: expanded ? "400px" : "60px",
                  transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)",
                  maskImage: expanded ? "none" : "linear-gradient(to bottom,black 60%,transparent)",
                  WebkitMaskImage: expanded ? "none" : "linear-gradient(to bottom,black 60%,transparent)",
                }}
              >
                <p className="text-sm leading-relaxed mt-3 max-w-xl" style={{ color: "#6b7280" }}>
                  {exp.description}
                </p>
              </div>
            )}

            {exp.description && exp.description.length > 100 && (
              <button
                className="mt-2 text-[11px] font-mono transition-colors duration-200"
                style={{ color: hovered ? "#a78bfa" : "#6b7280" }}
              >
                {expanded ? "↑ Less" : "↓ More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Experience({ experiences }: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll<HTMLElement>("[data-anim]");
            els.forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateX(0)";
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!experiences || experiences.length === 0) return null;

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden border-t py-24 lg:py-32"
      style={{
        background: "linear-gradient(180deg,#0b0b14 0%,#09090f 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[450px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div data-anim style={{ opacity: 0, transform: "translateX(-16px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
            <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Career</p>
          </div>
          <div className="mb-14 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Experience</h2>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {experiences.length} position{experiences.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp._id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
