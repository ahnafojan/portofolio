"use client";

import { useEffect, useRef } from "react";
import { Experience as ExperienceType } from "@/lib/types";

interface ExperienceProps { experiences: ExperienceType[]; }

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
                el.style.transform = "translateY(0)";
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!experiences || experiences.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#0e0e16 0%,#0c0c13 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          data-anim
          style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>Career</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-14">Experience</h2>
        </div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(to bottom,rgba(124,58,237,0.5),rgba(255,255,255,0.05) 80%,transparent)" }} />

          {experiences.map((exp) => (
            <div
              key={exp._id}
              data-anim
              className="group relative flex gap-8 pb-10 last:pb-0"
              style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
            >
              {/* Dot */}
              <div className="relative flex-shrink-0 mt-1.5 z-10">
                <div
                  className="w-[11px] h-[11px] rounded-full border-2 transition-all duration-300"
                  style={exp.isCurrent
                    ? { borderColor: "#7c3aed", background: "rgba(124,58,237,0.3)", boxShadow: "0 0 12px rgba(124,58,237,0.5)" }
                    : { borderColor: "#374151", background: "#0e0e16" }}
                />
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.04)";
                  el.style.borderColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.025)";
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)" }} />

                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-semibold text-white">{exp.role}</h3>
                    <span className="text-sm" style={{ color: "#6b7280" }}>@ {exp.company}</span>
                    {exp.isCurrent && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ color: "#a78bfa", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono shrink-0" style={{ color: "#4b5563" }}>
                    {formatDate(exp.startDate)}{exp.startDate && " — "}{exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-sm leading-relaxed mt-1 max-w-xl" style={{ color: "#6b7280" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
