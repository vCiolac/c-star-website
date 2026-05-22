import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { HeroSection } from "@/components/sections/HeroSection";
import { OtherWorksSection } from "@/components/sections/OtherWorksSection";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { UniverseSection } from "@/components/sections/UniverseSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeatureStrip />
      <AboutSection />
      <UniverseSection />
      <OtherWorksSection />
      <PillarsSection />
      <TechnologySection />
      <TeamSection />
      <ContactSection />
    </main>
  );
}
