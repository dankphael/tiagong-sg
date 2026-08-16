'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { useModalA11y } from "@/lib/useModalA11y";
import AudioRecorder from "@/components/AudioRecorder";
import { isSyntheticWordId } from "@/lib/wordId";

const CORRECTION_FIELDS = [
  ["spelling", "Spelling / Chinese characters"],
  ["romanisation", "Romanisation"],
  ["definition", "Definition"],
  ["usage_context", "Usage context"],
];

// Every type this modal handles except 'error_flag' publishes instantly —
// see api/contributions/route.js — and is added as a variant alongside the
// existing entry rather than replacing it (db/schema.sql: word_variants).
const INSTANT_PUBLISH_TYPES = ["correction", "usage_example", "pronunciation_audio", "interpretation"];

// Single modal handling 'correction', 'usage_example', 'interpretation',
// 'pronunciation_audio', and 'error_flag' submissions against an existing
// dictionary word. New-word submissions are handled by the /contribute page
// form instead, since they still go through custodian review rather than
// publishing instantly.
export default function ContributionModal({ word, type, onClose }) {
  const router = useRouter();
  const { currentUser, showToast, refreshOverlay } = useApp();
  const [field, setField] = useState("definition");
  const [proposedValue, setProposedValue] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleText, setExampleText] = useState("");
  const [translation, setTranslation] = useState("");
  const [description, setDescription] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [audioClip, setAudioClip] = useState(null); // { base64, mimeType, durationMs }

  const { containerRef, titleId } = useModalA11y(onClose, { active: !!word });

  if (!word) return null;

  const title = type === "correction" ? "Suggest an Edit"
    : type === "usage_example" ? "Add a Usage Example"
    : type === "pronunciation_audio" ? "Add a Pronunciation"
    : type === "interpretation" ? "Add Your Interpretation"
    : "Flag an Issue";

  async function handleSubmit() {
    if (!currentUser) {
      showToast("Sign in to contribute", "error");
      onClose();
      router.push("/signin?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    let payload;
    let audioFields = {};
    if (type === "correction") {
      if (!proposedValue.trim()) { showToast("Please enter your proposed value", "error"); return; }
      payload = { field, proposedValue: proposedValue.trim(), currentValue: currentFieldValue(), contextNote: contextNote.trim() };
    } else if (type === "usage_example") {
      if (!exampleText.trim()) { showToast("Please enter an example sentence", "error"); return; }
      payload = { exampleText: exampleText.trim(), translation: translation.trim(), contextNote: contextNote.trim() };
    } else if (type === "interpretation") {
      if (!meaning.trim()) { showToast("Please share your interpretation", "error"); return; }
      payload = { meaning: meaning.trim(), contextNote: contextNote.trim() };
    } else if (type === "pronunciation_audio") {
      if (!audioClip) { showToast("Record a clip first", "error"); return; }
      payload = { contextNote: contextNote.trim() };
      audioFields = { audioData: audioClip.base64, audioMimeType: audioClip.mimeType, durationMs: audioClip.durationMs };
    } else {
      if (!description.trim()) { showToast("Please describe the issue", "error"); return; }
      payload = { description: description.trim() };
    }

    // A custodian reviewing this in the queue can only look up the current
    // entry by word_id in public/dictionary.json — that lookup misses both
    // game-flashcard flags (no wordId at all) and static/community dictionary
    // cards (a synthetic wordId, see src/lib/wordId.js), so give the reviewer
    // a snapshot of what the submitter actually saw.
    if (!word.wordId || isSyntheticWordId(word.wordId)) {
      payload.snapshot = { phrase: word.phrase, chinese: word.chinese, meaning: word.meaning, romanisation: word.romanisation };
      payload.source = { gameMode: word.gameMode, category: word.category, staticSource: word.staticSource };
    }

    setSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, wordId: word.wordId || undefined, dialect: word.dialect, payload, reason: reason.trim() || null, ...audioFields }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit", "error");
      } else {
        if (INSTANT_PUBLISH_TYPES.includes(type)) {
          showToast("Published! The community can now see and vote on it.", "success");
          refreshOverlay();
        } else {
          showToast("Thanks! A Language Custodian will review your submission.", "success");
        }
        onClose();
      }
    } catch (e) {
      console.error("Failed to submit contribution:", e);
      showToast("Network error — please try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function currentFieldValue() {
    if (field === "spelling") return word.chinese;
    if (field === "romanisation") return word.romanisation;
    if (field === "definition") return word.meaning;
    return "";
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px, 4vw, 24px)" }}
      onClick={onClose}>
      <div ref={containerRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        style={{ background: "white", borderRadius: 20, padding: "clamp(20px, 5vw, 32px)", maxWidth: 460, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", outline: "none" }}
        onClick={e => e.stopPropagation()}>
        <div id={titleId} style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 8 }}>{word.phrase} · {word.meaning}</div>
        {type !== "error_flag" && (
          <div style={{ fontSize: 12, color: "#8B7355", background: "#FAF6F0", border: "1px solid #F0E8DA", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
            This goes live right away, added alongside the existing entry — it doesn't replace it. The community votes on it from there; a custodian can still remove anything that shouldn't be up.
          </div>
        )}

        {type === "interpretation" && (
          <>
            <label htmlFor="cm-meaning" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>What does this word mean to you?</label>
            <textarea id="cm-meaning" value={meaning} onChange={e => setMeaning(e.target.value)} rows={3}
              placeholder="How your family or your community uses it — even if it differs from the entry above"
              className="input" style={{ marginBottom: 16, resize: "vertical", padding: 12 }} />
          </>
        )}

        {type === "correction" && (
          <>
            <label htmlFor="cm-field" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Which part would you change?</label>
            <select id="cm-field" value={field} onChange={e => setField(e.target.value)} className="input" style={{ height: 44, marginBottom: 16 }}>
              {CORRECTION_FIELDS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <label htmlFor="cm-proposed-value" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Your proposed value</label>
            <input id="cm-proposed-value" type="text" value={proposedValue} onChange={e => setProposedValue(e.target.value)}
              placeholder={currentFieldValue() ? `Current: ${currentFieldValue()}` : "Enter your proposed value"}
              className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        {type === "usage_example" && (
          <>
            <label htmlFor="cm-example-text" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Example sentence</label>
            <textarea id="cm-example-text" value={exampleText} onChange={e => setExampleText(e.target.value)} rows={2}
              placeholder="e.g. how this word is used in a real sentence"
              className="input" style={{ marginBottom: 16, resize: "vertical", padding: 12 }} />
            <label htmlFor="cm-translation" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Translation (optional)</label>
            <input id="cm-translation" type="text" value={translation} onChange={e => setTranslation(e.target.value)} className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        {type === "pronunciation_audio" && (
          <AudioRecorder onAudioReady={setAudioClip} onClear={() => setAudioClip(null)} />
        )}

        {type === "error_flag" && (
          <>
            <label htmlFor="cm-description" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>What's wrong with this entry?</label>
            <textarea id="cm-description" value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the issue you noticed..."
              className="input" style={{ marginBottom: 16, resize: "vertical", padding: 12 }} />
          </>
        )}

        {type !== "error_flag" && (
          <>
            <label htmlFor="cm-context-note" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Context note (optional)</label>
            <input id="cm-context-note" type="text" value={contextNote} onChange={e => setContextNote(e.target.value)}
              placeholder={`e.g. "This is how my grandma from Penang says it"`}
              className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        <label htmlFor="cm-reason" style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Why do you think this is right? (optional)</label>
        <textarea id="cm-reason" value={reason} onChange={e => setReason(e.target.value)} rows={2}
          placeholder={type === "error_flag" ? "Any evidence or background that helps a custodian review this" : "Any evidence or background that helps others judge this"}
          className="input" style={{ marginBottom: 24, resize: "vertical", padding: 12 }} />

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: submitting ? "default" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
