"use client";

import { useEffect, useRef } from "react";
import { Skill, SkillsByCategory } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface SkillsProps { skills: Skill[]; }

const categoryMeta: Record<string, { icon: string; color: string }> = {
  Frontend:  { icon: "◈", color: "rgba(124,58,237,0.15)" },
  Backend:   { icon: "◉", color: "rgba(99,102,241,0.15)" },
  Database:  { icon: "◎", color: "rgba(79,70,229,0.15)"  },
  DevOps:    { icon: "⬡", color: "rgba(109,40,217,0.15)" },
  Tools:     { icon: "◆", color: "rgba(139,92,246,0.15)" },
  Other:     { icon: "◇", color: "rgba(124,58,237,0.1)"  },
};

const categoryOrder = ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"];

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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!skills || skills.length === 0) return null;

  const grouped = skills.reduce<SkillsByCategory>((acc, skill) => {
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
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#0c0c13 0%,#0e0e18 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.08) 0%,transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 right-0 w-[350px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(70px)" }} />
        {/* Diagonal lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: "repeating-linear-gradient(-45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 36px)",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div
          data-anim
          style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>Expertise</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12">Skills &amp; Tools</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedCategories.map((category) => {
            const meta = categoryMeta[category] ?? categoryMeta.Other;
            return (
              <div
                key={category}
                data-anim
                className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-300"
                style={{
                  opacity: 0,
                  transform: "translateY(24px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, background 0.3s",
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
                {/* Inner glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `linear-gradient(135deg,${meta.color} 0%,transparent 60%)` }} />

                <div className="flex items-center gap-2.5 mb-4 pb-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-base" style={{ color: "rgba(167,139,250,0.7)" }}>{meta.icon}</span>
                  <h3 className="text-xs font-mono tracking-widest uppercase" style={{ color: "#6b7280" }}>
                    {category}
                  </h3>
                  <span className="ml-auto text-[10px] font-mono" style={{ color: "#374151" }}>
                    {grouped[category].length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {grouped[category].map((skill) => (
                    <Badge
                      key={skill._id}
                      label={skill.name}
                      variant={skill.level && skill.level >= 4 ? "accent" : "default"}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
