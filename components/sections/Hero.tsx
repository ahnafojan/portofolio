"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { urlFor } from "@/lib/sanity";
import { Profile, Skill } from "@/lib/types";

const SolarSystem = dynamic(() => import("@/components/SolarSystem"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-16 w-16">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid rgba(124,58,237,0.35)",
            borderTopColor: "rgba(167,139,250,0.95)",
            animation: "heroSpin 1s linear infinite",
          }}
        />
      </div>
    </div>
  ),
});

const FALLBACK_SKILLS: Skill[] = [
  { _id: "hero-skill-1", name: "Next.js", level: 5, category: "Frontend" },
  { _id: "hero-skill-2", name: "TypeScript", level: 5, category: "Frontend" },
  { _id: "hero-skill-3", name: "React", level: 5, category: "Frontend" },
  { _id: "hero-skill-4", name: "Node.js", level: 4, category: "Backend" },
  { _id: "hero-skill-5", name: "Tailwind", level: 4, category: "Frontend" },
  { _id: "hero-skill-6", name: "Sanity", level: 4, category: "Tools" },
  { _id: "hero-skill-7", name: "PostgreSQL", level: 3, category: "Database" },
  { _id: "hero-skill-8", name: "Docker", level: 3, category: "DevOps" },
];

interface HeroProps {
  profile: Profile | null;
  skills?: Skill[];
}

interface MetricCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

function MetricCounter({ value, label, suffix = "" }: MetricCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rafId = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const duration = 900;
        const startedAt = performance.now();

        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) {
            rafId = window.requestAnimationFrame(tick);
          }
        };

        rafId = window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.6 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <div ref={ref} className="flex min-w-20 flex-col gap-1">
      <span className="text-2xl font-semibold text-white tabular-nums">
        {display}
        {suffix}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</span>
    </div>
  );
}

