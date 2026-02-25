interface BadgeProps {
  label: string;
  variant?: "default" | "accent";
}

export default function Badge({ label, variant = "default" }: BadgeProps) {
  const base = "inline-block text-xs font-mono px-2.5 py-1 rounded-full border transition-colors";
  const variants = {
    default: "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20",
    accent: "bg-violet-500/10 border-violet-500/30 text-violet-300 hover:border-violet-400/50",
  };
  return (
    <span className={`${base} ${variants[variant]}`}>{label}</span>
  );
}
