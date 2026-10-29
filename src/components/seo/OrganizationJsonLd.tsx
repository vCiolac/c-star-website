import { SITE_URL, siteLinks, studio } from "@/lib/siteContent";

/** JSON-LD Organization. Sem redes sociais: nenhuma conta oficial foi confirmada. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: studio.name,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    email: siteLinks.contactEmail,
    description: studio.description,
    founder: [
      { "@type": "Person", name: "Victor Ciolac" },
      { "@type": "Person", name: "Juan César" },
      { "@type": "Person", name: "Rodrigo Andrade" }
    ]
  };

  return (
    <script
      type="application/ld+json"
      // JSON estático gerado no servidor; "<" escapado para não fechar a tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
