import { buildMetadata } from "@/lib/pageMetadata";
import { dialects } from "@/data/staticData";

export async function generateMetadata({ params }) {
  const { dialect: dialectId } = await params;
  const dialect = dialects.find(d => d.id === dialectId);
  if (!dialect) {
    return buildMetadata({
      title: "Learn a Dialect",
      description: "Pick a dialect to begin flashcards, story quizzes, and fill-in-the-blank exercises.",
      path: "/learn",
    });
  }
  return buildMetadata({
    title: `Learn ${dialect.name}`,
    description: `${dialect.description} Flashcards, story quizzes, and more — practice ${dialect.name} phrases and pronunciation.`,
    path: `/learn/${dialect.id}`,
  });
}

export default function LearnDialectLayout({ children }) {
  return children;
}
