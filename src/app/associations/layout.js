import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Clan Associations",
  description: "Discover Singapore's clan and dialect associations (huay kuan) and their role in preserving Chinese dialect heritage.",
  path: "/associations",
});

export default function AssociationsLayout({ children }) {
  return children;
}
