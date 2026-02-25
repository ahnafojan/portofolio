"use client";

import { useEffect, useRef, useState } from "react";
import { Profile } from "@/lib/types";
import Button from "@/components/ui/Button";

interface ContactProps { profile: Profile | null; }

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl group transition-all duration-300"
      style={{
        background: hovered ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.35)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        textDecoration: "none",
      }}
    >
      <span className="transition-transform duration-300" style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }}>
        {icon}
      </span>
      <span className="text-sm font-medium transition-colors duration-300"
        style={{ color: hovered ? "#e2d9f3" : "#9ca3af" }}>
        {label}
      </span>
      <span className="ml-auto text-xs transition-all duration-300"
        style={{ color: hovered ? "#7c3aed" : "#374151", transform: hovered ? "translateX(3px)" : "translateX(0)" }}>
        ↗
      </span>
    </a>
  );
}

/* SVG Icons */
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const WebIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function Contact({ profile }: ContactProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [panelHovered, setPanelHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePanelMouseMove = (e: React.MouseEvent) => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

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
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const socials = [
    { key: "linkedin", href: profile?.socials?.linkedin, label: "LinkedIn", icon: <LinkedInIcon /> },
    { key: "github",   href: profile?.socials?.github,   label: "GitHub",   icon: <GitHubIcon /> },
    { key: "instagram",href: profile?.socials?.instagram, label: "Instagram",icon: <InstagramIcon /> },
    { key: "website",  href: profile?.socials?.website,  label: "Website",  icon: <WebIcon /> },
  ].filter(s => s.href);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden border-t py-24 lg:py-32"
      style={{
        background: "linear-gradient(180deg,#09090f 0%,#07070c 100%)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.12) 0%,transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[250px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.08) 0%,transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* CTA Panel */}
        <div
          ref={panelRef}
          data-anim
          onMouseEnter={() => setPanelHovered(true)}
          onMouseLeave={() => setPanelHovered(false)}
          onMouseMove={handlePanelMouseMove}
          className="relative rounded-3xl overflow-hidden"
          style={{
            opacity: 0,
            transform: "translateY(28px)",
            transition: "opacity 0.7s ease, transform 0.7s ease, border-color 0.4s, box-shadow 0.4s",
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${panelHovered ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.07)"}`,
            backdropFilter: "blur(20px)",
            boxShadow: panelHovered ? "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
          }}
        >
          {/* Dynamic spotlight */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(124,58,237,0.12) 0%, transparent 60%)`,
              opacity: panelHovered ? 1 : 0,
            }} />

          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 rounded-b-full pointer-events-none"
            style={{ background: "rgba(124,58,237,0.1)", filter: "blur(24px)" }} />

          <div className="relative p-6 sm:p-8 lg:p-14">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-10">

              {/* Left text */}
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
                  <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Let&apos;s Talk</p>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-snug">
                  Open to new<br />
                  <span style={{
                    background: "linear-gradient(135deg,#e2d9f3 0%,#a78bfa 50%,#7c3aed 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    opportunities
                  </span>
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                  Have a project in mind or just want to connect? Feel free to reach out—I&apos;d love to hear from you.
                </p>

                {/* Availability indicator */}
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </div>
                  <span className="text-xs font-mono" style={{ color: "#6b7280" }}>
                    Available for freelance &amp; full-time
                  </span>
                </div>
              </div>

              {/* Right links */}
              <div className="flex w-full flex-col gap-3 lg:w-72 lg:shrink-0">
                {socials.length > 0 ? (
                  socials.map(s => (
                    <SocialLink key={s.key} href={s.href!} label={s.label} icon={s.icon} />
                  ))
                ) : (
                  <Button href="mailto:hello@example.com" variant="primary">Say Hello →</Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
       <div
  data-anim
  className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center"
  style={{ 
    opacity: 0, 
    transform: "translateY(10px)", 
    transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s" 
  }}
>
  <p className="w-full text-xs font-mono text-center" style={{ color: "#1f2937" }}>
    {profile?.fullName ?? "Portfolio"} © {new Date().getFullYear()}
  </p>

  <div 
    className="h-px flex-1 hidden sm:block"
    style={{ background: "rgba(255,255,255,0.03)" }} 
  />
</div>
      </div>
    </section>
  );
}
