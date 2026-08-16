import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Community",
  description: "See the leaderboard, recent activity, and what the tiagongSG community is building together.",
  path: "/community",
});

export default function CommunityLayout({ children }) {
  return children;
}
