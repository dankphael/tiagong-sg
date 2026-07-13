'use client';

import { useRef, useState } from "react";
import { Play, Heart } from "lucide-react";
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
export default function VariantChips({ variants }) {
  const { currentUser, showToast, myVotes, toggleVote } = useApp();
  const audioRef = useRef(null);
  // Base counts come from the (cached) overlay payload; track per-vote deltas
  // locally so a click reflects immediately without waiting on a refetch.
  const [deltas, setDeltas] = useState({});

  if (!Array.isArray(variants) || variants.length === 0) return null;

  const pronunciations = variants.filter(v => v.variant_type === "pronunciation");
  const others = variants.filter(v => v.variant_type !== "pronunciation");

  function playClip(audioClipId) {
    if (sharedAudio) { sharedAudio.pause(); sharedAudio = null; }
    const audio = new Audio(`/api/audio/${audioClipId}`);
    sharedAudio = audio;
    audioRef.current = audio;
    audio.play().catch(() => showToast("Couldn't play this recording", "error"));
  }

  function attest(v) {
    if (!currentUser) { showToast("Sign in to attest", "error"); return; }
    const key = `variant:${v.id}`;
    const wasVoted = myVotes.has(key);
    setDeltas(prev => ({ ...prev, [v.id]: (prev[v.id] || 0) + (wasVoted ? -1 : 1) }));
    toggleVote("variant", v.id);
  }

  function AttestButton({ v }) {
    const voted = myVotes.has(`variant:${v.id}`);
    const count = (v.vote_count || 0) + (deltas[v.id] || 0);
    return (
      <button onClick={() => attest(v)} title="My family says it this way too"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "6px 4px", fontFamily: "inherit", color: voted ? "#C0392B" : "#9B8B75", fontSize: 11, fontWeight: 600 }}>
        <Heart size={12} fill={voted ? "currentColor" : "none"} /> {count > 0 ? count : ""}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B7355", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        Attested Variants
      </div>

      {pronunciations.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: others.length > 0 ? 8 : 0 }}>
          {pronunciations.map(v => (
            <div key={v.id} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
              <button onClick={() => playClip(v.payload?.audioClipId)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EAFAF1", border: "1px solid #1A6B3C40", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                <Play size={10} fill="currentColor" /> {v.contributor_name || "Recording"}
              </button>
              <AttestButton v={v} />
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {others.map(v => (
            <div key={v.id} style={{ fontSize: 12, color: "#1A1208", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#1A6B3C" }}>{VARIANT_LABELS[v.variant_type] || v.variant_type}:</span>{" "}
                {variantValue(v)}
                {v.context_note && <span style={{ color: "#8B7355", fontStyle: "italic" }}> — "{v.context_note}"</span>}
                {v.contributor_name && <div style={{ fontSize: 11, color: "#9B8B75" }}>Contributed by {v.contributor_name}</div>}
              </div>
              <AttestButton v={v} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
