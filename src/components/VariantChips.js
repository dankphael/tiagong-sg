'use client';

import { useEffect, useState } from "react";
import { Play, ChevronUp, ChevronDown } from "lucide-react";
import { useApp } from "@/components/AppProvider";

const VARIANT_LABELS = {
  spelling: "Alternative spelling",
  romanisation: "Alternative romanisation",
  definition: "Alternative meaning",
  usage_context: "Usage note",
  usage_example: "Example",
  new_word: "Community submission",
  pronunciation: "Pronunciation recording",
};

function variantValue(v) {
  if (v.variant_type === "usage_example") return v.payload?.exampleText;
  if (v.variant_type === "new_word") return v.payload?.english;
  return v.payload?.proposedValue;
}

// Shared Audio instance across all VariantChips instances on the page so
// starting a new clip stops whichever one is already playing.
let sharedAudio = null;

// Renders the "Attested variants" section on a dictionary card — accepted
// community corrections/examples/recordings that coexist with the original
// entry rather than replacing it, each credited to its contributor.
// Pronunciation recordings additionally carry up/down votes so the
// community can gauge which recording is most accurate by weight of
// numbers; recordings are shown highest-score first.
export default function VariantChips({ variants }) {
  const { currentUser, showToast } = useApp();
  const [voteState, setVoteState] = useState({}); // { [variantId]: {up, down, score, myVote} }

  const pronunciations = Array.isArray(variants) ? variants.filter(v => v.variant_type === "pronunciation") : [];
  const others = Array.isArray(variants) ? variants.filter(v => v.variant_type !== "pronunciation") : [];
  const pronIds = pronunciations.map(v => v.id).join(',');

  // Seed local vote counts from the (cached, public) overlay whenever the
  // set of recordings for this card changes.
  useEffect(() => {
    const seed = {};
    for (const v of pronunciations) {
      seed[v.id] = { up: v.up || 0, down: v.down || 0, score: v.score || 0, myVote: 0 };
    }
    setVoteState(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronIds]);

  // Fetch the signed-in caller's own votes on these recordings (per-user,
  // never cached) so their active vote is highlighted.
  useEffect(() => {
    if (!pronIds || !currentUser) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetch(`/api/recordings/vote?variantIds=${pronIds}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : {})
      .then(map => {
        setVoteState(prev => {
          const next = { ...prev };
          for (const [id, value] of Object.entries(map)) {
            if (next[id]) next[id] = { ...next[id], myVote: value };
          }
          return next;
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronIds, currentUser]);

  if (!Array.isArray(variants) || variants.length === 0) return null;

  function playClip(audioClipId) {
    if (sharedAudio) { sharedAudio.pause(); sharedAudio = null; }
    const audio = new Audio(`/api/audio/${audioClipId}`);
    sharedAudio = audio;
    audio.play().catch(() => showToast("Couldn't play this recording", "error"));
  }

  function castVote(variantId, value) {
    if (!currentUser) {
      showToast("Sign in to vote on recordings", "error");
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetch("/api/recordings/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ variantId, value }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setVoteState(prev => ({ ...prev, [variantId]: { up: data.up, down: data.down, score: data.score, myVote: data.myVote } }));
      })
      .catch(() => showToast("Couldn't save your vote", "error"));
  }

  const sortedPronunciations = [...pronunciations].sort((a, b) => {
    const scoreA = voteState[a.id]?.score ?? (a.score || 0);
    const scoreB = voteState[b.id]?.score ?? (b.score || 0);
    return scoreB - scoreA;
  });

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B7355", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        Attested Variants
      </div>

      {sortedPronunciations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: others.length > 0 ? 8 : 0 }}>
          {sortedPronunciations.map(v => {
            const vs = voteState[v.id] || { up: v.up || 0, down: v.down || 0, score: v.score || 0, myVote: 0 };
            return (
              <div key={v.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => playClip(v.payload?.audioClipId)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EAFAF1", border: "1px solid #1A6B3C40", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  <Play size={10} fill="currentColor" /> {v.contributor_name || "Recording"}
                </button>
                <button onClick={() => castVote(v.id, 1)} aria-label="Upvote this recording"
                  style={{ display: "inline-flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 2, color: vs.myVote === 1 ? "#1A6B3C" : "#C0B0A0" }}>
                  <ChevronUp size={16} />
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, color: vs.score > 0 ? "#1A6B3C" : vs.score < 0 ? "#C0392B" : "#9B8B75", minWidth: 14, textAlign: "center" }}>
                  {vs.score}
                </span>
                <button onClick={() => castVote(v.id, -1)} aria-label="Downvote this recording"
                  style={{ display: "inline-flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 2, color: vs.myVote === -1 ? "#C0392B" : "#C0B0A0" }}>
                  <ChevronDown size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {others.map(v => (
            <div key={v.id} style={{ fontSize: 12, color: "#1A1208" }}>
              <span style={{ fontWeight: 600, color: "#1A6B3C" }}>{VARIANT_LABELS[v.variant_type] || v.variant_type}:</span>{" "}
              {variantValue(v)}
              {v.context_note && <span style={{ color: "#8B7355", fontStyle: "italic" }}> — "{v.context_note}"</span>}
              {v.contributor_name && <div style={{ fontSize: 11, color: "#9B8B75" }}>Contributed by {v.contributor_name}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
