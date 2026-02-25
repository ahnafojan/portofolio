"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Certificate } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

function formatMonthYear(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", { month: "short", year: "numeric" });
}

/* ─── Modal ─── */
function CertModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
      style={{ transition: "opacity 0.3s ease", opacity: 1, animation: "certOverlayIn 0.24s ease both" }}
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
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)" }} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,#13131e 0%,#0e0e18 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          transform: "translateY(0) scale(1)",
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          animation: "certPanelIn 0.36s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.8),transparent)" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 rounded-b-full pointer-events-none"
          style={{ background: "rgba(124,58,237,0.12)", filter: "blur(20px)" }} />

        {/* Image area */}
        <div className="relative w-full overflow-hidden" style={{ background: "#080810" }}>
          {cert.logo ? (
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <Image
                src={urlFor(cert.logo).width(800).height(450).url()}
                alt={cert.title}
                fill
                className="object-contain"
                style={{ padding: "24px" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                🏅
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-12"
            style={{ background: "linear-gradient(to top,#13131e,transparent)" }} />
        </div>

        {/* Body */}
        <div className="px-7 pb-7 pt-5">
          <h3 className="text-xl font-bold text-white leading-snug">{cert.title}</h3>
          {cert.issuer && (
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#a78bfa" }}>{cert.issuer}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Issued", value: formatMonthYear(cert.issueDate) || "—" },
              { label: "Expires", value: cert.expiryDate ? formatMonthYear(cert.expiryDate) : "No expiry" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            ))}
          </div>

          {cert.credentialId && (
            <div className="mt-3 rounded-xl p-3 group"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "#4b5563" }}>Credential ID</p>
              <p className="text-xs font-mono truncate" style={{ color: "#9ca3af" }}>{cert.credentialId}</p>
            </div>
          )}

          {cert.skills?.length ? (
            <div className="mt-4">
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2.5" style={{ color: "#4b5563" }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full"
                    style={{ color: "#c4b5fd", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.22)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center text-sm font-medium text-white py-3 rounded-xl transition-all duration-200"
                style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
              >
                View Credential ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 text-center text-sm py-3 rounded-xl transition-all duration-200"
              style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.color = "#e5e7eb";
                el.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.color = "#6b7280";
                el.style.background = "rgba(255,255,255,0.04)";
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Card ─── */
function CertCard({ cert, onClick, index }: { cert: Certificate; onClick: () => void; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  // ✅ Semua computed values di luar JSX — tidak ada duplicate keys
  const cardTransform = hovered
    ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(8px) translateY(-4px)`
    : "translateY(0)";

  const cardTransition = hovered
    ? "transform 0.18s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s"
    : `opacity 0.6s ease ${index * 90}ms, transform 0.6s ease ${index * 90}ms, background 0.3s, border-color 0.3s, box-shadow 0.3s`;

  const cardBoxShadow = hovered
    ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(167,139,250,0.15)"
    : "none";

  const cardBackground = hovered
    ? "rgba(255,255,255,0.045)"
    : "rgba(255,255,255,0.025)";

  const cardBorder = hovered
    ? "1px solid rgba(167,139,250,0.2)"
    : "1px solid rgba(255,255,255,0.07)";

  return (
    <div
      ref={cardRef}
      data-anim
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        opacity: 0,
        transform: cardTransform,
        transition: cardTransition,
        boxShadow: cardBoxShadow,
        background: cardBackground,
        border: cardBorder,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Hover overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.08) 0%,transparent 60%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ background: "#07070f", aspectRatio: "16/9" }}>
        {cert.logo ? (
          <Image
            src={urlFor(cert.logo).width(480).height(270).url()}
            alt={cert.title}
            fill
            className="object-contain transition-transform duration-500"
            style={{ padding: "16px", transform: hovered ? "scale(1.05)" : "scale(1)" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl"
              style={{ opacity: hovered ? 0.4 : 0.2, transition: "opacity 0.3s" }}
            >
              🏅
            </span>
          </div>
        )}

        {/* Date chip */}
        {cert.issueDate && (
          <div
            className="absolute top-3 right-3 text-[10px] font-mono px-2.5 py-1 rounded-full"
            style={{
              color: "#9ca3af",
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            {formatMonthYear(cert.issueDate)}
          </div>
        )}

        {/* Verified badge */}
        {cert.credentialUrl && (
          <div
            className="absolute top-3 left-3 text-[10px] font-mono px-2 py-1 rounded-full flex items-center gap-1"
            style={{
              color: "#10b981",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            ✓ Verified
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: "linear-gradient(to top,rgba(13,13,24,0.9),transparent)" }}
        />
      </div>

      {/* Card body */}
      <div className="p-5">
        <p className="font-semibold text-white text-sm leading-snug line-clamp-2">{cert.title}</p>
        {cert.issuer && (
          <p className="text-xs mt-1.5 font-medium" style={{ color: "#7c6fa0" }}>{cert.issuer}</p>
        )}

        {cert.skills?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cert.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  color: "#9ca3af",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {s}
              </span>
            ))}
            {cert.skills.length > 3 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  color: "#6b7280",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                +{cert.skills.length - 3}
              </span>
            )}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-[11px] font-mono flex items-center gap-1 transition-all duration-300"
            style={{ color: hovered ? "#a78bfa" : "#7c3aed" }}
          >
            <span
              className="transition-transform duration-300"
              style={{ transform: hovered ? "translateX(3px)" : "translateX(0)" }}
            >
              See details →
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Section ─── */
export default function Certificates({ items }: { items: Certificate[] }) {
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const sectionRef = useRef<HTMLElement>(null);

  // Get unique issuers for filter
  const issuers = ["All", ...Array.from(new Set(items.map(c => c.issuer).filter(Boolean) as string[]))].slice(0, 6);
  const filtered = filter === "All" ? items : items.filter(c => c.issuer === filter);

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
              }, i * 80);
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
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)", filter: "blur(70px)" }} />
          <div className="absolute bottom-0 right-0 w-[350px] h-[250px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div data-anim style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: "rgba(124,58,237,0.7)" }} />
              <p className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: "#7c3aed" }}>Credentials</p>
            </div>
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Certificates</h2>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {items.length} credential{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Filter pills */}
          {issuers.length > 2 && (
            <div data-anim className="flex flex-wrap gap-2 mb-8" style={{ opacity: 0, transform: "translateY(12px)", transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s" }}>
              {issuers.map((issuer) => (
                <button
                  key={issuer}
                  onClick={() => setFilter(issuer)}
                  className="text-xs px-4 py-1.5 rounded-full font-mono transition-all duration-250"
                  style={filter === issuer
                    ? { color: "#e2d9f3", background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }
                    : { color: "#4b5563", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                  }
                >
                  {issuer}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <CertCard key={c._id} cert={c} index={i} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      </section>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
