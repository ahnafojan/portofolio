"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ui/ProjectCard";

interface FeaturedProjectsProps { projects: Project[]; }

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredLink, setHoveredLink] = useState(false);

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
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden py-24 lg:py-32"
      style={{ background: "linear-gradient(180deg,#0b0b14 0%,#09090f 100%)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[450px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.09) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          data-anim
          className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between"
          style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
              <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Selected Work</p>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Featured Projects</h2>
          </div>

          <Link
            href="/projects"
            onMouseEnter={() => setHoveredLink(true)}
            onMouseLeave={() => setHoveredLink(false)}
            className="group inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm transition-all duration-300"
            style={{
              color: hoveredLink ? "#e2d9f3" : "#6b7280",
              background: hoveredLink ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${hoveredLink ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.07)"}`,
              boxShadow: hoveredLink ? "0 0 20px rgba(124,58,237,0.15)" : "none",
            }}
          >
            All projects
            <span
              className="transition-transform duration-300 inline-block"
              style={{ transform: hoveredLink ? "translateX(4px)" : "translateX(0)" }}
            >
              →
            </span>
          </Link>
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <div
              key={project._id}
              data-anim
              style={{ opacity: 0, transform: "translateY(28px)", transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          data-anim
          className="mt-12 text-center"
          style={{ opacity: 0, transform: "translateY(16px)", transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s" }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-mono transition-colors duration-300"
            style={{ color: "#4b5563" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4b5563"; }}
          >
            <span>View all {projects.length}+ projects</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
