import type { AnchorHTMLAttributes } from "react";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
};

const variantClasses = {
  primary:
    "bg-[linear-gradient(135deg,#f8fafc,#a7f3d0_44%,#7dd3fc)] font-extrabold !text-zinc-950 shadow-[0_18px_50px_rgba(45,212,191,0.2)] ring-1 ring-white/60 hover:brightness-110",
  secondary:
    "border border-white/12 bg-white/[0.035] font-semibold text-white hover:border-emerald-300/35 hover:bg-white/[0.07]",
};

export function CtaLink({
  className = "",
  variant = "primary",
  ...props
}: CtaLinkProps) {
  return (
    <a
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:px-7 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
