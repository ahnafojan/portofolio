import { ReactNode, AnchorHTMLAttributes } from "react";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
}

export default function Button({ children, variant = "primary", className = "", ...rest }: ButtonProps) {
  const base = "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200";
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 active:scale-95",
    outline: "border border-white/20 text-white hover:bg-white/5 hover:border-white/40",
    ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
  };
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
