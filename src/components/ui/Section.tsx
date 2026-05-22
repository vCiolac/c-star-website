import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ id, children, className }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-28", className)}
    >
      {children}
    </section>
  );
}
