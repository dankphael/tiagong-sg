'use client';

import { Play, Volume2 } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { playClip, playSynthetic } from "@/lib/audioPlayback";
import { HIDDEN_SCORE_THRESHOLD } from "@/components/VariantChips";

// Picks the highest-scored pronunciation variant for a word, skipping any
// the community has downvoted into hidden territory (VariantChips applies
// the same threshold) — "Hear it" shouldn't default to a clip nobody wants
// played. The overlay API already returns pronunciation variants sorted by
// score descending (api/contributions/overlay/route.js), so the first
// surviving one is normally enough — the max-by-score fallback just keeps
// this safe if it's ever handed an unsorted list.
function topPronunciation(variants) {
  const clips = (variants || []).filter(v => v.variant_type === "pronunciation" && v.payload?.audioClipId && (v.score || 0) > HIDDEN_SCORE_THRESHOLD);
  if (clips.length === 0) return null;
  return clips.reduce((best, v) => ((v.score || 0) > (best.score || 0) ? v : best), clips[0]);
}

const DEFAULT_STYLE = { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 };
const COMPACT_STYLE = { display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 };

// "Hear it" button used across the dictionary and every learning game. Plays
// the community's top-voted recording for `wordId` when one exists; falls
// back to the synthesised browser voice and says so, since there is no
// per-word audio yet for most of the dictionary — see src/lib/tts.js for
// why that voice is only an approximation of the real dialect.
//
// `onRecord`, when passed, renders a "Record the real thing" link under the
// disclaimer so the nudge leads straight into a contribution — omit it where
// there's no reachable submission flow (e.g. mid-game).
//
// `as="span"` renders the trigger as a `span[role="button"]` instead of a
// real `<button>`, for the one call site (StoryQuiz) that nests this inside
// another button — a real nested <button> would be invalid HTML.
//
// `hideDisclaimer` suppresses the "Synthesised voice…" line — use it only
// where several of these render side by side (e.g. StoryQuiz's dialogue
// options) so the same disclaimer doesn't repeat three or four times on one
// screen; the Volume2 icon still marks each one as synthetic.
export default function HearItButton({ wordId, dialect, phrase, label = "Hear it", compact = false, style, className, onRecord, mutedColor = "var(--color-text-muted)", as = "button", hideDisclaimer = false }) {
  const { overlay, showToast } = useApp();
  const clip = wordId ? topPronunciation(overlay.variants[wordId]) : null;

  function handleClick() {
    if (clip) {
      playClip(`/api/audio/${clip.payload.audioClipId}`).catch(() => showToast("Couldn't play this recording", "error"));
    } else {
      playSynthetic(phrase, dialect);
    }
  }

  const buttonStyle = { ...(compact ? COMPACT_STYLE : DEFAULT_STYLE), color: clip ? "#1A6B3C" : "#8B7355", ...style };
  const iconSize = compact ? 11 : 15;
  const Trigger = as === "span" ? "span" : "button";
  const triggerProps = as === "span"
    ? { role: "button", tabIndex: 0, onKeyDown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } } }
    : { type: "button" };

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
      <Trigger onClick={handleClick} className={className} style={buttonStyle} {...triggerProps}>
        {clip ? <Play size={iconSize} fill="currentColor" /> : <Volume2 size={iconSize} />}
        {clip ? `${label} — ${clip.contributor_name || "a contributor"}` : label}
      </Trigger>
      {!clip && !hideDisclaimer && (
        <span style={{ fontSize: 10, color: mutedColor, fontStyle: "italic" }}>
          Synthesised voice — no community recording yet
          {onRecord && (
            <>
              {" · "}
              <button type="button" onClick={onRecord}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 10, color: "#C0392B", fontWeight: 600, textDecoration: "underline" }}>
                Record the real thing
              </button>
            </>
          )}
        </span>
      )}
    </span>
  );
}
