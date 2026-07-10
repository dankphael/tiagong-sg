'use client';

import { useRef } from "react";
import { Play } from "lucide-react";
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
  const { showToast } = useApp();
  const audioRef = useRef(null);

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

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B7355", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        Attested Variants
      </div>

      {pronunciations.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: others.length > 0 ? 8 : 0 }}>
          {pronunciations.map(v => (
            <button key={v.id} onClick={() => playClip(v.payload?.audioClipId)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EAFAF1", border: "1px solid #1A6B3C40", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Play size={10} fill="currentColor" /> {v.contributor_name || "Recording"}
            </button>
          ))}
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
