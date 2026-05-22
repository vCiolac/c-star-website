import { Disc3, Instagram, Mail, Music2, Play, Twitter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlowCard } from "@/components/ui/GlowCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { contactContent, siteLinks, socialLinks } from "@/lib/siteContent";

const socialIconMap = {
  Instagram,
  YouTube: Play,
  Discord: Disc3,
  TikTok: Music2,
  "X/Twitter": Twitter
};

export function ContactSection() {
  return (
    <Section id="contato" className="pb-24">
      <ScrollReveal>
        <GlowCard className="contact-card p-7 text-center sm:p-10 lg:p-14">
          <SectionHeading
            eyebrow={contactContent.eyebrow}
            title={contactContent.title}
            description={contactContent.description}
            align="center"
          />
          <a
            href={siteLinks.contactMailto}
            className="mt-7 inline-flex text-lg font-bold text-amber-200 underline-offset-4 hover:underline"
          >
            {siteLinks.contactEmail}
          </a>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button href={siteLinks.contactMailto} icon="arrow">
              {contactContent.primaryCta}
              <Mail className="size-4" aria-hidden />
            </Button>
            <Button href={siteLinks.muff} variant="secondary">
              {contactContent.secondaryCta}
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = socialIconMap[social.label as keyof typeof socialIconMap];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="social-link"
                  target={social.href === "#" ? undefined : "_blank"}
                  rel={social.href === "#" ? undefined : "noreferrer"}
                >
                  <Icon className="size-5" aria-hidden />
                </a>
              );
            })}
          </div>
        </GlowCard>
      </ScrollReveal>
    </Section>
  );
}
