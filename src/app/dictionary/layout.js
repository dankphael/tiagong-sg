import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Search the Dictionary",
  description: "Search Hokkien, Cantonese, Teochew, Hakka, and Hainanese words, meanings, and pronunciations — community-sourced and always growing.",
  path: "/dictionary",
});

export default function DictionaryLayout({ children }) {
  return children;
}
