"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Certificate } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

function formatMonthYear(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

/* ─── Modal ─────────────────────────────────────────────── */
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
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity:0 }                        to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(18px)" }} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "#13131e",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px z-10"
          style={{ background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.7),transparent)" }} />

        {/* ── Certificate image — full, clear, no blur ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ background: "#0a0a12", minHeight: "220px" }}
        >
          {cert.logo ? (
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <Image
                src={urlFor(cert.logo).width(800).height(450).url()}
                alt={cert.title}
                fill
                className="object-contain"
                style={{ padding: "20px" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
                🏅
              </div>
            </div>
          )}

          {/* Subtle bottom gradient to blend into panel body */}
          <div className="absolute bottom-0 left-0 right-0 h-8"
            style={{ background: "linear-gradient(to top,#13131e,transparent)" }} />
        </div>

        {/* Body */}
        <div className="px-7 pb-7 pt-4">
          <h3 className="text-xl font-bold text-white leading-snug">{cert.title}</h3>
          {cert.issuer && (
            <p className="text-sm mt-1 font-medium" style={{ color: "#a78bfa" }}>{cert.issuer}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="Issued"  value={formatMonthYear(cert.issueDate) || "—"} />
            <InfoBox label="Expires" value={cert.expiryDate ? formatMonthYear(cert.expiryDate) : "No expiry"} />
          </div>

          {cert.credentialId && (
            <div className="mt-3 rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "#6b7280" }}>Credential ID</p>
              <p className="text-sm font-mono truncate" style={{ color: "#9ca3af" }}>{cert.credentialId}</p>
            </div>
          )}

          {cert.skills?.length ? (
            <div className="mt-4">
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#6b7280" }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full"
                    style={{ color: "#c4b5fd", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
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
                className="flex-1 text-center text-sm font-medium text-white py-2.5 rounded-xl transition-opacity duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
              >
                View Credential ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 text-center text-sm py-2.5 rounded-xl transition-colors duration-200 hover:text-white"
              style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "#6b7280" }}>{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────── */
function CertCard({ cert, onClick }: { cert: Certificate; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
        transition: "transform 0.25s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-3px)";
        el.style.borderColor = "rgba(255,255,255,0.14)";
        el.style.background = "rgba(255,255,255,0.045)";
        el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.45)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.background = "rgba(255,255,255,0.025)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.07) 0%,transparent 60%)",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* ── Image area — clear, no blur ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: "#0d0d18", aspectRatio: "16/9" }}
      >
        {cert.logo ? (
          <Image
            src={urlFor(cert.logo).width(480).height(270).url()}
            alt={cert.title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            style={{ padding: "16px" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-25">🏅</span>
          </div>
        )}

        {/* Top-right date chip */}
        {cert.issueDate && (
          <div
            className="absolute top-2.5 right-2.5 text-[10px] font-mono px-2.5 py-1 rounded-full"
            style={{
              color: "#9ca3af",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            {formatMonthYear(cert.issueDate)}
          </div>
        )}

        {/* Bottom fade into card body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: "linear-gradient(to top,rgba(13,13,24,0.9),transparent)" }}
        />
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="font-semibold text-white text-sm leading-snug line-clamp-2">{cert.title}</p>
        {cert.issuer && (
          <p className="text-xs mt-1" style={{ color: "#7c6fa0" }}>{cert.issuer}</p>
        )}

        {cert.skills?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cert.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ color: "#9ca3af", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {s}
              </span>
            ))}
            {cert.skills.length > 3 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                +{cert.skills.length - 3}
              </span>
            )}
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-[11px] font-mono"
            style={{ color: "#7c3aed", transition: "color 0.2s" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#a78bfa"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#7c3aed"; }}
          >
            See details →
          </span>
          {cert.credentialUrl && (
            <span className="text-[10px] font-mono" style={{ color: "#374151" }}>✓ Verified</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Section ────────────────────────────────────────────── */
export default function Certificates({ items }: { items: Certificate[] }) {
  const [selected, setSelected] = useState<Certificate | null>(null);
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
        ref={sectionRef}
        className="relative py-24 lg:py-32 border-t overflow-hidden"
        style={{
          background: "linear-gradient(180deg,#0c0c13 0%,#0e0e16 100%)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.09) 0%,transparent 70%)", filter: "blur(70px)" }} />
          <div className="absolute bottom-0 right-0 w-[350px] h-[250px] rounded-full"
            style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div
            data-anim
            style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
          >
            <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "#6b7280" }}>
              Credentials
            </p>
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Certificates</h2>
              <span
                className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {items.length} credential{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c, i) => (
              <div
                key={c._id}
                data-anim
                style={{ opacity: 0, transform: "translateY(24px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
              >
                <CertCard cert={c} onClick={() => setSelected(c)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
