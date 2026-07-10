'use client';

import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { SealChip } from "@/components/ui";
import { dialects } from "@/data/staticData";

export default function LearnIndexPage() {
  const router = useRouter();
  const { progress } = useApp();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Choose a Dialect</div>
        <h1 className="display-1" style={{ fontSize: 44, marginBottom: 12 }}>Start Learning</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
          Pick a dialect to begin flashcards, story quizzes, and more.
        </p>
      </div>
      <div className="dialect-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {dialects.map(d => {
          const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
          return (
            <div key={d.id} className="card card-hover" style={{ padding: 24, cursor: "pointer" }}
              onClick={() => router.push(`/learn/${d.id}`)}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <SealChip dialect={d} size="lg" />
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{d.name}</div>
                  <div style={{ fontSize: 13, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: 10 }}>{d.description}</p>
              <div style={{ fontSize: 12, color: "var(--color-text-faint)" }}>📍 {d.origin} · 👥 {d.speakers}</div>
              {dialectProgress > 0 && (
                <div style={{ marginTop: 12, fontSize: 12, color: d.color, fontWeight: 600 }}>Continue where you left off →</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
