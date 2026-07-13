'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Heart, ChevronDown, ChevronUp, Check, Sparkles } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { dialects } from "@/data/staticData";
import AudioRecorder from "@/components/AudioRecorder";

const STATUS_FILTERS = [
  ["", "All"],
  ["open", "Open"],
  ["answered", "Answered"],
];

// Shared Audio instance so starting a new clip stops whichever is playing —
// same pattern as VariantChips.js.
let sharedAudio = null;
function playClip(audioClipId, onError) {
  if (sharedAudio) { sharedAudio.pause(); sharedAudio = null; }
  const audio = new Audio(`/api/audio/${audioClipId}`);
  sharedAudio = audio;
  audio.play().catch(() => onError?.());
}

export default function AskPage() {
  const { currentUser, showToast, myVotes, toggleVote } = useApp();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialectFilter, setDialectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [askForm, setAskForm] = useState({ dialect: "hokkien", title: "", detail: "" });
  const [asking, setAsking] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({}); // id -> detail payload
  const [detailLoading, setDetailLoading] = useState(false);

  function loadQuestions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (dialectFilter) params.set("dialect", dialectFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/questions?${params}`)
      .then(r => r.json())
      .then(data => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => showToast("Couldn't load questions", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadQuestions(); }, [dialectFilter, statusFilter]);

  async function toggleExpand(id) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!details[id]) {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/questions/${id}`);
        const data = await res.json();
        if (res.ok) setDetails(d => ({ ...d, [id]: data }));
      } catch (e) {
        showToast("Couldn't load this question", "error");
      } finally {
        setDetailLoading(false);
      }
    }
  }

  async function submitQuestion() {
    if (!currentUser) { showToast("Sign in to ask a question", "error"); return; }
    const title = askForm.title.trim();
    if (title.length < 5) { showToast("Please write a fuller question (at least 5 characters)", "error"); return; }
    setAsking(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dialect: askForm.dialect, title, detail: askForm.detail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to post question", "error"); return; }
      setAskForm(f => ({ ...f, title: "", detail: "" }));
      showToast("Question posted!", "success");
      loadQuestions();
    } catch (e) {
      showToast("Network error — please try again", "error");
    } finally {
      setAsking(false);
    }
  }

  function refreshDetail(id) {
    fetch(`/api/questions/${id}`)
      .then(r => r.json())
      .then(data => setDetails(d => ({ ...d, [id]: data })))
      .catch(() => {});
  }

  async function acceptAnswer(questionId, answerId) {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "accept", answerId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to accept answer", "error"); return; }
      showToast("Answer accepted!", "success");
      refreshDetail(questionId);
      loadQuestions();
    } catch (e) {
      showToast("Network error — please try again", "error");
    }
  }

  async function promoteAnswer(questionId, answerId) {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`/api/questions/${questionId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answerId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to promote answer", "error"); return; }
      showToast("Sent to the dictionary review queue!", "success");
    } catch (e) {
      showToast("Network error — please try again", "error");
    }
  }

  function attestAnswer(answerId) {
    if (!currentUser) { showToast("Sign in to attest", "error"); return; }
    toggleVote("answer", answerId);
  }

  const isCustodianFor = dialect => currentUser?.accountType === 'admin' ||
    (currentUser?.custodianDialects || []).includes(dialect);

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Community</div>
        <h1 className="display-1" style={{ fontSize: 38, marginBottom: 12 }}>Ask a Senior</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
          Not sure how to say something in your dialect? Ask, and native speakers can answer with
          text — and even a voice recording. The best answers can be added straight into the dictionary.
        </p>
      </div>

      {/* Ask box */}
      {currentUser ? (
        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "#1A1208", marginBottom: 14 }}>Ask a question</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {dialects.map(d => (
              <button key={d.id} type="button" onClick={() => setAskForm(f => ({ ...f, dialect: d.id }))}
                style={{ padding: "6px 14px", borderRadius: 20, border: "2px solid " + (askForm.dialect === d.id ? "#C0392B" : "#E8DDD0"), background: askForm.dialect === d.id ? "#FDF0EF" : "white", color: askForm.dialect === d.id ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {askForm.dialect === d.id ? "✓ " : ""}{d.name}
              </button>
            ))}
          </div>
          <input type="text" value={askForm.title} onChange={e => setAskForm(f => ({ ...f, title: e.target.value }))}
            placeholder="How do you say &quot;good morning&quot;?" className="input" style={{ marginBottom: 10 }} />
          <textarea value={askForm.detail} onChange={e => setAskForm(f => ({ ...f, detail: e.target.value }))} rows={2}
            placeholder="Any extra context (optional)" className="input" style={{ resize: "vertical", padding: 12, marginBottom: 14 }} />
          <button className="btn-primary" onClick={submitQuestion} disabled={asking} style={{ width: "100%" }}>
            {asking ? "Posting..." : "Post Question"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 28, textAlign: "center", marginBottom: 28 }}>
          <p style={{ color: "#8B7355", fontSize: 14 }}>Sign in to ask a question or answer one.</p>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setDialectFilter("")} style={filterPillStyle(dialectFilter === "")}>All dialects</button>
          {dialects.map(d => (
            <button key={d.id} onClick={() => setDialectFilter(d.id)} style={filterPillStyle(dialectFilter === d.id)}>{d.name}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_FILTERS.map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={filterPillStyle(statusFilter === val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Question list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map(i => <div key={i} className="shimmer" style={{ background: "#F0E8DA", borderRadius: 10, height: 70 }} />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "#9B8B75", fontSize: 14 }}>No questions yet — be the first to ask!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {questions.map(q => {
            const dialectObj = dialects.find(d => d.id === q.dialect);
            const expanded = expandedId === q.id;
            const detail = details[q.id];
            return (
              <div key={q.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <button onClick={() => toggleExpand(q.id)} style={{ width: "100%", textAlign: "left", padding: 20, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, background: dialectObj?.bg || "#F0E8DA", color: dialectObj?.color || "#6B5B45", padding: "3px 10px", borderRadius: 8, fontWeight: 700 }}>{dialectObj?.name || q.dialect}</span>
                      {q.status === "answered" && (
                        <span style={{ fontSize: 11, background: "#EAFAF1", color: "#1A6B3C", padding: "3px 10px", borderRadius: 8, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Check size={11} /> Answered
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1208" }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: "#9B8B75", marginTop: 2 }}>{q.askerName} · {q.answerCount} {q.answerCount === 1 ? "answer" : "answers"}</div>
                  </div>
                  {expanded ? <ChevronUp size={18} color="#9B8B75" /> : <ChevronDown size={18} color="#9B8B75" />}
                </button>

                {expanded && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #F0E8DA" }}>
                    {q.detail && <p style={{ fontSize: 13, color: "#6B5B45", marginTop: 16, marginBottom: 16, fontStyle: "italic" }}>{q.detail}</p>}
                    {detailLoading && !detail ? (
                      <div className="shimmer" style={{ background: "#F0E8DA", borderRadius: 10, height: 60, marginTop: 16 }} />
                    ) : detail ? (
                      <AnswerList
                        detail={detail}
                        currentUser={currentUser}
                        myVotes={myVotes}
                        onAttest={attestAnswer}
                        onAccept={answerId => acceptAnswer(q.id, answerId)}
                        onPromote={answerId => promoteAnswer(q.id, answerId)}
                        canPromote={isCustodianFor(q.dialect)}
                        showToast={showToast}
                      />
                    ) : null}
                    {currentUser && (
                      <AnswerForm questionId={q.id} onSubmitted={() => { refreshDetail(q.id); loadQuestions(); }} showToast={showToast} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function filterPillStyle(active) {
  return {
    padding: "6px 14px", borderRadius: 20, border: "1px solid " + (active ? "#C0392B" : "#E8DDD0"),
    background: active ? "#FDF0EF" : "white", color: active ? "#C0392B" : "#6B5B45",
    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  };
}

function AnswerList({ detail, currentUser, myVotes, onAttest, onAccept, onPromote, canPromote, showToast }) {
  const isAsker = currentUser?.id === detail.askerId;
  if (detail.answers.length === 0) {
    return <p style={{ fontSize: 13, color: "#9B8B75", marginTop: 16 }}>No answers yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
      {detail.answers.map(a => {
        const isAccepted = detail.acceptedAnswerId === a.id;
        const voted = myVotes.has(`answer:${a.id}`);
        return (
          <div key={a.id} style={{ padding: 16, borderRadius: 10, border: "1px solid " + (isAccepted ? "#1A6B3C" : "#E8DDD0"), background: isAccepted ? "#EAFAF1" : "#FAF6F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{a.romanized}</div>
                {a.chinese && <div style={{ fontFamily: "var(--font-chinese)", fontSize: 15, color: "#6B5B45" }}>{a.chinese}</div>}
                {a.explanation && <p style={{ fontSize: 13, color: "#6B5B45", marginTop: 6 }}>{a.explanation}</p>}
                {a.audioClipId && (
                  <button onClick={() => playClip(a.audioClipId, () => showToast("Couldn't play this recording", "error"))}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EAFAF1", border: "1px solid #1A6B3C40", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
                    <Play size={10} fill="currentColor" /> Hear it
                  </button>
                )}
                <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 8 }}>{a.authorName}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                {isAccepted && <span style={{ fontSize: 11, color: "#1A6B3C", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={12} /> Accepted</span>}
                <button onClick={() => onAttest(a.id)} title="This sounds right to me"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px", fontFamily: "inherit", color: voted ? "#C0392B" : "#9B8B75", fontSize: 12, fontWeight: 600 }}>
                  <Heart size={13} fill={voted ? "currentColor" : "none"} /> {a.voteCount > 0 ? a.voteCount : ""}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {isAsker && !isAccepted && detail.status === "open" && (
                <button className="btn-secondary" onClick={() => onAccept(a.id)} style={{ fontSize: 12, padding: "6px 12px" }}>Accept this answer</button>
              )}
              {canPromote && (
                <button className="btn-ghost" onClick={() => onPromote(a.id)} style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={12} /> Promote to dictionary
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnswerForm({ questionId, onSubmitted, showToast }) {
  const [form, setForm] = useState({ romanized: "", chinese: "", explanation: "" });
  const [audio, setAudio] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const romanized = form.romanized.trim();
    if (!romanized) { showToast("Please fill in how it's said", "error"); return; }
    setSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          romanized, chinese: form.chinese.trim(), explanation: form.explanation.trim(),
          ...(audio ? { audioData: audio.base64, audioMimeType: audio.mimeType, durationMs: audio.durationMs } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to submit answer", "error"); return; }
      setForm({ romanized: "", chinese: "", explanation: "" });
      setAudio(null);
      setShowRecorder(false);
      showToast("Answer posted!", "success");
      onSubmitted();
    } catch (e) {
      showToast("Network error — please try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#6B5B45", marginBottom: 10 }}>Add an answer</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <input type="text" value={form.romanized} onChange={e => setForm(f => ({ ...f, romanized: e.target.value }))}
          placeholder="How it's said" className="input" />
        <input type="text" value={form.chinese} onChange={e => setForm(f => ({ ...f, chinese: e.target.value }))}
          placeholder="Chinese characters (optional)" className="input" />
      </div>
      <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2}
        placeholder="Explain or give context (optional)" className="input" style={{ resize: "vertical", padding: 10, marginBottom: 8 }} />
      {showRecorder ? (
        <AudioRecorder onAudioReady={a => setAudio(a)} onClear={() => setAudio(null)} />
      ) : (
        <button type="button" className="btn-ghost" onClick={() => setShowRecorder(true)} style={{ fontSize: 12, marginBottom: 10 }}>
          + Add a voice recording
        </button>
      )}
      <button className="btn-primary" onClick={submit} disabled={submitting} style={{ width: "100%" }}>
        {submitting ? "Posting..." : "Post Answer"}
      </button>
    </div>
  );
}
