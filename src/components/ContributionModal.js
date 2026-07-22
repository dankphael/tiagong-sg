'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import AudioRecorder from "@/components/AudioRecorder";

const CORRECTION_FIELDS = [
  ["spelling", "Spelling / Chinese characters"],
  ["romanisation", "Romanisation"],
  ["definition", "Definition"],
  ["usage_context", "Usage context"],
];

// Single modal handling 'correction', 'usage_example', and 'error_flag'
// submissions against an existing dictionary word. New-word submissions
// are handled by the /contribute page form instead.
export default function ContributionModal({ word, type, onClose }) {
  const router = useRouter();
  const { currentUser, showToast } = useApp();
  const [field, setField] = useState("definition");
  const [proposedValue, setProposedValue] = useState("");
  const [exampleText, setExampleText] = useState("");
  const [translation, setTranslation] = useState("");
  const [description, setDescription] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [audioClip, setAudioClip] = useState(null); // { base64, mimeType, durationMs }

  if (!word) return null;

  const title = type === "correction" ? "Suggest an Edit"
    : type === "usage_example" ? "Add a Usage Example"
    : type === "pronunciation_audio" ? "Record Pronunciation"
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
    } else if (type === "pronunciation_audio") {
      if (!audioClip) { showToast("Record a clip first", "error"); return; }
      payload = { contextNote: contextNote.trim() };
      audioFields = { audioData: audioClip.base64, audioMimeType: audioClip.mimeType, durationMs: audioClip.durationMs };
    } else {
      if (!description.trim()) { showToast("Please describe the issue", "error"); return; }
      payload = { description: description.trim() };
      if (!word.wordId) {
        payload.snapshot = { phrase: word.phrase, chinese: word.chinese, meaning: word.meaning, romanisation: word.romanisation };
        payload.source = { gameMode: word.gameMode, category: word.category, staticSource: word.staticSource };
      }
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
        showToast("Thanks! A Language Custodian will review your submission.", "success");
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
      <div style={{ background: "white", borderRadius: 20, padding: "clamp(20px, 5vw, 32px)", maxWidth: 460, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#9B8B75", marginBottom: 20 }}>{word.phrase} · {word.meaning}</div>

        {type === "correction" && (
          <>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>What's wrong?</label>
            <select value={field} onChange={e => setField(e.target.value)} className="input" style={{ height: 44, marginBottom: 16 }}>
              {CORRECTION_FIELDS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Your proposed value</label>
            <input type="text" value={proposedValue} onChange={e => setProposedValue(e.target.value)}
              placeholder={currentFieldValue() ? `Current: ${currentFieldValue()}` : "Enter your proposed value"}
              className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        {type === "usage_example" && (
          <>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Example sentence</label>
            <textarea value={exampleText} onChange={e => setExampleText(e.target.value)} rows={2}
              placeholder="e.g. how this word is used in a real sentence"
              className="input" style={{ marginBottom: 16, resize: "vertical", padding: 12 }} />
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Translation (optional)</label>
            <input type="text" value={translation} onChange={e => setTranslation(e.target.value)} className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        {type === "pronunciation_audio" && (
          <AudioRecorder onAudioReady={setAudioClip} onClear={() => setAudioClip(null)} />
        )}

        {type === "error_flag" && (
          <>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>What's wrong with this entry?</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the issue you noticed..."
              className="input" style={{ marginBottom: 16, resize: "vertical", padding: 12 }} />
          </>
        )}

        {type !== "error_flag" && (
          <>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Context note (optional)</label>
            <input type="text" value={contextNote} onChange={e => setContextNote(e.target.value)}
              placeholder={`e.g. "This is how my grandma from Penang says it"`}
              className="input" style={{ marginBottom: 16 }} />
          </>
        )}

        <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Why do you think this is right? (optional)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
          placeholder="Any evidence or background that helps the custodian review this"
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
