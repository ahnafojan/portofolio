"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Certificate, SanityImage } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

function formatMonthYear(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", { month: "short", year: "numeric" });
}

function getCertificateLogos(cert: Certificate): SanityImage[] {
  if (cert.logos && cert.logos.length > 0) return cert.logos;
  if (cert.logo) return [cert.logo];
  return [];
}

function LogoCarousel({
  logos,
  title,
  size,
}: {
  logos: SanityImage[];
  title: string;
  size: "card" | "modal";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = logos.length > 1;
  const isModal = size === "modal";

  useEffect(() => {
    setActiveIndex(0);
  }, [logos.length]);

  const prev = () => {
    setActiveIndex((current) => (current - 1 + logos.length) % logos.length);
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % logos.length);
  };

  if (logos.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-20 w-20 rounded-2xl"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (!hasMultiple || touchStartX.current === null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        if (Math.abs(delta) < 40) return;
        if (delta < 0) next();
        if (delta > 0) prev();
      }}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {logos.map((logo, index) => (
          <div key={logo.asset?._ref ?? `${title}-${index}`} className="relative h-full w-full shrink-0">
            <Image
              src={urlFor(logo).width(isModal ? 1400 : 560).height(isModal ? 900 : 360).url()}
              alt={`${title} logo ${index + 1}`}
              fill
              className="object-contain"
              style={{ padding: isModal ? "24px" : "14px" }}
            />
          </div>
        ))}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Previous logo"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 text-sm"
            style={{
              color: "#e5e7eb",
              background: "rgba(0,0,0,0.52)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Next logo"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1.5 text-sm"
            style={{
              color: "#e5e7eb",
              background: "rgba(0,0,0,0.52)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {">"}
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {logos.map((_, index) => (
              <button
                key={`${title}-dot-${index}`}
                type="button"
                aria-label={`Show logo ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: activeIndex === index ? "18px" : "8px",
                  background: activeIndex === index ? "#a78bfa" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>

          <div
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-mono"
            style={{
              color: "#e5e7eb",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {activeIndex + 1}/{logos.length}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CertModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const logos = useMemo(() => getCertificateLogos(cert), [cert]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ animation: "certOverlayIn 0.24s ease both" }}
    >
      <style>{`
        @keyframes certOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes certPanelIn {
          from { transform: translateY(24px) scale(0.96); opacity: 0.7; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(24px)" }} />

      <div
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,#13131e 0%,#0e0e18 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          animation: "certPanelIn 0.36s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div className="grid lg:grid-cols-[1.25fr_1fr]">
          <div className="relative border-b border-white/10 bg-[#080810] lg:border-b-0 lg:border-r">
            <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
              <LogoCarousel logos={logos} title={cert.title} size="modal" />
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto px-6 pb-6 pt-5 lg:px-7 lg:pb-7 lg:pt-6">
            <h3 className="text-xl font-bold leading-snug text-white">{cert.title}</h3>
            {cert.issuer ? <p className="mt-1.5 text-sm font-medium text-violet-300">{cert.issuer}</p> : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Issued", value: formatMonthYear(cert.issueDate) || "-" },
                { label: "Expires", value: cert.expiryDate ? formatMonthYear(cert.expiryDate) : "No expiry" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">{label}</p>
                  <p className="text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>

            {cert.credentialId ? (
              <div
                className="mt-3 rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Credential ID</p>
                <p className="truncate text-xs font-mono text-zinc-300">{cert.credentialId}</p>
              </div>
            ) : null}

            {cert.skills?.length ? (
              <div className="mt-4">
                <p className="mb-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        color: "#c4b5fd",
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(124,58,237,0.22)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              {cert.credentialUrl ? (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl py-3 text-center text-sm font-medium text-white transition-all duration-200"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
                >
                  View Credential
                </a>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl py-3 text-center text-sm transition-all duration-200"
                style={{
                  color: "#9ca3af",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertCard({ cert, onClick, index }: { cert: Certificate; onClick: () => void; index: number }) {
  const logos = useMemo(() => getCertificateLogos(cert), [cert]);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  const cardTransform = hovered
    ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(8px) translateY(-4px)`
    : "translateY(0)";

  const cardTransition = hovered
    ? "transform 0.18s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s"
    : `opacity 0.6s ease ${index * 90}ms, transform 0.6s ease ${index * 90}ms, background 0.3s, border-color 0.3s, box-shadow 0.3s`;

  return (
    <div
      ref={cardRef}
      data-anim
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      className="relative cursor-pointer select-none overflow-hidden rounded-2xl"
      style={{
        opacity: 0,
        transform: cardTransform,
        transition: cardTransition,
        boxShadow: hovered ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(167,139,250,0.15)" : "none",
        background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)",
        border: hovered ? "1px solid rgba(167,139,250,0.2)" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.08) 0%,transparent 60%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative w-full overflow-hidden" style={{ background: "#07070f", aspectRatio: "16/9" }}>
        <LogoCarousel logos={logos} title={cert.title} size="card" />

        {cert.issueDate ? (
          <div
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-mono"
            style={{
              color: "#9ca3af",
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            {formatMonthYear(cert.issueDate)}
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{cert.title}</p>
        {cert.issuer ? <p className="mt-1.5 text-xs font-medium text-violet-300/80">{cert.issuer}</p> : null}

        {cert.skills?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cert.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  color: "#9ca3af",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {skill}
              </span>
            ))}
            {cert.skills.length > 3 ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{
                  color: "#6b7280",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                +{cert.skills.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-mono" style={{ color: hovered ? "#a78bfa" : "#7c3aed" }}>
            See details -&gt;
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Certificates({ items }: { items: Certificate[] }) {
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const sectionRef = useRef<HTMLElement>(null);

  const issuers = ["All", ...Array.from(new Set(items.map((item) => item.issuer).filter(Boolean) as string[]))].slice(
    0,
    6
  );
  const filtered = filter === "All" ? items : items.filter((item) => item.issuer === filter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll<HTMLElement>("[data-anim]");
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.style.opacity = "1";
                element.style.transform = "translateY(0)";
              }, index * 80);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!items?.length) return null;

  return (
    <>
      <section
        id="certificates"
        ref={sectionRef}
        className="relative scroll-mt-24 overflow-hidden border-t py-24 lg:py-32"
        style={{
          background: "linear-gradient(180deg,#09090f 0%,#0b0b14 100%)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/3 top-0 h-[300px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(70px)" }}
          />
          <div
            className="absolute bottom-0 right-0 h-[250px] w-[350px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(60px)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
          <div
            data-anim
            style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
              <p className="text-xs font-mono uppercase tracking-[0.25em]" style={{ color: "#7c3aed" }}>
                Credentials
              </p>
            </div>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Certificates</h2>
              <span
                className="rounded-full px-3 py-1.5 text-xs font-mono"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {items.length} credential{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {issuers.length > 2 ? (
            <div
              data-anim
              className="mb-8 flex flex-wrap gap-2"
              style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}
            >
              {issuers.map((issuer) => (
                <button
                  key={issuer}
                  type="button"
                  onClick={() => setFilter(issuer)}
                  className="rounded-full px-4 py-1.5 text-xs font-mono transition-all duration-200"
                  style={
                    filter === issuer
                      ? { color: "#e2d9f3", background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }
                      : { color: "#4b5563", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {issuer}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((certificate, index) => (
              <CertCard key={certificate._id} cert={certificate} index={index} onClick={() => setSelected(certificate)} />
            ))}
          </div>
        </div>
      </section>

      {selected ? <CertModal cert={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
