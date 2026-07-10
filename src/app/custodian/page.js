'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import SubmissionReviewCard from "@/components/SubmissionReviewCard";

export default function CustodianPage() {
  const { currentUser, ready, apiWords, showToast } = useApp();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCustodian = currentUser?.custodianDialects?.length > 0;

  async function loadQueue() {
    const token = localStorage.getItem("auth_token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch("/api/contributions/queue", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load review queue:", e);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isCustodian) loadQueue();
    else setLoading(false);
  }, [currentUser?.id, isCustodian]);

  async function handleReview(id, action, note) {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`/api/contributions/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to review", "error");
        return;
      }
      setQueue(q => q.filter(s => s.id !== id));
      showToast(action === "accept" ? "Accepted — variant added and XP awarded" : "Rejected", "success");
    } catch (e) {
      console.error("Failed to review submission:", e);
      showToast("Network error — please try again", "error");
    }
  }

  if (!ready || loading) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map(i => <div key={i} className="card shimmer" style={{ padding: 20, height: 120, background: "#F0E8DA" }} />)}
        </div>
      </div>
    );
  }

  if (!isCustodian) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 12 }}>Custodian Access Required</div>
        <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 24 }}>
          This page is for Language Custodians reviewing community submissions. Apply on the Contribute page if you're a fluent dialect speaker.
        </p>
        <Link href="/contribute" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
          Go to Contribute
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Custodian Console</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Review Queue</h1>
        <p style={{ color: "#8B7355", fontSize: 14 }}>
          Reviewing for: {currentUser.custodianDialects.join(", ")} · {queue.length} pending
        </p>
      </div>

      {queue.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#1A1208", marginBottom: 8 }}>All caught up</div>
          <p style={{ fontSize: 14 }}>No pending submissions for your dialects right now.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {queue.map(submission => {
            const rawWord = submission.word_id && Array.isArray(apiWords) ? apiWords.find(w => w.id === submission.word_id) : null;
            const currentWord = rawWord ? {
              phrase: rawWord.headword?.romanized || "",
              chinese: rawWord.headword?.traditional || "",
              meaning: rawWord.definitions?.[0]?.english || "",
            } : null;
            return (
              <SubmissionReviewCard key={submission.id} submission={submission} currentWord={currentWord} onReview={handleReview} />
            );
          })}
        </div>
      )}
    </div>
  );
}
