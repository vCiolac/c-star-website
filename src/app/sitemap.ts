import type { MetadataRoute } from "next";
import { projectHref, projects } from "@/content/projects";
import { SITE_URL } from "@/lib/siteContent";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["/", "/projetos", ...projects.map(projectHref), "/contato"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7
  }));
}
