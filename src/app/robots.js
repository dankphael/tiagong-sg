const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiagong.sg";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/custodian"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
