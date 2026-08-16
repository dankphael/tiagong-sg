import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "About",
  description: "Why we're building tiagongSG — a community-sourced home for Singapore's Chinese dialect heritage.",
  path: "/about",
});

export default function AboutLayout({ children }) {
  return children;
}
