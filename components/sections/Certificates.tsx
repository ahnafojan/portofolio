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

function sanitizeIssuer(value?: string) {
  return (
    value
      ?.normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function normalizeIssuer(value?: string) {
  return sanitizeIssuer(value).toLowerCase();
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
      data-cert-logo-carousel="true"
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
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
      onClick={onClose}
      style={{
        animation: "certOverlayIn 0.24s ease both",
        paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)",
        paddingLeft: "calc(env(safe-area-inset-left) + 0.5rem)",
        paddingRight: "calc(env(safe-area-inset-right) + 0.5rem)",
      }}
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
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
        style={{
          maxHeight: "calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1rem)",
          background: "linear-gradient(135deg,#13131e 0%,#0e0e18 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          animation: "certPanelIn 0.36s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full sm:right-4 sm:top-4"
          style={{
            color: "#e5e7eb",
            background: "rgba(0,0,0,0.58)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[1.25fr_1fr] lg:grid-rows-1">
          <div className="relative border-b border-white/10 bg-[#080810] lg:border-b-0 lg:border-r">
            <div className="relative h-[28svh] min-h-[190px] w-full sm:h-[32svh] lg:h-full lg:min-h-[460px]">
              <LogoCarousel key={`${cert._id}-modal`} logos={logos} title={cert.title} size="modal" />
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-7 lg:pb-7 lg:pt-6">
            <h3 className="pr-12 text-xl font-bold leading-snug text-white">{cert.title}</h3>
            {cert.issuer ? <p className="mt-1.5 text-sm font-medium text-violet-300">{cert.issuer}</p> : null}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            <div
              className="sticky bottom-0 mt-6 -mx-4 px-4 pt-3 sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,14,24,0.98) 0%, rgba(14,14,24,0.92) 60%, rgba(14,14,24,0) 100%)",
                paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
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
    </div>
  );
}

function CertCard({
  cert,
  onClick,
  index,
  revealed,
}: {
  cert: Certificate;
  onClick: () => void;
  index: number;
  revealed: boolean;
}) {
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
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      className="relative w-full cursor-pointer select-none overflow-hidden rounded-2xl"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? cardTransform : "translateY(28px)",
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

      <div className="relative w-full overflow-hidden aspect-[16/10] sm:aspect-video" style={{ background: "#07070f" }}>
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

      <div className="p-4 sm:p-5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[15px]">{cert.title}</p>
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
  const [filter, setFilter] = useState<string>("all");
  const [revealed, setRevealed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pageTouchStartX = useRef<number | null>(null);
  const pageTouchStartY = useRef<number | null>(null);

  const issuerGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; items: Certificate[] }>();

    items.forEach((item) => {
      const label = sanitizeIssuer(item.issuer);
      const key = normalizeIssuer(label);
      if (!key || !label) return;

      const existing = groups.get(key);
      if (existing) {
        existing.items.push(item);
        return;
      }

      groups.set(key, { key, label, items: [item] });
    });

    return [{ key: "all", label: "All", items }, ...Array.from(groups.values())];
  }, [items]);

  const activeFilter = issuerGroups.some((group) => group.key === filter) ? filter : "all";
  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : issuerGroups.find((group) => group.key === activeFilter)?.items ?? [],
    [activeFilter, issuerGroups, items]
  );
  const cardsPerPage = 6;
  const pages = useMemo(() => {
    const chunks: Certificate[][] = [];
    for (let index = 0; index < filtered.length; index += cardsPerPage) {
      chunks.push(filtered.slice(index, index + cardsPerPage));
    }
    return chunks;
  }, [filtered]);
  const totalPages = pages.length;
  const safePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;
  const canSwipePages = activeFilter === "all" && totalPages > 1;

  const handlePageTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canSwipePages) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-cert-logo-carousel="true"]')) {
      pageTouchStartX.current = null;
      pageTouchStartY.current = null;
      return;
    }

    pageTouchStartX.current = event.touches[0]?.clientX ?? null;
    pageTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handlePageTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canSwipePages || pageTouchStartX.current === null || pageTouchStartY.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? pageTouchStartX.current;
    const endY = event.changedTouches[0]?.clientY ?? pageTouchStartY.current;
    const deltaX = endX - pageTouchStartX.current;
    const deltaY = endY - pageTouchStartY.current;

    pageTouchStartX.current = null;
    pageTouchStartY.current = null;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      setCurrentPage((page) => Math.min(totalPages - 1, page + 1));
      return;
    }

    setCurrentPage((page) => Math.max(0, page - 1));
  };

  const handlePageTouchCancel = () => {
    pageTouchStartX.current = null;
    pageTouchStartY.current = null;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
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
            <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold text-white lg:text-4xl">Certificates</h2>
              <span
                className="rounded-full px-3 py-1.5 text-xs font-mono"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {items.length} credential{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {issuerGroups.length > 2 ? (
            <div
              data-anim
              className="mb-8 flex flex-wrap gap-2"
              style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}
            >
              {issuerGroups.map((group) => (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => {
                    setFilter(group.key);
                    setCurrentPage(0);
                  }}
                  className="rounded-full px-4 py-1.5 text-xs font-mono transition-all duration-200"
                  style={
                    activeFilter === group.key
                      ? { color: "#e2d9f3", background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }
                      : { color: "#4b5563", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {group.label}
                </button>
              ))}
            </div>
          ) : null}

          {filtered.length > 0 ? (
            <div className="space-y-4">
              <div
                className="overflow-hidden"
                onTouchStart={handlePageTouchStart}
                onTouchEnd={handlePageTouchEnd}
                onTouchCancel={handlePageTouchCancel}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${safePage * 100}%)` }}
                >
                  {pages.map((pageItems, pageIndex) => (
                    <div key={`certificate-page-${pageIndex}`} className="w-full shrink-0">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                        {pageItems.map((certificate, index) => (
                          <CertCard
                            key={certificate._id}
                            cert={certificate}
                            index={index}
                            revealed={revealed}
                            onClick={() => setSelected(certificate)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeFilter === "all" && totalPages > 1 ? (
                <div
                  className="flex flex-col gap-3 rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <p className="text-center text-xs font-mono uppercase tracking-[0.12em] text-zinc-500 sm:text-left">
                    Page {safePage + 1} / {totalPages}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(0, Math.min(page, safePage) - 1))}
                      disabled={safePage === 0}
                      aria-label="Previous certificate page"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                      style={{
                        color: safePage === 0 ? "#52525b" : "#d4d4d8",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M15 6L9 12L15 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {pages.map((_unused, pageIndex) => (
                        <button
                          key={`certificate-page-dot-${pageIndex}`}
                          type="button"
                          aria-label={`Go to certificate page ${pageIndex + 1}`}
                          onClick={() => setCurrentPage(pageIndex)}
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: safePage === pageIndex ? "18px" : "8px",
                            background:
                              safePage === pageIndex
                                ? "rgba(167,139,250,0.95)"
                                : "rgba(255,255,255,0.3)",
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages - 1, Math.max(page, safePage) + 1))
                      }
                      disabled={safePage >= totalPages - 1}
                      aria-label="Next certificate page"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                      style={{
                        color: safePage >= totalPages - 1 ? "#52525b" : "#ede9fe",
                        background:
                          safePage >= totalPages - 1
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(124,58,237,0.24)",
                        border:
                          safePage >= totalPages - 1
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(124,58,237,0.45)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M9 6L15 12L9 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              className="rounded-2xl border px-6 py-10 text-center"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <p className="text-sm text-zinc-400">No certificates found for this issuer.</p>
            </div>
          )}
        </div>
      </section>

      {selected ? <CertModal cert={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}
