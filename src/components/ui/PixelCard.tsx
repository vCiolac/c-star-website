import { cn } from "@/lib/utils";

type PixelCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function PixelCard({ children, className }: PixelCardProps) {
  return <div className={cn("pixel-card", className)}>{children}</div>;
}
