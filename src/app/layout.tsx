import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CosmicBackdrop } from "@/components/effects/CosmicBackdrop";
import { GsapProvider } from "@/components/effects/GsapProvider";
import { ParticlesBackground } from "@/components/effects/ParticlesBackground";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "C-STAR Studios — Mundos multiplayer com alma",
  description:
    "Estúdio independente brasileiro por trás de MUFF Origem, criando jogos, experiências digitais e universos online com fantasia, tecnologia e identidade própria.",
  metadataBase: new URL("https://cstarstudios.com.br"),
  openGraph: {
    title: "C-STAR Studios",
    description: "Criamos mundos multiplayer com alma.",
    type: "website",
    locale: "pt_BR"
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050816"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body>
        <GsapProvider>
          <CosmicBackdrop />
          <ParticlesBackground />
          <Header />
          {children}
          <Footer />
        </GsapProvider>
      </body>
    </html>
  );
}
