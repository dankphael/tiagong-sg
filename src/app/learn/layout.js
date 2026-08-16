import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Start Learning",
  description: "Pick a dialect to begin flashcards, story quizzes, and fill-in-the-blank exercises.",
  path: "/learn",
});

export default function LearnLayout({ children }) {
  return children;
}
