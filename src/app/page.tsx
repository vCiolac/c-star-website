import type { Metadata } from "next";
import { HeroConstellation } from "@/components/hero/HeroConstellation";
import { ContactTeaser } from "@/components/home/ContactTeaser";
import { CreatorsConstellation } from "@/components/home/CreatorsConstellation";
import { MuffChapters } from "@/components/home/MuffChapters";
import { MuffIntro } from "@/components/home/MuffIntro";

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

export default function Home() {
  return (
    <main>
      <HeroConstellation />
      <MuffIntro />
      <MuffChapters />
      <CreatorsConstellation />
      <ContactTeaser />
    </main>
  );
}