export default function Hero({ profile, skills = [] }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  const [pointer, setPointer] = useState({ x: 50, y: 42 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const curatedSkills = useMemo(() => {
    const source = skills.length > 0 ? [...skills] : FALLBACK_SKILLS;
    return source
      .sort((a, b) => {
        const byLevel = (b.level ?? 0) - (a.level ?? 0);
        if (byLevel !== 0) return byLevel;
        return (a.order ?? 0) - (b.order ?? 0);
      })
      .slice(0, 8);
  }, [skills]);

  const activeSkill = useMemo(() => {
    if (!curatedSkills.length) return null;
    if (selectedSkill && curatedSkills.some((skill) => skill.name === selectedSkill)) {
      return selectedSkill;
    }
    return curatedSkills[0].name;
  }, [curatedSkills, selectedSkill]);

  useEffect(() => {
    if (!leftRef.current) return;

    const items = Array.from(leftRef.current.querySelectorAll<HTMLElement>("[data-reveal]"));
    items.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(24px)";
      item.style.transition = `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 90}ms`;
    });

    const timer = window.setTimeout(() => {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      });
    }, 90);

    return () => window.clearTimeout(timer);
  }, []);

  const fullName = profile?.fullName?.trim() || "Your Name";
  const [firstName, ...restName] = fullName.split(" ");
  const lastName = restName.join(" ");

  const socialLinks = [
    { href: profile?.socials?.github, label: "GitHub" },
    { href: profile?.socials?.linkedin, label: "LinkedIn" },
    { href: profile?.socials?.instagram, label: "Instagram" },
    { href: profile?.socials?.website, label: "Website" },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href));

  const skillCount = skills.length > 0 ? skills.length : curatedSkills.length;
  const socialCount = socialLinks.length;
  const topLevel = curatedSkills.reduce((max, skill) => Math.max(max, skill.level ?? 0), 0);

  const headline = profile?.headline || "Full Stack Developer";
  const aboutText =
    profile?.about ||
    "I design and build web experiences that feel fast, clear, and memorable.";

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPointer({ x, y });
    setParallax({
      x: (x - 50) * 0.22,
      y: (y - 50) * 0.2,
    });
  };

  const resetParallax = () => {
    setParallax({ x: 0, y: 0 });
    setPointer({ x: 50, y: 42 });
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative flex min-h-screen scroll-mt-24 items-center overflow-hidden border-b"
      style={{
        borderColor: "rgba(255,255,255,0.05)",
        background: "linear-gradient(165deg,#08080f 0%,#0a0a14 52%,#0c0c18 100%)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
    >
      <style>{`
        @keyframes heroSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-20px); opacity: 0.75; }
        }
        @keyframes heroScan {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 15% 5%, rgba(124,58,237,0.2) 0%, transparent 55%), radial-gradient(80% 70% at 90% 15%, rgba(99,102,241,0.16) 0%, transparent 60%), radial-gradient(90% 90% at 50% 90%, rgba(124,58,237,0.12) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(167,139,250,0.2) 0%, rgba(124,58,237,0.08) 28%, transparent 62%)`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)",
          }}
        />
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.22), transparent)",
            animation: "heroScan 8s linear infinite",
          }}
        />

        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className="absolute block rounded-full"
            style={{
              width: `${index % 3 === 0 ? 5 : 3}px`,
              height: `${index % 3 === 0 ? 5 : 3}px`,
              left: `${8 + index * 10}%`,
              top: `${index % 2 === 0 ? 14 + index * 7 : 24 + index * 6}%`,
              background: "rgba(167,139,250,0.55)",
              filter: "blur(0.4px)",
              animation: `heroFloat ${3.6 + index * 0.4}s ease-in-out ${index * 0.25}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-28 lg:px-8 lg:pb-16 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div
            ref={leftRef}
            className="flex flex-col gap-7"
            style={{ transform: `translate3d(${parallax.x * 0.2}px, ${parallax.y * 0.24}px, 0)` }}
          >
            <div data-reveal className="flex items-center gap-4">
              {profile?.avatar ? (
                <div
                  className="relative h-14 w-14 overflow-hidden rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 2px rgba(124,58,237,0.45), 0 0 24px rgba(124,58,237,0.3)",
                  }}
                >
                  <Image
                    src={urlFor(profile.avatar).width(160).height(160).url()}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.35)",
                    color: "#c4b5fd",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  DEV
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-mono tracking-[0.2em] uppercase text-emerald-400">
                    Available
                  </span>
                </div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
                  {profile?.location || "Remote / Hybrid"}
                </p>
              </div>
            </div>

            <div data-reveal className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-px w-10"
                  style={{
                    background: "linear-gradient(90deg, rgba(124,58,237,0.95), transparent)",
                  }}
                />
                <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-violet-400">Portfolio</p>
              </div>

              <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
                {firstName}
                <br />
                <span
                  style={{
                    background: "linear-gradient(140deg,#ede9fe 0%,#a78bfa 48%,#7c3aed 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {lastName || "Developer"}
                </span>
              </h1>

              <p className="max-w-xl text-lg font-light text-zinc-300">{headline}</p>
            </div>

            <div
              data-reveal
              className="max-w-xl whitespace-pre-line border-l-2 pl-5 text-sm leading-relaxed text-zinc-400"
              style={{ borderColor: "rgba(124,58,237,0.4)" }}
            >
              {aboutText}
            </div>

            <div data-reveal className="flex flex-wrap items-center gap-3">
              <Button href="/projects" variant="primary">
                View Projects
              </Button>
              {profile?.socials?.github ? (
                <Button
                  href={profile.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                >
                  GitHub -&gt;
                </Button>
              ) : null}
            </div>

            <div data-reveal className="flex flex-wrap items-center gap-4">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-zinc-500 transition-colors duration-300 hover:text-violet-300"
                >
                  <span className="h-px w-0 bg-violet-400 transition-all duration-300 group-hover:w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div data-reveal className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
                Orbit Focus
              </p>
              <div className="flex flex-wrap gap-2.5">
                {curatedSkills.slice(0, 6).map((skill) => {
                  const isActive = activeSkill === skill.name;
                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => setSelectedSkill(skill.name)}
                      onMouseEnter={() => setSelectedSkill(skill.name)}
                      className="rounded-full px-3 py-1.5 text-xs font-mono transition-all duration-250"
                      style={{
                        color: isActive ? "#ede9fe" : "#9ca3af",
                        background: isActive ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isActive ? "rgba(124,58,237,0.52)" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: isActive ? "0 0 20px rgba(124,58,237,0.18)" : "none",
                      }}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              data-reveal
              className="flex flex-wrap items-center gap-6 border-t pt-5"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <MetricCounter value={skillCount} label="Skills" suffix="+" />
              <div className="h-9 w-px bg-white/8" />
              <MetricCounter value={socialCount} label="Links" />
              <div className="h-9 w-px bg-white/8" />
              <MetricCounter value={Math.max(topLevel, 1)} label="Top Level" suffix="/5" />
            </div>
          </div>

          <div className="relative h-[520px] w-full sm:h-[580px] lg:h-[620px]">
            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem] border"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "linear-gradient(160deg,rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)",
                boxShadow: "0 26px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
              <div className="relative z-20 flex items-center justify-between px-5 pt-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Skill Galaxy</p>
                  <p className="text-sm text-zinc-200">Interactive stack map</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.12em]"
                  style={{
                    color: "#a78bfa",
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.35)",
                  }}
                >
                  drag / scroll / dbl-click
                </span>
              </div>

              <div className="relative h-[calc(100%-3.6rem)]">
                <SolarSystem
                  profile={profile}
                  skills={curatedSkills}
                  focusSkill={activeSkill}
                  onSkillHighlightChange={setSelectedSkill}
                />
              </div>
            </div>

            <div
              className="pointer-events-none absolute -left-10 top-14 h-40 w-40 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
                filter: "blur(35px)",
              }}
            />
            <div
              className="pointer-events-none absolute -bottom-8 right-2 h-44 w-44 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 72%)",
                filter: "blur(36px)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
