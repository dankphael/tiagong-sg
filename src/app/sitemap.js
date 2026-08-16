import { dialects } from "@/data/staticData";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiagong.sg";

export default function sitemap() {
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/dictionary", priority: 0.9 },
    { path: "/learn", priority: 0.9 },
    { path: "/singlish", priority: 0.8 },
    { path: "/community", priority: 0.7 },
    { path: "/associations", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/contribute", priority: 0.6 },
    { path: "/welcome", priority: 0.5 },
  ];

  const dialectRoutes = dialects.map(d => ({ path: `/learn/${d.id}`, priority: 0.8 }));

  return [...staticRoutes, ...dialectRoutes].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority,
  }));
}
