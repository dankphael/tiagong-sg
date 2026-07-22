'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { dialects } from "@/data/staticData";
import { XP_REWARDS } from "@/data/xpSystem";

const STATUS_COLORS = {
  pending: { bg: "#FEF3E2", color: "#D4860B" },
  accepted: { bg: "#EAFAF1", color: "#1A6B3C" },
  rejected: { bg: "#FDEDEC", color: "#C0392B" },
};

const TYPE_LABELS = {
  correction: "Correction",
  new_word: "New Word",
  usage_example: "Usage Example",
  error_flag: "Error Flag",
  pronunciation_audio: "Pronunciation",
};

export default function ContributePage() {
  const router = useRouter();
  const { currentUser, showToast } = useApp();

  const [newWordForm, setNewWordForm] = useState({ dialect: "hokkien", romanized: "", traditional: "", english: "", mandarin: "", partOfSpeech: "", contextNote: "", reason: "" });
  const [submittingWord, setSubmittingWord] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const [applicationForm, setApplicationForm] = useState({ dialects: [], background: "", credentials: "", huayKuan: "" });
  const [application, setApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (currentUser?.huayKuan) setApplicationForm(f => ({ ...f, huayKuan: currentUser.huayKuan }));
  }, [currentUser?.huayKuan]);

  useEffect(() => {
    if (!currentUser) { setSubmissionsLoading(false); setApplicationLoading(false); return; }
    const token = localStorage.getItem("auth_token");
    if (!token) { setSubmissionsLoading(false); setApplicationLoading(false); return; }

    fetch("/api/contributions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to load submissions:", err))
      .finally(() => setSubmissionsLoading(false));

    fetch("/api/custodian/apply", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setApplication(data || null))
      .catch(err => console.error("Failed to load application:", err))
      .finally(() => setApplicationLoading(false));
  }, [currentUser?.id]);

  async function submitNewWord() {
    if (!currentUser) { showToast("Sign in to contribute", "error"); router.push("/signin?next=" + encodeURIComponent("/contribute")); return; }
    if (!newWordForm.romanized.trim() && !newWordForm.traditional.trim()) {
      showToast("Please enter at least a romanized or Chinese-character form", "error");
      return;
    }
    setSubmittingWord(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "new_word",
          dialect: newWordForm.dialect,
          payload: {
            romanized: newWordForm.romanized.trim(),
            traditional: newWordForm.traditional.trim(),
            english: newWordForm.english.trim(),
            mandarin: newWordForm.mandarin.trim(),
            partOfSpeech: newWordForm.partOfSpeech.trim(),
            contextNote: newWordForm.contextNote.trim(),
          },
          reason: newWordForm.reason.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit", "error");
      } else {
        showToast("Thanks! A Language Custodian will review your new word.", "success");
        setSubmissions(s => [data, ...s]);
        setNewWordForm({ dialect: newWordForm.dialect, romanized: "", traditional: "", english: "", mandarin: "", partOfSpeech: "", contextNote: "", reason: "" });
      }
    } catch (e) {
      console.error("Failed to submit new word:", e);
      showToast("Network error — please try again", "error");
    } finally {
      setSubmittingWord(false);
    }
  }

  async function submitApplication() {
    if (!currentUser) { showToast("Sign in to apply", "error"); router.push("/signin?next=" + encodeURIComponent("/contribute")); return; }
    if (applicationForm.dialects.length === 0) { showToast("Select at least one dialect", "error"); return; }
    if (!applicationForm.background.trim()) { showToast("Please share your dialect background", "error"); return; }
    setSubmittingApplication(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/custodian/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(applicationForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit application", "error");
      } else {
        showToast("Application submitted!", "success");
        setApplication(data);
      }
    } catch (e) {
      console.error("Failed to submit application:", e);
      showToast("Network error — please try again", "error");
    } finally {
      setSubmittingApplication(false);
    }
  }

  const isCustodian = currentUser?.custodianDialects?.length > 0;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Community</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 42, color: "#1A1208", marginBottom: 12 }}>Contribute</h1>
        <p style={{ color: "#8B7355", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
          Language is alive. Spellings, meanings, and everyday usage shift between generations and families —
          help us keep the dictionary honest by proposing new words and corrections. Language Custodians,
          our dialect experts, review every submission.
        </p>
      </div>

      {!currentUser ? (
        <div className="card" style={{ padding: 36, textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: "#8B7355", fontSize: 14 }}>Sign in to submit a new word or apply to become a Language Custodian.</p>
        </div>
      ) : (
        <>
          {/* Add a new word */}
          <div className="card" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 16 }}>Add a New Word</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect</label>
                <select value={newWordForm.dialect} onChange={e => setNewWordForm(f => ({ ...f, dialect: e.target.value }))} className="input" style={{ height: 44 }}>
                  {dialects.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Part of speech (optional)</label>
                <input type="text" value={newWordForm.partOfSpeech} onChange={e => setNewWordForm(f => ({ ...f, partOfSpeech: e.target.value }))}
                  placeholder="e.g. verb, noun" className="input" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Romanized spelling</label>
                <input type="text" value={newWordForm.romanized} onChange={e => setNewWordForm(f => ({ ...f, romanized: e.target.value }))} className="input" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Chinese characters</label>
                <input type="text" value={newWordForm.traditional} onChange={e => setNewWordForm(f => ({ ...f, traditional: e.target.value }))} className="input" />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>English meaning</label>
              <input type="text" value={newWordForm.english} onChange={e => setNewWordForm(f => ({ ...f, english: e.target.value }))} className="input" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Context note (optional)</label>
              <input type="text" value={newWordForm.contextNote} onChange={e => setNewWordForm(f => ({ ...f, contextNote: e.target.value }))}
                placeholder="When/how is this word used?" className="input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Why should this be added? (optional)</label>
              <textarea value={newWordForm.reason} onChange={e => setNewWordForm(f => ({ ...f, reason: e.target.value }))} rows={2}
                className="input" style={{ resize: "vertical", padding: 12 }} />
            </div>

            <button className="btn-primary" onClick={submitNewWord} disabled={submittingWord} style={{ width: "100%" }}>
              {submittingWord ? "Submitting..." : "Submit New Word"}
            </button>
          </div>

          {/* My submissions */}
          <div className="card" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 16 }}>My Submissions</div>
            {submissionsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1].map(i => <div key={i} className="shimmer" style={{ background: "#F0E8DA", borderRadius: 10, height: 56 }} />)}
              </div>
            ) : !Array.isArray(submissions) || submissions.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9B8B75" }}>You haven't submitted anything yet. Add a new word above, or suggest an edit from the Dictionary.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {submissions.map(s => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
                  return (
                    <div key={s.id} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E8DDD0", background: "#FAF6F0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1208" }}>{TYPE_LABELS[s.type] || s.type}</span>
                        <span style={{ fontSize: 11, background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>{s.status}</span>
                      </div>
                      {s.payload?.proposedValue && <div style={{ fontSize: 13, color: "#6B5B45" }}>→ {s.payload.proposedValue}</div>}
                      {s.payload?.romanized && <div style={{ fontSize: 13, color: "#6B5B45" }}>{s.payload.romanized} — {s.payload.english}</div>}
                      {s.payload?.exampleText && <div style={{ fontSize: 13, color: "#6B5B45" }}>"{s.payload.exampleText}"</div>}
                      {s.payload?.description && <div style={{ fontSize: 13, color: "#6B5B45" }}>{s.payload.description}</div>}
                      {s.type === "pronunciation_audio" && (
                        <div style={{ fontSize: 13, color: "#6B5B45" }}>Pronunciation recording{s.duration_ms ? ` (${(s.duration_ms / 1000).toFixed(1)}s)` : ""}</div>
                      )}
                      {s.status === "rejected" && s.review_note && (
                        <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6, fontStyle: "italic" }}>Custodian note: {s.review_note}</div>
                      )}
                      {s.status === "accepted" && (
                        <div style={{ fontSize: 12, color: "#1A6B3C", marginTop: 6 }}>+{XP_REWARDS.contributionAccepted} XP awarded</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Become a custodian */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 8 }}>Become a Language Custodian</div>
            <p style={{ fontSize: 14, color: "#8B7355", marginBottom: 20 }}>
              Custodians are trusted dialect experts who review community submissions for their dialect(s).
            </p>

            {applicationLoading ? (
              <div className="shimmer" style={{ background: "#F0E8DA", borderRadius: 10, height: 56 }} />
            ) : isCustodian ? (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 14, color: "#1A6B3C", fontWeight: 600 }}>
                You're a Language Custodian for {currentUser.custodianDialects.join(", ")}. Visit the Custodian console to review submissions.
              </div>
            ) : application ? (
              <div style={{ padding: "14px 16px", borderRadius: 10, background: STATUS_COLORS[application.status]?.bg || "#FEF3E2", border: "1px solid #E8DDD0", fontSize: 14, color: STATUS_COLORS[application.status]?.color || "#D4860B", fontWeight: 600 }}>
                Your application is {application.status}.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Dialects you're an expert in</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {dialects.map(d => {
                      const checked = applicationForm.dialects.includes(d.id);
                      return (
                        <button key={d.id} type="button"
                          onClick={() => setApplicationForm(f => ({ ...f, dialects: checked ? f.dialects.filter(x => x !== d.id) : [...f.dialects, d.id] }))}
                          style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid " + (checked ? "#C0392B" : "#E8DDD0"), background: checked ? "#FDF0EF" : "white", color: checked ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          {checked ? "✓ " : ""}{d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Your dialect background</label>
                  <textarea value={applicationForm.background} onChange={e => setApplicationForm(f => ({ ...f, background: e.target.value }))} rows={3}
                    placeholder="e.g. native speaker, grew up speaking this at home, studied linguistics..."
                    className="input" style={{ resize: "vertical", padding: 12 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Credentials (optional)</label>
                  <input type="text" value={applicationForm.credentials} onChange={e => setApplicationForm(f => ({ ...f, credentials: e.target.value }))} className="input" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Huay kuan affiliation (optional)</label>
                  <input type="text" value={applicationForm.huayKuan} onChange={e => setApplicationForm(f => ({ ...f, huayKuan: e.target.value }))} className="input" />
                </div>
                <button className="btn-primary" onClick={submitApplication} disabled={submittingApplication} style={{ width: "100%" }}>
                  {submittingApplication ? "Submitting..." : "Apply to Become a Custodian"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
