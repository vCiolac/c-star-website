import { cn } from "@/lib/utils";

type GlowCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article";
};

export function GlowCard({ children, className, as: Component = "div" }: GlowCardProps) {
  return <Component className={cn("glow-card", className)}>{children}</Component>;
}
