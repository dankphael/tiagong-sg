import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Dialects in Singlish",
  description: "See how dialect words already live in everyday Singlish — discover where your favourite phrases really come from.",
  path: "/singlish",
});

export default function SinglishLayout({ children }) {
  return children;
}
