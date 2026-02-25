"use client";

import { useEffect, useRef, useState } from "react";
import { Skill } from "@/lib/types";

interface SkillsProps { skills: Skill[]; }

const categoryMeta: Record<string, { icon: string; label: string; accent: string; glow: string }> = {
  Frontend:  { icon: "◈", label: "Frontend",  accent: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
  Backend:   { icon: "◉", label: "Backend",   accent: "#818cf8", glow: "rgba(129,140,248,0.15)" },
  Database:  { icon: "◎", label: "Database",  accent: "#6d28d9", glow: "rgba(109,40,217,0.15)"  },
  DevOps:    { icon: "⬡", label: "DevOps",    accent: "#8b5cf6", glow: "rgba(139,92,246,0.15)"  },
  Tools:     { icon: "◆", label: "Tools",     accent: "#c4b5fd", glow: "rgba(196,181,253,0.12)" },
  Other:     { icon: "◇", label: "Other",     accent: "#7c3aed", glow: "rgba(124,58,237,0.1)"   },
};

const categoryOrder = ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"];

/* ─── Magnetic skill pill ─── */
function SkillPill({ name, level }: { name: string; level?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    if (ref.current) {
      ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "translate(0,0)";
    }
  };

  const isHighLevel = level && level >= 4;

  return (
    <span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-default select-none"
      style={{
        transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.2s, border-color 0.2s, color 0.2s",
        background: isHighLevel ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.045)",
        border: `1px solid ${isHighLevel ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)"}`,
        color: isHighLevel ? "#c4b5fd" : "#9ca3af",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = isHighLevel ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.07)";
        el.style.borderColor = isHighLevel ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.15)";
        el.style.color = "#fff";
      }}
    >
      {isHighLevel && <span style={{ color: "#7c3aed", fontSize: "8px" }}>★</span>}
      {name}
    </span>
  );
}

/* ─── Category card ─── */
function CategoryCard({ category, skillList, meta, animDelay }: {
  category: string;
  skillList: Skill[];
  meta: typeof categoryMeta[string];
  animDelay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  return (
    <div
      ref={cardRef}
      data-anim
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative rounded-2xl p-6 overflow-hidden cursor-default"
      style={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.6s ease ${animDelay}ms, transform 0.6s ease ${animDelay}ms`,
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.022)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
        backdropFilter: "blur(16px)",
        transformStyle: "preserve-3d",
        perspective: "1000px",
        ...(hovered ? {
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(4px)`,
          transition: "transform 0.15s ease, background 0.3s, border-color 0.3s",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`,
        } : {
          transition: `opacity 0.6s ease ${animDelay}ms, transform 0.6s ease ${animDelay}ms, background 0.3s, border-color 0.3s`,
        }),
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${meta.glow} 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }} />

      {/* Top shine */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg,transparent,${meta.accent}55,transparent)`,
          opacity: hovered ? 1 : 0,
        }} />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{
            background: `${meta.glow}`,
            border: `1px solid ${meta.accent}30`,
            color: meta.accent,
            transition: "all 0.3s",
            ...(hovered ? { boxShadow: `0 0 20px ${meta.glow}` } : {}),
          }}>
          {meta.icon}
        </div>
        <div>
          <h3 className="text-xs font-mono tracking-widest uppercase" style={{ color: "#9ca3af" }}>
            {category}
          </h3>
        </div>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ color: "#4b5563", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {skillList.length}
        </span>
      </div>

      {/* Skills */}
      <div className="relative flex flex-wrap gap-2">
        {skillList.map((skill) => (
          <SkillPill key={skill._id} name={skill.name} level={skill.level} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative mt-5 h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: hovered ? `${Math.min(100, (skillList.filter(s => s.level && s.level >= 4).length / skillList.length) * 100)}%` : "0%",
            background: `linear-gradient(90deg,${meta.accent}80,${meta.accent})`,
            boxShadow: hovered ? `0 0 8px ${meta.accent}60` : "none",
          }}
        />
      </div>
      <p className="mt-1.5 text-[10px] font-mono" style={{ color: "#374151" }}>
        {skillList.filter(s => s.level && s.level >= 4).length} advanced
      </p>
    </div>
  );
}

/* ─── Horizontal marquee strip ─── */
function SkillMarquee({ skills }: { skills: Skill[] }) {
  const doubled = [...skills, ...skills];
  return (
    <div className="relative overflow-hidden py-4" style={{ maskImage: "linear-gradient(90deg,transparent,black 15%,black 85%,transparent)" }}>
      <div className="flex gap-3 w-max" style={{ animation: "marqueeScroll 30s linear infinite" }}>
        {doubled.map((s, i) => (
          <span key={i} className="shrink-0 text-xs px-3 py-1.5 rounded-full font-mono"
            style={{ color: "#6b7280", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills({ skills }: SkillsProps) {
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
              }, i * 90);
            });
          }
        });
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!skills || skills.length === 0) return null;

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden border-t py-24 lg:py-32"
      style={{
        background: "linear-gradient(180deg,#09090f 0%,#0b0b14 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.09) 0%,transparent 70%)", filter: "blur(100px)" }} />
        {/* Diagonal stripe */}
        <div className="absolute inset-0" style={{
          backgroundImage: "repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 40px)",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div data-anim style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
            <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Expertise</p>
          </div>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Skills &amp; Tools</h2>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full"
              style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {skills.length} technologies
            </span>
          </div>
        </div>

        {/* Marquee strip */}
        <div data-anim style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}>
          <div className="mb-10 rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <SkillMarquee skills={skills} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCategories.map((category, idx) => {
            const meta = categoryMeta[category] ?? categoryMeta.Other;
            return (
              <CategoryCard
                key={category}
                category={category}
                skillList={grouped[category]}
                meta={meta}
                animDelay={idx * 80}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
