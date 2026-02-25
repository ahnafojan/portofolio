/* eslint-disable react/no-unknown-property */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface LanyardProps {
  position?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  cardTexture?: string;   // front photo URL (avatar)
  name?: string;
  role?: string;
  skills?: string[];
  location?: string;
}

// ── Utility: draw the BACK face on a canvas ───────────────────────────────────
function drawBack(
  canvas: HTMLCanvasElement,
  name?: string,
  role?: string,
  skills?: string[],
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#1a1228");
  bg.addColorStop(0.5, "#150f20");
  bg.addColorStop(1,   "#0e0a16");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial violet glow centre
  const glow = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 220);
  glow.addColorStop(0, "rgba(139,92,246,0.18)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top stripe
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0,   "#7c3aed");
  stripe.addColorStop(0.5, "#8b5cf6");
  stripe.addColorStop(1,   "#a78bfa");
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, 7);

  // ── Hexagon logo mark (geometric brand) ──────────────────────
  const hx = W / 2, hy = H * 0.20, hr = 42;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = hx + hr * Math.cos(angle);
    const py = hy + hr * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  const hexFill = ctx.createLinearGradient(hx - hr, hy - hr, hx + hr, hy + hr);
  hexFill.addColorStop(0, "rgba(124,58,237,0.35)");
  hexFill.addColorStop(1, "rgba(167,139,250,0.15)");
  ctx.fillStyle = hexFill;
  ctx.fill();
  ctx.strokeStyle = "rgba(167,139,250,0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Inner hex symbol "< >"
  ctx.fillStyle = "rgba(196,181,253,0.9)";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", hx, hy);

  // ── Name ─────────────────────────────────────────────────────
  const displayName = name || "Your Name";
  ctx.fillStyle = "#f5f3ff";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(displayName, W / 2, H * 0.40);

  // ── Role ─────────────────────────────────────────────────────
  const displayRole = role || "Developer";
  ctx.fillStyle = "rgba(167,139,250,0.85)";
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText(displayRole, W / 2, H * 0.48);

  // Divider line
  ctx.strokeStyle = "rgba(139,92,246,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.15, H * 0.53);
  ctx.lineTo(W * 0.85, H * 0.53);
  ctx.stroke();

  // ── Skills section ────────────────────────────────────────────
  const skillList = skills?.slice(0, 6) || ["React", "TypeScript", "Node.js"];
  const skillLabel = "SKILLS";
  ctx.fillStyle = "rgba(139,92,246,0.6)";
  ctx.font = "700 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText(skillLabel, W / 2, H * 0.58);

  // Skill pills — wrap into two rows
  const pillH  = 28;
  const pillPad = 14;
  const gap = 10;
  const maxW = W - 48;

  ctx.font = "500 13px system-ui, sans-serif";

  // Measure and lay out pills
  type Pill = { text: string; w: number };
  const pills: Pill[] = skillList.map((s) => ({
    text: s,
    w: ctx.measureText(s).width + pillPad * 2,
  }));

  // Pack into rows
  const rows: Pill[][] = [];
  let currentRow: Pill[] = [];
  let rowW = 0;
  for (const pill of pills) {
    if (rowW + pill.w + (currentRow.length ? gap : 0) > maxW) {
      if (currentRow.length) { rows.push(currentRow); currentRow = []; rowW = 0; }
    }
    currentRow.push(pill);
    rowW += pill.w + (currentRow.length > 1 ? gap : 0);
  }
  if (currentRow.length) rows.push(currentRow);

  rows.forEach((row, ri) => {
    const totalW = row.reduce((s, p) => s + p.w, 0) + gap * (row.length - 1);
    let px = (W - totalW) / 2;
    const py = H * 0.63 + ri * (pillH + gap);

    row.forEach((pill) => {
      // pill bg
      ctx.beginPath();
      roundRect(ctx, px, py, pill.w, pillH, 12);
      ctx.fillStyle = "rgba(124,58,237,0.2)";
      ctx.fill();
      ctx.strokeStyle = "rgba(139,92,246,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // pill text
      ctx.fillStyle = "rgba(221,214,254,0.9)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(pill.text, px + pillPad, py + pillH / 2);

      px += pill.w + gap;
    });
  });

  // Bottom stripe
  ctx.fillStyle = stripe;
  ctx.fillRect(0, H - 7, W, 7);

  // Corner dots decorative
  [[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(139,92,246,0.4)";
    ctx.fill();
  });
}

