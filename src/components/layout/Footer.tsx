import Link from "next/link";
import { navItems, footerContent } from "@/lib/siteContent";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="logo-mark text-xl">
            C-ST<span aria-hidden>★</span>R
          </p>
          <p className="mt-3 text-sm text-slate-400">{footerContent.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3" aria-label="Links do rodapé">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label === "MUFF" ? "MUFF Origem" : item.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-center text-xs uppercase tracking-[0.22em] text-slate-500">
        {footerContent.copyright}
      </p>
    </footer>
  );
}
