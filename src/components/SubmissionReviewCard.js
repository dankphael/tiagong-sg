'use client';

import { useState } from "react";

const TYPE_LABELS = {
  correction: "Correction",
  new_word: "New Word",
  usage_example: "Usage Example",
  error_flag: "Error Flag",
};

// Renders one pending contribution in the custodian review queue, with
// Accept / Reject actions. `currentWord` is the existing dictionary entry
// (from apiWords), resolved by word_id, used to show current-vs-proposed
// for corrections.
export default function SubmissionReviewCard({ submission, currentWord, onReview }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submitterName = `${submission.first_name || ''} ${submission.last_name || ''}`.trim() || 'Unknown';

  async function handle(action) {
    setBusy(true);
    await onReview(submission.id, action, action === 'reject' ? note.trim() || null : null);
    setBusy(false);
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <span style={{ fontSize: 11, background: "#FEF3E2", color: "#D4860B", padding: "3px 10px", borderRadius: 8, fontWeight: 700, marginRight: 6 }}>
            {TYPE_LABELS[submission.type] || submission.type}
          </span>
          <span style={{ fontSize: 11, background: "#F5F0EA", color: "#6B5B45", padding: "3px 10px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
            {submission.dialect}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#9B8B75" }}>Submitted by {submitterName}</div>
      </div>

      {currentWord && (
        <div style={{ fontSize: 13, color: "#1A1208", fontWeight: 600, marginBottom: 8 }}>
          {currentWord.phrase} · {currentWord.chinese} · {currentWord.meaning}
        </div>
      )}

      {submission.type === "correction" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "#FAF6F0" }}>
            <div style={{ fontSize: 11, color: "#9B8B75", marginBottom: 2 }}>Current ({submission.payload?.field})</div>
            <div style={{ fontSize: 13, color: "#1A1208" }}>{submission.payload?.currentValue || "—"}</div>
          </div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "#EAFAF1" }}>
            <div style={{ fontSize: 11, color: "#1A6B3C", marginBottom: 2 }}>Proposed</div>
            <div style={{ fontSize: 13, color: "#1A1208", fontWeight: 600 }}>{submission.payload?.proposedValue}</div>
          </div>
        </div>
      )}

      {submission.type === "new_word" && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FAF6F0", marginBottom: 10, fontSize: 13, color: "#1A1208" }}>
          <div><strong>{submission.payload?.romanized}</strong> {submission.payload?.traditional}</div>
          <div style={{ color: "#6B5B45" }}>{submission.payload?.english}</div>
          {submission.payload?.partOfSpeech && <div style={{ fontSize: 12, color: "#9B8B75" }}>{submission.payload.partOfSpeech}</div>}
        </div>
      )}

      {submission.type === "usage_example" && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FAF6F0", marginBottom: 10, fontSize: 13, color: "#1A1208" }}>
          "{submission.payload?.exampleText}"
          {submission.payload?.translation && <div style={{ color: "#6B5B45", fontSize: 12 }}>{submission.payload.translation}</div>}
        </div>
      )}

      {submission.type === "error_flag" && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FDEDEC", marginBottom: 10, fontSize: 13, color: "#1A1208" }}>
          {submission.payload?.description}
        </div>
      )}

      {submission.payload?.contextNote && (
        <div style={{ fontSize: 12, color: "#8B7355", fontStyle: "italic", marginBottom: 10 }}>Context: {submission.payload.contextNote}</div>
      )}
      {submission.reason && (
        <div style={{ fontSize: 12, color: "#8B7355", marginBottom: 10 }}>Reason: {submission.reason}</div>
      )}

      {rejecting && (
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="Optional note for the submitter..."
          className="input" style={{ marginBottom: 10, resize: "vertical", padding: 10, fontSize: 13 }} />
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {rejecting ? (
          <>
            <button onClick={() => setRejecting(false)} disabled={busy}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#F5F0EA", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
              Cancel
            </button>
            <button onClick={() => handle('reject')} disabled={busy}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#C0392B", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Confirm Reject
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setRejecting(true)} disabled={busy}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Reject
            </button>
            <button onClick={() => handle('accept')} disabled={busy}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#1A6B3C", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Accept
            </button>
          </>
        )}
      </div>
    </div>
  );
}
