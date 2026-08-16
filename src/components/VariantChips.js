'use client';

import { useEffect, useState } from "react";
import { Play, ChevronUp, ChevronDown, ChevronsDown } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { playClip as playClipShared } from "@/lib/audioPlayback";

const VARIANT_LABELS = {
  spelling: "Alternative spelling",
  romanisation: "Alternative romanisation",
  definition: "Alternative meaning",
  usage_context: "Usage note",
  usage_example: "Example",
  new_word: "Community submission",
  pronunciation: "Pronunciation recording",
  interpretation: "Community interpretation",
};

// Variants at or below this net score are collapsed behind a "show hidden"
// toggle rather than deleted — reversible, so a good entry that gets
// brigaded is one click from visible again. Custodians can still remove a
// variant outright (see the Remove action below) for content that needs to
// come down regardless of vote count.
export const HIDDEN_SCORE_THRESHOLD = -3;

function variantValue(v) {
  if (v.variant_type === "usage_example") return v.payload?.exampleText;
  if (v.variant_type === "new_word") return v.payload?.english;
  if (v.variant_type === "interpretation") return v.payload?.meaning;
  return v.payload?.proposedValue;
}

// Renders the "Community Contributions" section on a dictionary card —
// published community corrections/examples/recordings/interpretations that
// coexist with the original entry rather than replacing it, each credited
// to its contributor. Every variant carries up/down votes now (not just
// recordings) since the community's votes are what decides a submission's
// fate instead of a custodian queue — see api/recordings/vote/route.js.
// Sorted highest-score first; heavily downvoted entries collapse behind a
// toggle instead of disappearing.
// `voteMap` is an optional { [variantId]: myVote } map the parent has
// already fetched in bulk (dictionary/page.js does one request for every
// card on the page instead of one per card). When omitted — WordDetailModal
// renders a single card at a time — this component fetches its own votes.
export default function VariantChips({ variants, canModerate, onRemove, voteMap }) {
  const { currentUser, showToast } = useApp();
  const [voteState, setVoteState] = useState({}); // { [variantId]: {up, down, score, myVote} }
  const [showHidden, setShowHidden] = useState(false);

  const list = Array.isArray(variants) ? variants : [];
  const variantIds = list.map(v => v.id).join(',');

  // Seed local vote counts from the (cached, public) overlay whenever the
  // set of variants for this card changes.
  useEffect(() => {
    const seed = {};
    for (const v of list) {
      seed[v.id] = { up: v.up || 0, down: v.down || 0, score: v.score || 0, myVote: 0 };
    }
    setVoteState(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantIds]);

  // Fetch the signed-in caller's own votes on these variants (per-user,
  // never cached) so their active vote is highlighted. Skipped when the
  // parent already supplies a bulk-fetched voteMap.
  useEffect(() => {
    if (voteMap) return;
    if (!variantIds || !currentUser) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetch(`/api/recordings/vote?variantIds=${variantIds}`, { headers: { Authorization: `Bearer ${token}` } })
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
     
  }, [variantIds, currentUser, voteMap]);

  // Merge in a parent-supplied bulk voteMap whenever it updates.
  useEffect(() => {
    if (!voteMap) return;
    setVoteState(prev => {
      const next = { ...prev };
      for (const [id, value] of Object.entries(voteMap)) {
        if (next[id]) next[id] = { ...next[id], myVote: value };
      }
      return next;
    });
  }, [voteMap]);

  if (list.length === 0) return null;

  function playClip(audioClipId) {
    playClipShared(`/api/audio/${audioClipId}`).catch(() => showToast("Couldn't play this recording", "error"));
  }

  function castVote(variantId, value) {
    if (!currentUser) {
      showToast("Sign in to vote", "error");
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

  const scored = list.map(v => ({ v, score: voteState[v.id]?.score ?? (v.score || 0) }));
  const visible = scored.filter(x => x.score > HIDDEN_SCORE_THRESHOLD).sort((a, b) => b.score - a.score).map(x => x.v);
  const hidden = scored.filter(x => x.score <= HIDDEN_SCORE_THRESHOLD).sort((a, b) => b.score - a.score).map(x => x.v);

  function renderVariant(v) {
    const vs = voteState[v.id] || { up: v.up || 0, down: v.down || 0, score: v.score || 0, myVote: 0 };
    const isPronunciation = v.variant_type === "pronunciation";
    return (
      <div key={v.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0, paddingTop: isPronunciation ? 0 : 1 }}>
          <button onClick={() => castVote(v.id, 1)} aria-label="Upvote this contribution"
            style={{ display: "inline-flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 2, color: vs.myVote === 1 ? "#1A6B3C" : "#8A7866" }}>
            <ChevronUp size={16} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: vs.score > 0 ? "#1A6B3C" : vs.score < 0 ? "#C0392B" : "var(--color-text-muted)", minWidth: 14, textAlign: "center" }}>
            {vs.score}
          </span>
          <button onClick={() => castVote(v.id, -1)} aria-label="Downvote this contribution"
            style={{ display: "inline-flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 2, color: vs.myVote === -1 ? "#C0392B" : "#8A7866" }}>
            <ChevronDown size={16} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {isPronunciation ? (
            <button onClick={() => playClip(v.payload?.audioClipId)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EAFAF1", border: "1px solid #1A6B3C40", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Play size={10} fill="currentColor" /> {v.contributor_name || "Recording"}
            </button>
          ) : (
            <div style={{ fontSize: 12, color: "#1A1208" }}>
              <span style={{ fontWeight: 600, color: "#1A6B3C" }}>{VARIANT_LABELS[v.variant_type] || v.variant_type}:</span>{" "}
              {variantValue(v)}
              {v.context_note && <span style={{ color: "#8B7355", fontStyle: "italic" }}> — &quot;{v.context_note}&quot;</span>}
              {v.contributor_name && <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Contributed by {v.contributor_name}</div>}
            </div>
          )}
        </div>

        {canModerate && (
          <button onClick={() => onRemove?.(v)} title="Remove this contribution"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C0392B", fontWeight: 600, padding: "2px 4px", fontFamily: "inherit", flexShrink: 0 }}>
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B7355", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        Community Contributions ({list.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map(renderVariant)}
      </div>

      {hidden.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <button onClick={() => setShowHidden(s => !s)}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600, padding: "4px 0", fontFamily: "inherit" }}>
            <ChevronsDown size={12} />
            {showHidden ? "Hide" : `Show ${hidden.length} hidden contribution${hidden.length !== 1 ? "s" : ""}`}
          </button>
          {showHidden && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {hidden.map(renderVariant)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
