// Shared shape for per-route metadata exports. Client pages ('use client')
// can't export `metadata` themselves, so each public route that wants its
// own title/description/social-preview gets a thin server layout.js that
// calls this and renders {children} — see src/app/dictionary/layout.js for
// the pattern.
export function buildMetadata({ title, description, path }) {
  const fullTitle = `${title} — tiagongSG`;
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: path,
      siteName: "tiagongSG",
      images: [{ url: "/logo/01-vertical-dark-bg.png", width: 800, height: 600, alt: "tiagongSG" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/logo/01-vertical-dark-bg.png"],
    },
  };
}
