/* eslint-disable react/no-unknown-property */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface LanyardProps {
  position?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  cardTexture?: string;
  name?: string;
  role?: string;
  skills?: string[];
  location?: string;
}

// ── Draw back face ────────────────────────────────────────────────────────────
function drawBack(
  canvas: HTMLCanvasElement,
  name?: string,
  role?: string,
  skills?: string[],
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  // ── Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#0d0b18");
  bg.addColorStop(0.5, "#100d1e");
  bg.addColorStop(1,   "#0a0812");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = "rgba(124,58,237,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Center radial glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 260);
  glow.addColorStop(0, "rgba(124,58,237,0.22)");
  glow.addColorStop(0.5, "rgba(124,58,237,0.06)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top stripe with shimmer
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0,    "#5b21b6");
  stripe.addColorStop(0.3,  "#7c3aed");
  stripe.addColorStop(0.5,  "#a78bfa");
  stripe.addColorStop(0.7,  "#7c3aed");
  stripe.addColorStop(1,    "#5b21b6");
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, 8);

  // Top stripe glow
  const stripeGlow = ctx.createLinearGradient(0, 0, 0, 30);
  stripeGlow.addColorStop(0, "rgba(167,139,250,0.3)");
  stripeGlow.addColorStop(1, "transparent");
  ctx.fillStyle = stripeGlow;
  ctx.fillRect(0, 0, W, 30);

  // ── Hexagon logo ─────────────────────────────────────────────
  const hx = W / 2, hy = H * 0.19, hr = 48;
  ctx.save();

  // Outer glow ring
  const hexGlow = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr + 20);
  hexGlow.addColorStop(0, "rgba(124,58,237,0.3)");
  hexGlow.addColorStop(1, "transparent");
  ctx.fillStyle = hexGlow;
  ctx.beginPath();
  ctx.arc(hx, hy, hr + 20, 0, Math.PI * 2);
  ctx.fill();

  // Hexagon shape
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = hx + hr * Math.cos(angle);
    const py = hy + hr * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();

  const hexFill = ctx.createLinearGradient(hx - hr, hy - hr, hx + hr, hy + hr);
  hexFill.addColorStop(0, "rgba(124,58,237,0.4)");
  hexFill.addColorStop(1, "rgba(91,33,182,0.2)");
  ctx.fillStyle = hexFill;
  ctx.fill();
  ctx.strokeStyle = "rgba(167,139,250,0.8)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner hex symbol
  ctx.fillStyle = "rgba(221,214,254,0.95)";
  ctx.font = "bold 26px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", hx, hy);
  ctx.restore();

  // ── Name ─────────────────────────────────────────────────────
  ctx.fillStyle = "#f5f3ff";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(167,139,250,0.4)";
  ctx.shadowBlur = 12;
  ctx.fillText(name || "Your Name", W / 2, H * 0.385);
  ctx.shadowBlur = 0;

  // ── Role ─────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(167,139,250,0.88)";
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText(role || "Developer", W / 2, H * 0.455);

  // Location
  if (true) { // always render location block
    ctx.fillStyle = "rgba(107,114,128,0.8)";
    ctx.font = "12px monospace";
    ctx.fillText("◈  Portfolio", W / 2, H * 0.50);
  }

  // Divider
  const divGrad = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
  divGrad.addColorStop(0,   "transparent");
  divGrad.addColorStop(0.4, "rgba(124,58,237,0.4)");
  divGrad.addColorStop(0.6, "rgba(124,58,237,0.4)");
  divGrad.addColorStop(1,   "transparent");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.1, H * 0.535);
  ctx.lineTo(W * 0.9, H * 0.535);
  ctx.stroke();

  // ── Skills label ─────────────────────────────────────────────
  ctx.fillStyle = "rgba(124,58,237,0.7)";
  ctx.font = "700 10px monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.2em";
  ctx.fillText("· SKILLS ·", W / 2, H * 0.573);

  // ── Skill pills ──────────────────────────────────────────────
  const skillList = skills?.slice(0, 6) || ["React", "TypeScript", "Next.js"];
  const pillH   = 30;
  const pillPad = 16;
  const gap     = 10;
  const maxW    = W - 56;

  ctx.font = "500 13px system-ui, sans-serif";

  type Pill = { text: string; w: number };
  const pills: Pill[] = skillList.map((s) => ({
    text: s,
    w: ctx.measureText(s).width + pillPad * 2,
  }));

  const rows: Pill[][] = [];
  let currentRow: Pill[] = [];
  let rowW = 0;
  for (const pill of pills) {
    const needed = pill.w + (currentRow.length ? gap : 0);
    if (rowW + needed > maxW && currentRow.length) {
      rows.push(currentRow); currentRow = []; rowW = 0;
    }
    currentRow.push(pill);
    rowW += needed;
  }
  if (currentRow.length) rows.push(currentRow);

  rows.forEach((row, ri) => {
    const totalW = row.reduce((s, p) => s + p.w, 0) + gap * (row.length - 1);
    let px = (W - totalW) / 2;
    const py = H * 0.608 + ri * (pillH + gap);

    row.forEach((pill) => {
      // Glow behind pill
      const pillGlow = ctx.createRadialGradient(
        px + pill.w / 2, py + pillH / 2, 0,
        px + pill.w / 2, py + pillH / 2, pill.w / 2,
      );
      pillGlow.addColorStop(0, "rgba(124,58,237,0.15)");
      pillGlow.addColorStop(1, "transparent");
      ctx.fillStyle = pillGlow;
      ctx.beginPath();
      roundRect(ctx, px - 4, py - 4, pill.w + 8, pillH + 8, 16);
      ctx.fill();

      // Pill bg
      ctx.beginPath();
      roundRect(ctx, px, py, pill.w, pillH, 12);
      const pillBg = ctx.createLinearGradient(px, py, px + pill.w, py + pillH);
      pillBg.addColorStop(0, "rgba(124,58,237,0.22)");
      pillBg.addColorStop(1, "rgba(91,33,182,0.14)");
      ctx.fillStyle = pillBg;
      ctx.fill();
      ctx.strokeStyle = "rgba(139,92,246,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pill text
      ctx.fillStyle = "rgba(221,214,254,0.92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pill.text, px + pill.w / 2, py + pillH / 2);

      px += pill.w + gap;
    });
  });

  // Bottom stripe
  ctx.fillStyle = stripe;
  ctx.fillRect(0, H - 8, W, 8);

  // Bottom glow
  const bottomGlow = ctx.createLinearGradient(0, H - 40, 0, H);
  bottomGlow.addColorStop(0, "transparent");
  bottomGlow.addColorStop(1, "rgba(167,139,250,0.2)");
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, H - 40, W, 40);

  // Corner accents
  const corners: [number, number, number, number][] = [
    [0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1],
  ];
  corners.forEach(([cx2, cy2, dx, dy]) => {
    ctx.strokeStyle = "rgba(124,58,237,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx2 + dx * 20, cy2);
    ctx.lineTo(cx2, cy2);
    ctx.lineTo(cx2, cy2 + dy * 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx2, cy2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(167,139,250,0.5)";
    ctx.fill();
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
export default function Lanyard({ cardTexture, name, role, skills, location }: LanyardProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const cardRef       = useRef<HTMLDivElement>(null);
  const ropeRef       = useRef<SVGPolylineElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  const posX   = useRef(0);
  const posY   = useRef(0);
  const velX   = useRef(0);
  const velY   = useRef(0);
  const rotX   = useRef(-8);
  const rotY   = useRef(0);
  const rotVX  = useRef(0);
  const rotVY  = useRef(0);
  const drag   = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const raf    = useRef(0);
  const flipY  = useRef(0);
  const flipped = useRef(false);

  const [mounted, setMounted]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !backCanvasRef.current) return;
    drawBack(backCanvasRef.current, name, role, skills);
  }, [mounted, name, role, skills]);

  useEffect(() => {
    if (!mounted) return;
    rotVY.current = 22;
    rotX.current  = -8;
  }, [mounted]);

  const updateRope = useCallback(() => {
    if (!ropeRef.current || !containerRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const ax = cw / 2;
    const cx = cw / 2 + posX.current;
    const cy = 150 + posY.current;
    const steps = 24;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t   = i / steps;
      const x   = ax + (cx - ax) * t;
      const sag = Math.sin(t * Math.PI) * Math.max(30, Math.abs(cy) * 0.38);
      const y   = cy * t + sag;
      pts.push(`${x},${y}`);
    }
    ropeRef.current.setAttribute("points", pts.join(" "));
  }, []);

  const animate = useCallback(() => {
    if (!cardRef.current) { raf.current = requestAnimationFrame(animate); return; }

    if (!drag.current) {
      velX.current = (velX.current - posX.current * 0.05) * 0.88;
      velY.current = (velY.current - posY.current * 0.05) * 0.88;
      posX.current += velX.current;
      posY.current += velY.current;

      rotVX.current = (rotVX.current - (rotX.current + 8) * 0.04) * 0.93;
      rotVY.current = (rotVY.current - rotY.current * 0.04)       * 0.93;
      rotX.current  += rotVX.current;
      rotY.current  += rotVY.current;
    }

    const rx = Math.max(-50, Math.min(50, rotX.current));
    const ry = Math.max(-50, Math.min(50, rotY.current));

    flipY.current += rotVY.current;
    const normalised = ((flipY.current % 360) + 360) % 360;
    const newFlipped = normalised > 90 && normalised < 270;
    if (newFlipped !== flipped.current) {
      flipped.current = newFlipped;
      setIsFlipped(newFlipped);
    }

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current   = true;
    startX.current = e.clientX - posX.current;
    startY.current = e.clientY - posY.current;
    velX.current   = 0;
    velY.current   = 0;
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const nx = e.clientX - startX.current;
    const ny = e.clientY - startY.current;
    const dx = nx - posX.current;
    const dy = ny - posY.current;

    rotVY.current += dx * 0.6;
    rotVX.current -= dy * 0.4;
    velX.current   = dx * 0.7;
    velY.current   = dy * 0.7;
    posX.current   = nx;
    posY.current   = ny;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = false;
    setIsDragging(false);
  }, []);

  const onCardClick = useCallback(() => {
    rotVY.current += 20;
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
      <style>{`
        @keyframes ropeSwing {
          0%, 100% { opacity: 0.9; }
          50%       { opacity: 1; }
        }
        @keyframes hookPulse {
          0%, 100% { box-shadow: 0 2px 8px rgba(124,58,237,0.2); }
          50%       { box-shadow: 0 2px 16px rgba(124,58,237,0.5); }
        }
        @keyframes cardGlow {
          0%, 100% { filter: drop-shadow(0 24px 48px rgba(0,0,0,0.65)) drop-shadow(0 0 20px rgba(124,58,237,0.1)); }
          50%       { filter: drop-shadow(0 28px 56px rgba(0,0,0,0.7))  drop-shadow(0 0 30px rgba(124,58,237,0.2)); }
        }
        @keyframes shadowPulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
          50%       { opacity: 0.9; transform: translateX(-50%) scaleX(1.1); }
        }
      `}</style>

      {/* ── Rope SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="35%"  stopColor="#a78bfa" stopOpacity="0.95" />
            <stop offset="70%"  stopColor="#7c3aed" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.6" />
          </linearGradient>

          {/* Rope glow filter */}
          <filter id="ropeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0.5 0 0.5 0 0.3  0 0 0.5 0 0.1  0.8 0 1.5 0 0.5  0 0 0 1 0"
              result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Card glow filter */}
          <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0.3 0 0.5 0 0.2  0 0 0.3 0 0  0.5 0 1 0 0.3  0 0 0 0.6 0"
              result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ceiling mount plate */}
        <rect
          x="50%" y="0" width="32" height="14" rx="4"
          transform="translate(-16,0)"
          style={{
            fill: "url(#mountGrad)",
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.6))",
          }}
          fill="#2d2d3d"
          stroke="rgba(124,58,237,0.4)"
          strokeWidth="1"
        />
        {/* Mount screws */}
        <circle cx="calc(50% - 8)" cy="7" r="2" fill="rgba(124,58,237,0.5)" />
        <circle cx="calc(50% + 8)" cy="7" r="2" fill="rgba(124,58,237,0.5)" />

        {/* Rope shadow */}
        <polyline
          points="50,0 50,150"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          transform="translate(3,3)"
        />

        {/* Main rope */}
        <polyline
          ref={ropeRef}
          points="50,0 50,150"
          stroke="url(#ropeGrad)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ropeGlow)"
          style={{ animation: "ropeSwing 3s ease infinite" }}
        />

        {/* Rope highlight */}
        <polyline
          points="50,0 50,150"
          stroke="rgba(196,181,253,0.3)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* ── Card wrapper ── */}
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onCardClick}
        className="absolute top-0 left-1/2"
        style={{
          width: CARD_W,
          height: CARD_H,
          transformOrigin: "top center",
          willChange: "transform",
          zIndex: 2,
          transform: `translate(-50%, 150px) rotateX(-8deg)`,
          transformStyle: "preserve-3d",
          cursor: isDragging ? "grabbing" : "grab",
          filter: isHovered
            ? "drop-shadow(0 28px 56px rgba(0,0,0,0.7)) drop-shadow(0 0 30px rgba(124,58,237,0.25))"
            : "drop-shadow(0 20px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 16px rgba(124,58,237,0.1))",
          transition: "filter 0.4s ease",
          animation: !isDragging ? "cardGlow 4s ease infinite" : "none",
        }}
      >
        {/* Metal clip */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          style={{ top: -18, backfaceVisibility: "hidden" }}
        >
          <div style={{
            width: 22, height: 12, borderRadius: "4px 4px 0 0",
            background: "linear-gradient(180deg,#e4e4e7 0%,#a1a1aa 100%)",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
          }} />
          <div style={{
            width: 14, height: 10, borderRadius: "0 0 4px 4px",
            background: "linear-gradient(180deg,#71717a,#52525b)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
          }} />
          {/* Clip hole */}
          <div style={{
            position: "absolute",
            top: 3, left: "50%", transform: "translateX(-50%)",
            width: 8, height: 6, borderRadius: "2px",
            background: "rgba(0,0,0,0.4)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
          }} />
        </div>

        {/* ── FRONT face ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {/* Photo */}
          {cardTexture && (
            <img
              src={cardTexture}
              alt="ID Card"
              className="w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              style={{ display: imgLoaded ? "block" : "none" }}
            />
          )}

          {/* Fallback */}
          <div style={{ display: cardTexture && imgLoaded ? "none" : "flex" }}
            className="absolute inset-0 flex-col">
            {/* Background */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(160deg,#0f0a1e 0%,#120d20 50%,#0a0812 100%)",
            }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "linear-gradient(rgba(124,58,237,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.15) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
            }} />

            {/* Top bar */}
            <div className="relative z-10" style={{
              height: 8,
              background: "linear-gradient(90deg,#5b21b6,#7c3aed,#a78bfa,#7c3aed,#5b21b6)",
              flexShrink: 0,
            }} />

            <div className="relative z-10 flex flex-col items-center flex-1 pt-7 pb-4 px-6">
              {/* Avatar circle */}
              <div className="relative" style={{ marginBottom: 14 }}>
                <div style={{
                  width: 94, height: 94, borderRadius: "50%",
                  background: "linear-gradient(135deg,rgba(124,58,237,0.5),rgba(167,139,250,0.2))",
                  border: "2px solid rgba(124,58,237,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}>
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(167,139,250,0.7)" strokeWidth="1.4">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                {/* Online dot */}
                <div style={{
                  position: "absolute", bottom: 4, right: 4,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#10b981",
                  border: "2px solid #0f0a1e",
                  boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                }} />
              </div>

              <p style={{ color: "#f5f3ff", fontWeight: 700, fontSize: 19, textAlign: "center", marginBottom: 3, textShadow: "0 0 12px rgba(167,139,250,0.4)" }}>
                {name || "Your Name"}
              </p>
              <p style={{ color: "rgba(167,139,250,0.88)", fontSize: 12, textAlign: "center", marginBottom: 8 }}>
                {role || "Developer"}
              </p>

              {location && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  color: "rgba(107,114,128,0.85)", fontSize: 10,
                  fontFamily: "monospace", marginBottom: 12,
                }}>
                  <span>📍</span><span>{location}</span>
                </div>
              )}

              {/* Divider */}
              <div style={{ width: "75%", height: 1, marginBottom: 12,
                background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.35),transparent)" }} />

              {/* Access badge */}
              <div style={{
                width: "100%", padding: "8px 14px", borderRadius: 10,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.28)",
                textAlign: "center", marginBottom: 10,
              }}>
                <p style={{ color: "rgba(196,181,253,0.75)", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.15em" }}>
                  ◈ VISITOR PASS ◈
                </p>
              </div>

              {/* Barcode-style decoration */}
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", opacity: 0.25 }}>
                {[4, 8, 3, 10, 5, 7, 2, 9, 4, 6, 8, 3, 7, 5, 10, 4, 6, 8, 3, 5].map((h, i) => (
                  <div key={i} style={{ width: 2, height: h, background: "#a78bfa", borderRadius: 1 }} />
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10" style={{
              height: 8,
              background: "linear-gradient(90deg,#5b21b6,#7c3aed,#a78bfa,#7c3aed,#5b21b6)",
              flexShrink: 0,
            }} />
          </div>

          {/* Photo overlay */}
          {cardTexture && imgLoaded && (
            <div className="absolute bottom-0 left-0 right-0" style={{
              background: "linear-gradient(to top,rgba(8,5,18,0.95) 55%,transparent)",
            }}>
              <div className="px-5 pb-5 pt-10">
                <p style={{ color: "#f5f3ff", fontWeight: 700, fontSize: 17, textShadow: "0 0 12px rgba(167,139,250,0.5)" }}>
                  {name || "Your Name"}
                </p>
                <p style={{ color: "rgba(167,139,250,0.85)", fontSize: 12, marginTop: 2 }}>
                  {role || "Developer"}
                </p>
                {location && (
                  <p style={{ color: "rgba(107,114,128,0.7)", fontSize: 10, fontFamily: "monospace", marginTop: 4 }}>
                    📍 {location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Glass sheen */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 45%,rgba(255,255,255,0.02) 100%)",
          }} />

          {/* Edge highlight */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3)",
          }} />
        </div>

        {/* ── BACK face ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <canvas ref={backCanvasRef} width={560} height={820} className="w-full h-full" />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 45%,rgba(124,58,237,0.03) 100%)",
          }} />
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)",
          }} />
        </div>

        <FlipHint />
      </div>

      {/* ── Floor shadow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 35,
          borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(124,58,237,0.3) 0%,rgba(0,0,0,0.1) 60%,transparent 80%)",
          filter: "blur(16px)",
          animation: "shadowPulse 4s ease infinite",
        }}
      />
    </div>
  );
}

// ── Flip hint ──────────────────────────────────────────────────────────────────
function FlipHint() {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in after 800ms
    const fadeIn  = setTimeout(() => setOpacity(1), 800);
    // Fade out at 3.5s
    const fadeOut = setTimeout(() => setOpacity(0), 3500);
    // Remove at 4.2s
    const remove  = setTimeout(() => setVisible(false), 4200);
    return () => { clearTimeout(fadeIn); clearTimeout(fadeOut); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        bottom: -44,
        opacity,
        transition: "opacity 0.6s ease",
        whiteSpace: "nowrap",
        backfaceVisibility: "hidden",
        background: "rgba(124,58,237,0.12)",
        border: "1px solid rgba(124,58,237,0.2)",
        backdropFilter: "blur(8px)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="rgba(167,139,250,0.7)" strokeWidth="2">
        <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
      <span style={{ color: "rgba(167,139,250,0.65)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        drag · click to flip
      </span>
    </div>
  );
}