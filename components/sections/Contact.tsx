"use client";

import { useEffect, useRef } from "react";
import { Profile } from "@/lib/types";
import Button from "@/components/ui/Button";

interface ContactProps { profile: Profile | null; }

export default function Contact({ profile }: ContactProps) {
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
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[250px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* top accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.25),transparent)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* CTA Panel */}
        <div
          data-anim
          className="relative rounded-3xl p-10 lg:p-14 overflow-hidden"
          style={{
            opacity: 0,
            transform: "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Panel inner glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 rounded-b-full"
            style={{ background: "rgba(124,58,237,0.08)", filter: "blur(20px)" }} />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="flex flex-col gap-4 max-w-md">
              <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "#6b7280" }}>Let&apos;s talk</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-snug">
                Open to new<br />
                <span className="font-light" style={{ color: "#9ca3af" }}>opportunities</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
                Have a project in mind or just want to connect? Feel free to reach out—I&apos;d love to hear from you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 shrink-0">
              {profile?.socials?.linkedin && (
                <Button href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" variant="primary">
                  LinkedIn ↗
                </Button>
              )}
              {profile?.socials?.github && (
                <Button href={profile.socials.github} target="_blank" rel="noopener noreferrer" variant="outline">
                  GitHub ↗
                </Button>
              )}
              {profile?.socials?.instagram && (
                <Button href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" variant="ghost">
                  Instagram ↗
                </Button>
              )}
              {profile?.socials?.website && (
                <Button href={profile.socials.website} target="_blank" rel="noopener noreferrer" variant="ghost">
                  Website ↗
                </Button>
              )}
              {!profile?.socials && (
                <Button href="mailto:hello@example.com" variant="primary">Say Hello →</Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          data-anim
          className="mt-12 text-center"
          style={{ opacity: 0, transform: "translateY(10px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
        >
          <p className="text-xs font-mono" style={{ color: "#374151" }}>
            {profile?.fullName ?? "Portfolio"} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </section>
  );
}
