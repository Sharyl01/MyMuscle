import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
};

const variantClasses = {
  primary:
    "bg-[linear-gradient(135deg,#0f766e,#0891b2)] font-extrabold !text-white shadow-[0_16px_42px_rgba(8,145,178,0.2)] ring-1 ring-cyan-200/25 hover:brightness-110",
  secondary:
    "border border-white/12 bg-white/[0.035] font-semibold text-white hover:border-emerald-300/35 hover:bg-white/[0.07]",
};

export const ctaClassName = (
  variant: "primary" | "secondary" = "primary",
  className = "",
) =>
  `inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:px-7 ${variantClasses[variant]} ${className}`;

export function CtaLink({
  className = "",
  variant = "primary",
  ...props
}: CtaLinkProps) {
  return (
    <a
      className={ctaClassName(variant, className)}
      {...props}
    />
  );
}

type CtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function CtaButton({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: CtaButtonProps) {
  return (
    <button
      type={type}
      className={ctaClassName(variant, className)}
      {...props}
    />
  );
}
