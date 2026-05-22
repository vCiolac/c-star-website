import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn, isExternalUrl } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  icon?: "arrow" | "sparkle" | "none";
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  icon = "sparkle"
}: ButtonProps) {
  const external = isExternalUrl(href);

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300",
        variant === "primary" &&
          "border-amber-300/70 bg-amber-300/10 text-amber-100 shadow-[0_0_32px_rgba(251,191,36,0.2)] hover:bg-amber-300/18 hover:shadow-[0_0_44px_rgba(251,191,36,0.32)]",
        variant === "secondary" &&
          "border-sky-300/35 bg-sky-300/5 text-slate-100 shadow-[0_0_26px_rgba(56,189,248,0.12)] hover:border-sky-300/70 hover:bg-sky-300/12",
        variant === "ghost" &&
          "border-white/10 bg-white/[0.03] text-slate-200 hover:border-violet-300/50 hover:bg-violet-400/10",
        className
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span>{children}</span>
      {icon === "sparkle" ? (
        <Sparkles
          className="size-4 text-amber-300 transition group-hover:rotate-12"
          aria-hidden
        />
      ) : null}
      {icon === "arrow" ? (
        <ArrowRight
          className="size-4 transition group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