// polyfill roundRect for older safari/firefox
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Lanyard({
  cardTexture,
  name,
  role,
  skills,
  location,
}: LanyardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const ropeRef      = useRef<SVGPolylineElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  const posX  = useRef(0);
  const posY  = useRef(0);
  const velX  = useRef(0);
  const velY  = useRef(0);
  const rotX  = useRef(-8);
  const rotY  = useRef(0);
  const rotVX = useRef(0);
  const rotVY = useRef(0);
  const drag  = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const raf   = useRef(0);

  // flip state — accumulated Y rotation drives CSS flip
  const flipY = useRef(0);       // total Y accumulated (mod 360)
  const flipped = useRef(false); // whether currently showing back

  const [mounted, setMounted]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => setMounted(true), []);

  // Draw back canvas whenever props change
  useEffect(() => {
    if (!mounted || !backCanvasRef.current) return;
    drawBack(backCanvasRef.current, name, role, skills);
  }, [mounted, name, role, skills]);

  // Initial swing
  useEffect(() => {
    if (!mounted) return;
    rotVY.current = 28;
    rotX.current  = -8;
  }, [mounted]);

  // Rope update
  const updateRope = useCallback(() => {
    if (!ropeRef.current || !containerRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const ax = cw / 2;
    const cx = cw / 2 + posX.current;
    const cy = 150 + posY.current;
    const steps = 18;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t   = i / steps;
      const x   = ax + (cx - ax) * t;
      const sag = Math.sin(t * Math.PI) * Math.max(38, Math.abs(cy) * 0.42);
      const y   = (cy) * t + sag;
      pts.push(`${x},${y}`);
    }
    ropeRef.current.setAttribute("points", pts.join(" "));
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!cardRef.current) { raf.current = requestAnimationFrame(animate); return; }

    if (!drag.current) {
      velX.current = (velX.current - posX.current * 0.05) * 0.90;
      velY.current = (velY.current - posY.current * 0.05) * 0.90;
      posX.current += velX.current;
      posY.current += velY.current;

      rotVX.current = (rotVX.current - (rotX.current + 8) * 0.04) * 0.94;
      rotVY.current = (rotVY.current - rotY.current * 0.04)       * 0.94;
      rotX.current  += rotVX.current;
      rotY.current  += rotVY.current;
    }

    const rx = Math.max(-45, Math.min(45, rotX.current));
    const ry = Math.max(-45, Math.min(45, rotY.current));

    // Determine flip from accumulated rotY
    flipY.current += rotVY.current;
    const normalised = ((flipY.current % 360) + 360) % 360;
    const newFlipped = normalised > 90 && normalised < 270;
    if (newFlipped !== flipped.current) {
      flipped.current = newFlipped;
      setIsFlipped(newFlipped);
    }

    // Apply to the wrapper that has transform-style preserve-3d
    cardRef.current.style.transform = `
      translate(calc(-50% + ${posX.current}px), ${150 + posY.current}px)
      rotateX(${rx}deg)
      rotateY(${ry}deg)
    `;

    updateRope();
    raf.current = requestAnimationFrame(animate);
  }, [updateRope]);

  useEffect(() => {
    if (!mounted) return;
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [mounted, animate]);

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current  = true;
    startX.current = e.clientX - posX.current;
    startY.current = e.clientY - posY.current;
    velX.current  = 0;
    velY.current  = 0;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const nx = e.clientX - startX.current;
    const ny = e.clientY - startY.current;
    const dx = nx - posX.current;
    const dy = ny - posY.current;

    rotVY.current += dx * 0.55;
    rotVX.current -= dy * 0.35;
    velX.current   = dx * 0.7;
    velY.current   = dy * 0.7;
    posX.current   = nx;
    posY.current   = ny;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = false;
  }, []);

  // Manual flip on click (no drag)
  const clickStart = useRef<{ x: number; y: number } | null>(null);
  const onCardClick = useCallback(() => {
    // Give a flick to rotate 180°
    rotVY.current += 18;
  }, []);

  if (!mounted) return null;

  const CARD_W = 280;
  const CARD_H = 410;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none overflow-visible"
      style={{ perspective: "1200px", perspectiveOrigin: "50% 0%" }}
    >
      {/* ── Rope SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="40%"  stopColor="#8b5cf6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.7" />
          </linearGradient>
          <filter id="ropeGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ceiling hook */}
        <rect x="50%" y="0" width="18" height="12" rx="3"
          transform="translate(-9,0)"
          fill="#71717a"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
        />

        {/* Rope */}
        <polyline
          ref={ropeRef}
          points="50,0 50,150"
          stroke="url(#ropeGrad)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ropeGlow)"
        />
      </svg>

      {/* ── Card wrapper (physics transform applied here) ── */}
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onCardClick}
        className="absolute top-0 left-1/2 cursor-grab active:cursor-grabbing"
        style={{
          width: CARD_W,
          height: CARD_H,
          transformOrigin: "top center",
          willChange: "transform",
          zIndex: 2,
          transform: `translate(-50%, 150px) rotateX(-8deg)`,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.65))",
        }}
      >
        {/* Metal clip at top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          style={{ top: -14, backfaceVisibility: "hidden" }}
        >
          <div style={{
            width: 18, height: 10, borderRadius: "3px 3px 0 0",
            background: "linear-gradient(180deg,#e4e4e7,#a1a1aa)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }} />
          <div style={{
            width: 10, height: 8, borderRadius: "0 0 3px 3px",
            background: "#71717a",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
          }} />
        </div>

        {/* ── FRONT face ────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {/* Photo / fallback */}
          {cardTexture ? (
            <img
              src={cardTexture}
              alt="ID Card Front"
              className="w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              style={{ display: imgLoaded ? "block" : "none" }}
            />
          ) : null}

          {/* Fallback / overlay when no texture or loading */}
          <div
            className="absolute inset-0 flex flex-col"
            style={{
              background: "linear-gradient(160deg,#1c1030 0%,#140e22 50%,#0e0a18 100%)",
              display: cardTexture && imgLoaded ? "none" : "flex",
            }}
          >
            {/* Top stripe */}
            <div style={{ height: 7, background: "linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", flexShrink: 0 }} />

            {/* Avatar placeholder */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6 flex-1">
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(167,139,250,0.2))",
                border: "2px solid rgba(139,92,246,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <p style={{ color: "#f5f3ff", fontWeight: 700, fontSize: 20, textAlign: "center", marginBottom: 4 }}>
                {name || "Your Name"}
              </p>
              <p style={{ color: "rgba(167,139,250,0.85)", fontSize: 13, textAlign: "center", marginBottom: 12 }}>
                {role || "Developer"}
              </p>

              {location && (
                <p style={{ color: "rgba(139,92,246,0.6)", fontSize: 11, fontFamily: "monospace", textAlign: "center", marginBottom: 12 }}>
                  📍 {location}
                </p>
              )}

              <div style={{ width: "70%", height: 1, background: "rgba(139,92,246,0.2)", marginBottom: 14 }} />

              {/* ID badge area */}
              <div style={{
                width: "100%", padding: "8px 12px", borderRadius: 10,
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
                textAlign: "center",
              }}>
                <p style={{ color: "rgba(196,181,253,0.7)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  VISITOR PASS
                </p>
              </div>
            </div>

            {/* Bottom stripe */}
            <div style={{ height: 7, background: "linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", flexShrink: 0 }} />
          </div>

          {/* Overlay on top of photo — name strip */}
          {cardTexture && imgLoaded && (
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ background: "linear-gradient(to top,rgba(10,6,20,0.92) 60%,transparent)" }}
            >
              <div className="px-5 pb-5 pt-10">
                <p style={{ color: "#f5f3ff", fontWeight: 700, fontSize: 17 }}>{name || "Your Name"}</p>
                <p style={{ color: "rgba(167,139,250,0.85)", fontSize: 12, marginTop: 2 }}>{role || "Developer"}</p>
                {location && (
                  <p style={{ color: "rgba(139,92,246,0.55)", fontSize: 10, fontFamily: "monospace", marginTop: 4 }}>📍 {location}</p>
                )}
              </div>
            </div>
          )}

          {/* Glass sheen */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 50%)",
          }} />
        </div>

        {/* ── BACK face ─────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <canvas
            ref={backCanvasRef}
            width={560}
            height={820}
            className="w-full h-full"
          />
          {/* Glass sheen */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 50%)",
          }} />
        </div>

        {/* ── Flip hint ── shown when card is facing front, fades after 3s ── */}
        <FlipHint />
      </div>

      {/* ── Subtle shadow beneath card ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 30,
          borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(124,58,237,0.25) 0%,transparent 70%)",
          filter: "blur(12px)",
        }}
      />
    </div>
  );
}

// ── Flip hint tooltip that fades after 3 s ──────────────────────────────────
function FlipHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5"
      style={{
        bottom: -36,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
        whiteSpace: "nowrap",
        backfaceVisibility: "hidden",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="2">
        <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
      <span style={{ color: "rgba(167,139,250,0.55)", fontSize: 11, fontFamily: "monospace" }}>
        drag to flip
      </span>
    </div>
  );
}
