"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ui/ProjectCard";

interface FeaturedProjectsProps { projects: Project[]; }

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
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

  if (!projects || projects.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0e0e18 0%,#0c0c13 100%)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[450px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.08) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div
          data-anim
          className="flex items-end justify-between mb-12"
          style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <div>
            <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>Selected Work</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Featured Projects</h2>
          </div>
          <Link
            href="/projects"
            className="group flex items-center gap-2 text-sm rounded-full px-4 py-2 transition-all duration-200"
            style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.color = "#e5e7eb";
              el.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.color = "#6b7280";
              el.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            All projects
            <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <div
              key={project._id}
              data-anim
              style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
