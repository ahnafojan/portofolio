"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { Profile, Skill } from "@/lib/types";

interface SolarSystemProps {
  profile: Profile | null;
  skills?: Skill[];
  focusSkill?: string | null;
  onSkillHighlightChange?: (skillName: string | null) => void;
}

interface OrbitNode {
  id: string;
  name: string;
  level: number;
  category: string;
  radius: number;
  speed: number;
  angle: number;
  size: number;
  color: string;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  size: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
}

const ORBIT_COLORS = ["#a78bfa", "#818cf8", "#c4b5fd", "#7c3aed", "#6366f1", "#8b5cf6"];

const FALLBACK_SKILLS: Skill[] = [
  { _id: "orbit-fallback-1", name: "Next.js", level: 5, category: "Frontend" },
  { _id: "orbit-fallback-2", name: "TypeScript", level: 5, category: "Frontend" },
  { _id: "orbit-fallback-3", name: "React", level: 5, category: "Frontend" },
  { _id: "orbit-fallback-4", name: "Tailwind", level: 4, category: "Frontend" },
  { _id: "orbit-fallback-5", name: "Node.js", level: 4, category: "Backend" },
  { _id: "orbit-fallback-6", name: "Sanity", level: 4, category: "Tools" },
  { _id: "orbit-fallback-7", name: "PostgreSQL", level: 3, category: "Database" },
  { _id: "orbit-fallback-8", name: "Docker", level: 3, category: "DevOps" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function seededRange(key: string, min: number, max: number) {
  const hash = hashString(key) % 10000;
  const ratio = hash / 10000;
  return min + ratio * (max - min);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function normalizeSkills(skills: Skill[]) {
  const source = skills.length > 0 ? skills : FALLBACK_SKILLS;
  return [...source]
    .sort((a, b) => {
      const byLevel = (b.level ?? 0) - (a.level ?? 0);
      if (byLevel !== 0) return byLevel;
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .slice(0, 10);
}

function buildNodes(skills: Skill[]) {
  const radii = [82, 124, 166, 208];
  const ranked = normalizeSkills(skills);

  return ranked.map((skill, index) => {
    const key = `${skill._id}-${skill.name}-${index}`;
    const ringIndex = Math.min(Math.floor(index / 3), radii.length - 1);
    const level = clamp(Math.round(skill.level ?? 3), 1, 5);

    return {
      id: `orbit-node-${index}-${hashString(key).toString(16)}`,
      name: skill.name,
      category: skill.category ?? "Other",
      level,
      radius: radii[ringIndex] + seededRange(`${key}-radius`, -10, 10),
      speed: seededRange(`${key}-speed`, 0.22, 0.52) * (index % 2 === 0 ? 1 : -1),
      angle: seededRange(`${key}-angle`, 0, Math.PI * 2),
      size: 14 + level * 2,
      color: ORBIT_COLORS[hashString(`${key}-color`) % ORBIT_COLORS.length],
    } as OrbitNode;
  });
}

export default function SolarSystem({
  profile,
  skills = [],
  focusSkill,
  onSkillHighlightChange,
}: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedFactor, setSpeedFactor] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  const nodes = useMemo(() => buildNodes(skills), [skills]);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const focusNodeId = useMemo(() => {
    if (!focusSkill) return null;
    const target = nodes.find((node) => node.name.toLowerCase() === focusSkill.toLowerCase());
    return target?.id ?? null;
  }, [focusSkill, nodes]);
  const activePinnedId =
    pinnedNodeId && nodeMap.has(pinnedNodeId) ? pinnedNodeId : focusNodeId;

  const nodesRef = useRef<OrbitNode[]>(nodes.map((node) => ({ ...node })));
  const positionsRef = useRef<NodePosition[]>([]);
  const starsRef = useRef<Star[]>([]);

  const dragOffsetRef = useRef(dragOffset);
  const pointerRef = useRef({ x: 0, y: 0, inside: false });
  const draggingRef = useRef(isDragging);
  const pausedRef = useRef(isPaused);
  const speedRef = useRef(speedFactor);
  const pinnedRef = useRef<string | null>(pinnedNodeId);
  const hoveredRef = useRef<string | null>(hoveredNodeId);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const movedDuringDragRef = useRef(false);

  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    nodesRef.current = nodes.map((node) => ({ ...node }));
    positionsRef.current = [];
  }, [nodes]);

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useEffect(() => {
    draggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speedFactor;
  }, [speedFactor]);

  useEffect(() => {
    pinnedRef.current = activePinnedId;
  }, [activePinnedId]);

  useEffect(() => {
    hoveredRef.current = hoveredNodeId;
  }, [hoveredNodeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 5600);
    return () => window.clearTimeout(timer);
  }, []);

  const setHovered = useCallback((next: string | null) => {
    if (hoveredRef.current === next) return;
    hoveredRef.current = next;
    setHoveredNodeId(next);
  }, []);

  const findNodeAtPosition = useCallback((x: number, y: number) => {
    let matchedId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const node of positionsRef.current) {
      const distance = Math.hypot(x - node.x, y - node.y);
      const threshold = node.size + 11;
      if (distance <= threshold && distance < closestDistance) {
        matchedId = node.id;
        closestDistance = distance;
      }
    }

    return matchedId;
  }, []);

  const updatePointer = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    pointerRef.current = { x, y, inside: true };
    setCursorOffset({
      x: (x - rect.width / 2) * 0.03,
      y: (y - rect.height / 2) * 0.03,
    });

    return { x, y };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      movedDuringDragRef.current = false;
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      dragOriginRef.current = { ...dragOffsetRef.current };
      updatePointer(event.clientX, event.clientY);
    },
    [updatePointer]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const position = updatePointer(event.clientX, event.clientY);
      if (!position) return;

      const hoveredId = findNodeAtPosition(position.x, position.y);
      setHovered(hoveredId);

      if (!draggingRef.current) return;

      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        movedDuringDragRef.current = true;
      }

      setDragOffset({
        x: dragOriginRef.current.x + deltaX,
        y: dragOriginRef.current.y + deltaY,
      });
    },
    [findNodeAtPosition, setHovered, updatePointer]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      setIsDragging(false);

      if (movedDuringDragRef.current) return;

      const position = updatePointer(event.clientX, event.clientY);
      if (!position) return;

      const hitNodeId = findNodeAtPosition(position.x, position.y);
      if (!hitNodeId) return;

      setPinnedNodeId((current) => (current === hitNodeId ? null : hitNodeId));
    },
    [findNodeAtPosition, updatePointer]
  );

  const handlePointerLeave = useCallback(() => {
    pointerRef.current.inside = false;
    setCursorOffset({ x: 0, y: 0 });
    setHovered(null);
    setIsDragging(false);
  }, [setHovered]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setSpeedFactor((current) => clamp(current + delta, 0.35, 2.8));
  }, []);

  const handleResetView = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
    setCursorOffset({ x: 0, y: 0 });
    setSpeedFactor(1);
    setPinnedNodeId(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const randomStar = (width: number, height: number, index: number): Star => ({
      x: seededRange(`star-x-${index}`, 0, width),
      y: seededRange(`star-y-${index}`, 0, height),
      size: seededRange(`star-size-${index}`, 0.6, 2.1),
      alpha: seededRange(`star-alpha-${index}`, 0.1, 0.45),
      phase: seededRange(`star-phase-${index}`, 0, Math.PI * 2),
    });

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.max(36, Math.round((width * height) / 11000));
      starsRef.current = Array.from({ length: starCount }, (_unused, index) =>
        randomStar(width, height, index)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (timestamp: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) {
        rafRef.current = window.requestAnimationFrame(draw);
        return;
      }

      const dt = Math.min((timestamp - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = timestamp;

      context.clearRect(0, 0, width, height);

      const pointerX = pointerRef.current.inside ? pointerRef.current.x : width / 2;
      const pointerY = pointerRef.current.inside ? pointerRef.current.y : height / 2;
      const centerX = width / 2 + dragOffsetRef.current.x + (pointerX - width / 2) * 0.03;
      const centerY = height / 2 + dragOffsetRef.current.y + (pointerY - height / 2) * 0.03;

      const ambient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.45);
      ambient.addColorStop(0, "rgba(124,58,237,0.22)");
      ambient.addColorStop(0.45, "rgba(124,58,237,0.06)");
      ambient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = ambient;
      context.fillRect(0, 0, width, height);

      for (const star of starsRef.current) {
        const alpha = star.alpha + Math.sin(timestamp * 0.0014 + star.phase) * 0.12;
        context.fillStyle = `rgba(196,181,253,${clamp(alpha, 0.05, 0.6)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      const uniqueRings = [...new Set(nodesRef.current.map((node) => Math.round(node.radius)))].sort((a, b) => a - b);
      uniqueRings.forEach((radius, index) => {
        context.save();
        context.lineWidth = 1;
        context.strokeStyle = "rgba(124,58,237,0.16)";
        context.setLineDash([6, 9]);
        context.lineDashOffset = -timestamp * 0.016 * (index + 1);
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      });

      const focusedId = pinnedRef.current || hoveredRef.current;
      const positions: NodePosition[] = [];

      for (const node of nodesRef.current) {
        if (!pausedRef.current) {
          node.angle += node.speed * dt * speedRef.current;
        }

        const x = centerX + Math.cos(node.angle) * node.radius;
        const y = centerY + Math.sin(node.angle) * node.radius;
        const isFocused = node.id === focusedId;
        const scaledSize = node.size * (isFocused ? 1.2 : 1);

        positions.push({ id: node.id, x, y, size: scaledSize });

        const rgb = hexToRgb(node.color);

        const glow = context.createRadialGradient(x, y, 0, x, y, scaledSize + 14);
        glow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${isFocused ? 0.45 : 0.26})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, scaledSize + 14, 0, Math.PI * 2);
        context.fill();

        const face = context.createRadialGradient(
          x - scaledSize * 0.3,
          y - scaledSize * 0.3,
          0,
          x,
          y,
          scaledSize
        );
        face.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`);
        face.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0.14)`);

        context.fillStyle = face;
        context.beginPath();
        context.arc(x, y, scaledSize, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${isFocused ? 0.9 : 0.62})`;
        context.lineWidth = isFocused ? 2.1 : 1.3;
        context.stroke();

        context.fillStyle = "#f5f3ff";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = `600 ${isFocused ? 11 : 10}px system-ui`;
        const label = node.name.length > 11 ? `${node.name.slice(0, 10)}.` : node.name;
        context.fillText(label, x, y);

        const dots = clamp(node.level, 1, 5);
        for (let index = 0; index < dots; index += 1) {
          context.beginPath();
          context.arc(x - 7 + index * 3.5, y + scaledSize + 6, 1.4, 0, Math.PI * 2);
          context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`;
          context.fill();
        }
      }

      positionsRef.current = positions;

      if (focusedId) {
        const focusedNode = positions.find((item) => item.id === focusedId);
        if (focusedNode) {
          const connector = context.createLinearGradient(centerX, centerY, focusedNode.x, focusedNode.y);
          connector.addColorStop(0, "rgba(167,139,250,0.45)");
          connector.addColorStop(1, "rgba(167,139,250,0)");
          context.strokeStyle = connector;
          context.lineWidth = 1.2;
          context.setLineDash([4, 7]);
          context.beginPath();
          context.moveTo(centerX, centerY);
          context.lineTo(focusedNode.x, focusedNode.y);
          context.stroke();
          context.setLineDash([]);
        }
      }

      if (pointerRef.current.inside && !draggingRef.current) {
        const hoveredId = findNodeAtPosition(pointerRef.current.x, pointerRef.current.y);
        setHovered(hoveredId);
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [findNodeAtPosition, setHovered]);

  const highlightedNode =
    (activePinnedId ? nodeMap.get(activePinnedId) : null) ||
    (hoveredNodeId ? nodeMap.get(hoveredNodeId) : null) ||
    nodes[0] ||
    null;
  const hasManualPin = Boolean(pinnedNodeId && nodeMap.has(pinnedNodeId));
  const hasFocusedSkill = Boolean(activePinnedId);

  useEffect(() => {
    if (!onSkillHighlightChange || !highlightedNode) return;
    onSkillHighlightChange(highlightedNode.name);
  }, [highlightedNode, onSkillHighlightChange]);

  const avatarUrl = profile?.avatar
    ? urlFor(profile.avatar).width(200).height(200).url()
    : null;

  const controlButtonStyle = {
    color: "#e9d5ff",
    background: "rgba(124,58,237,0.2)",
    border: "1px solid rgba(124,58,237,0.35)",
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden rounded-[1.7rem]"
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
      onDoubleClick={() => setIsPaused((current) => !current)}
      onWheel={handleWheel}
    >
      <style>{`
        @keyframes solarRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes solarPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0), 0 0 34px rgba(124,58,237,0.35); }
          50% { box-shadow: 0 0 0 16px rgba(124,58,237,0), 0 0 54px rgba(124,58,237,0.55); }
        }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        className="pointer-events-none absolute z-10"
        style={{
          left: `calc(50% + ${dragOffset.x + cursorOffset.x}px)`,
          top: `calc(50% + ${dragOffset.y + cursorOffset.y}px)`,
          transform: "translate(-50%, -50%)",
          transition: "left 0.08s ease, top 0.08s ease",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[98px] w-[98px] rounded-full"
          style={{
            border: "1px dashed rgba(124,58,237,0.32)",
            animation: isPaused ? "none" : "solarRotate 12s linear infinite",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[114px] w-[114px] rounded-full"
          style={{
            border: "1px dashed rgba(167,139,250,0.24)",
            animation: isPaused ? "none" : "solarRotate 18s linear infinite reverse",
          }}
        />

        <div
          className="relative h-[82px] w-[82px] overflow-hidden rounded-full"
          style={{
            border: "2px solid rgba(124,58,237,0.55)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.28))",
            animation: isPaused ? "none" : "solarPulse 2.9s ease-in-out infinite",
          }}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={profile?.fullName ?? "Profile"} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-mono text-violet-100">
              CORE
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(140deg, rgba(255,255,255,0.2) 0%, transparent 45%)",
            }}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-4 top-4 z-20 w-52 rounded-xl p-3"
        style={{
          background: "rgba(8,8,16,0.64)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          {hasManualPin
            ? "Pinned Skill"
            : hoveredNodeId
              ? "Active Skill"
              : hasFocusedSkill
                ? "Focus Skill"
                : "Orbit Skill"}
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{highlightedNode?.name ?? "No skill"}</p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span>{highlightedNode?.category ?? "-"}</span>
          <span>Lv {highlightedNode?.level ?? "-"}</span>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setIsPaused((current) => !current)}
          className="rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em]"
          style={controlButtonStyle}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleResetView}
          className="rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em]"
          style={controlButtonStyle}
        >
          Reset View
        </button>

        <div
          className="rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em]"
          style={{
            color: "#94a3b8",
            background: "rgba(8,8,16,0.64)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          Speed {speedFactor.toFixed(2)}x
        </div>
      </div>

      {showHint ? (
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-2 text-[10px] font-mono uppercase tracking-[0.12em]"
          style={{
            color: "#9ca3af",
            background: "rgba(8,8,16,0.65)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          Drag to pan. Scroll for speed. Double click to pause.
        </div>
      ) : null}
    </div>
  );
}
