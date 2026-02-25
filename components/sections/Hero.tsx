"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Profile } from "@/lib/types";
import { Skill } from "@/lib/types";
import { urlFor } from "@/lib/sanity";
import Button from "@/components/ui/Button";

const Lanyard = dynamic(() => import("@/components/Lanyard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-16 h-16 rounded-full animate-spin"
        style={{ border: "2px solid rgba(124,58,237,0.2)", borderTopColor: "rgba(124,58,237,0.8)" }}
      />
    </div>
  ),
});

interface HeroProps {
  profile: Profile | null;
  skills?: Skill[];
}

export default function Hero({ profile, skills }: HeroProps) {
  const cardTextureUrl = profile?.avatar
    ? urlFor(profile.avatar).width(630).height(900).url()
    : undefined;

  // Extract top skill names (max 6) for Lanyard back face
  const topSkills = skills
    ?.filter((s) => s.level && s.level >= 3)
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .slice(0, 6)
    .map((s) => s.name);

  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leftRef.current) return;
    const children = Array.from(leftRef.current.children) as HTMLElement[];
    children.forEach((child, i) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(20px)";
      child.style.transition = `opacity 0.6s ease ${i * 110}ms, transform 0.6s ease ${i * 110}ms`;
      setTimeout(() => {
        child.style.opacity = "1";
        child.style.transform = "translateY(0)";
      }, 100 + i * 120);
    });
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0f0f18 0%,#0c0c14 50%,#0e0e18 100%)" }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Orbs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.1) 0%,transparent 65%)", filter: "blur(80px)" }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        {/* Bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.2),transparent)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full py-24 lg:py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">

          {/* ── Left: Text ── */}
          <div ref={leftRef} className="flex flex-col gap-6">
            {profile?.avatar && (
              <div
                className="relative w-14 h-14 rounded-full overflow-hidden"
                style={{ boxShadow: "0 0 0 2px rgba(124,58,237,0.35), 0 0 24px rgba(124,58,237,0.2)" }}
              >
                <Image
                  src={urlFor(profile.avatar).width(112).height(112).url()}
                  alt={profile.fullName ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              {profile?.location && (
                <span
                  className="text-xs font-mono tracking-widest uppercase flex items-center gap-2"
                  style={{ color: "#6b7280" }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {profile.location}
                </span>
              )}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                {profile?.fullName ?? "Your Name"}
              </h1>
              {profile?.headline && (
                <p className="text-xl font-light" style={{ color: "#9ca3af" }}>
                  {profile.headline}
                </p>
              )}
            </div>

            {profile?.about && (
              <p
                className="text-sm leading-relaxed max-w-md pl-4"
                style={{ color: "#6b7280", borderLeft: "2px solid rgba(124,58,237,0.35)" }}
              >
                {profile.about.slice(0, 200)}{profile.about.length > 200 ? "…" : ""}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href="/projects" variant="primary">View Projects</Button>
              {profile?.socials?.github && (
                <Button href={profile.socials.github} target="_blank" rel="noopener noreferrer" variant="outline">
                  GitHub
                </Button>
              )}
            </div>

            {profile?.socials && (
              <div className="flex items-center gap-5 pt-1">
                {profile.socials.linkedin && (
                  <Link
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono tracking-wider uppercase transition-colors duration-200"
                    style={{ color: "#4b5563" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#e5e7eb"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#4b5563"; }}
                  >
                    LinkedIn
                  </Link>
                )}
                {profile.socials.instagram && (
                  <Link
                    href={profile.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono tracking-wider uppercase transition-colors duration-200"
                    style={{ color: "#4b5563" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#e5e7eb"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#4b5563"; }}
                  >
                    Instagram
                  </Link>
                )}
                {profile.socials.website && (
                  <Link
                    href={profile.socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono tracking-wider uppercase transition-colors duration-200"
                    style={{ color: "#4b5563" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#e5e7eb"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#4b5563"; }}
                  >
                    Website
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Lanyard 3D ── */}
          <div className="relative h-[540px] lg:h-[620px] w-full">
            <Lanyard
              cardTexture={cardTextureUrl}
              name={profile?.fullName}
              role={profile?.headline}
              skills={topSkills}
              location={profile?.location}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
