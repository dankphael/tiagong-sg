'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { dialects } from "@/data/staticData";
import AudioRecorder from "@/components/AudioRecorder";

const STEP_COUNT = 6;

const EMPTY_FORM = { dialect: "hokkien", romanized: "", traditional: "", english: "", partOfSpeech: "", contextNote: "", reason: "" };

// One-question-per-screen wizard for submitting a new word — built for
// older contributors who found the old flat 6-field form overwhelming.
// Large text/buttons, a progress trail, and a Back button at every step.
export default function NewWordWizard({ onSubmitted }) {
  const router = useRouter();
  const { currentUser, showToast } = useApp();

  const [step, setStep] = useState(0); // 0-5, then "done"
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [audio, setAudio] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [touchedWordStep, setTouchedWordStep] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const wordFilled = form.romanized.trim() || form.traditional.trim();

  function goNext() {
    if (step === 1 && !wordFilled) { setTouchedWordStep(true); return; }
    setStep(s => Math.min(s + 1, STEP_COUNT - 1));
  }

  function goBack() {
    setStep(s => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!currentUser) {
      showToast("Sign in to contribute", "error");
      router.push("/signin?next=" + encodeURIComponent("/contribute"));
      return;
    }
    if (!wordFilled) { setStep(1); setTouchedWordStep(true); return; }

    setSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "new_word",
          dialect: form.dialect,
          payload: {
            romanized: form.romanized.trim(),
            traditional: form.traditional.trim(),
            english: form.english.trim(),
            partOfSpeech: form.partOfSpeech.trim(),
            contextNote: form.contextNote.trim(),
          },
          reason: form.reason.trim() || null,
          ...(audio ? { audioData: audio.base64, audioMimeType: audio.mimeType, durationMs: audio.durationMs } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to submit", "error");
        return;
      }
      onSubmitted?.(data);
      setDone(true);
    } catch (e) {
      console.error("Failed to submit new word:", e);
      showToast("Network error — please try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function addAnother() {
    setForm(f => ({ ...EMPTY_FORM, dialect: f.dialect }));
    setAudio(null);
    setTouchedWordStep(false);
    setStep(0);
    setDone(false);
  }

  const dialectName = dialects.find(d => d.id === form.dialect)?.name || form.dialect;

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "24px 8px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EAFAF1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Check size={32} color="#1A6B3C" />
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#1A1208", marginBottom: 10 }}>Thank you!</div>
        <p style={{ fontSize: 17, color: "#6B5B45", marginBottom: 24 }}>A Language Custodian will review your word soon.</p>
        <button className="btn-primary" onClick={addAnother} style={{ minHeight: 56, fontSize: 18, padding: "0 28px" }}>
          Add Another Word
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }} aria-label={`Step ${step + 1} of ${STEP_COUNT}`}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i <= step ? "#C0392B" : "#E8DDD0" }} />
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 16, color: "#9B8B75", marginBottom: 24 }}>Step {step + 1} of {STEP_COUNT}</div>

      {step === 0 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20, textAlign: "center" }}>
            Which dialect is this word from?
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {dialects.map(d => {
              const selected = form.dialect === d.id;
              return (
                <button key={d.id} type="button" onClick={() => { set("dialect", d.id); goNext(); }}
                  style={{ width: "100%", minHeight: 56, borderRadius: 12, border: "2px solid " + (selected ? "#C0392B" : "#E8DDD0"), background: selected ? "#FDF0EF" : "white", color: selected ? "#C0392B" : "#1A1208", fontSize: 18, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {selected ? "✓ " : ""}{d.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 12, textAlign: "center" }}>
            How do you write the word?
          </h3>
          <p style={{ fontSize: 16, color: "#8B7355", textAlign: "center", marginBottom: 20 }}>
            Fill in at least one — however you know it is fine.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 17, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Romanized spelling</label>
            <input type="text" value={form.romanized} onChange={e => set("romanized", e.target.value)}
              className="input" style={{ height: 56, fontSize: 20, padding: "0 16px" }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 17, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Chinese characters</label>
            <input type="text" value={form.traditional} onChange={e => set("traditional", e.target.value)}
              className="input" style={{ height: 56, fontSize: 20, padding: "0 16px" }} />
          </div>
          {touchedWordStep && !wordFilled && (
            <p style={{ fontSize: 15, color: "#C0392B", marginTop: 8 }}>Please fill in at least one of these.</p>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20, textAlign: "center" }}>
            What does it mean in English?
          </h3>
          <input type="text" value={form.english} onChange={e => set("english", e.target.value)}
            className="input" style={{ height: 56, fontSize: 20, padding: "0 16px" }} placeholder="Optional" />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 12, textAlign: "center" }}>
            Say it out loud (optional)
          </h3>
          <p style={{ fontSize: 16, color: "#8B7355", textAlign: "center", marginBottom: 20 }}>
            Hearing the word helps other members learn the correct pronunciation.
          </p>
          <AudioRecorder onAudioReady={a => setAudio(a)} onClear={() => setAudio(null)} />
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20, textAlign: "center" }}>
            Anything else? (all optional)
          </h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 17, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Part of speech</label>
            <input type="text" value={form.partOfSpeech} onChange={e => set("partOfSpeech", e.target.value)}
              placeholder="e.g. verb, noun" className="input" style={{ height: 52, fontSize: 18, padding: "0 16px" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 17, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>When or how is this word used?</label>
            <input type="text" value={form.contextNote} onChange={e => set("contextNote", e.target.value)}
              className="input" style={{ height: 52, fontSize: 18, padding: "0 16px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 17, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Why should this be added?</label>
            <textarea value={form.reason} onChange={e => set("reason", e.target.value)} rows={3}
              className="input" style={{ resize: "vertical", padding: 14, fontSize: 18 }} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20, textAlign: "center" }}>
            Check your word
          </h3>
          <div style={{ background: "#FAF6F0", border: "1px solid #F0E8DA", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <SummaryRow label="Dialect" value={dialectName} onEdit={() => setStep(0)} />
            <SummaryRow label="Word" value={[form.romanized, form.traditional].filter(Boolean).join(" / ") || "—"} onEdit={() => setStep(1)} />
            <SummaryRow label="Meaning" value={form.english || "—"} onEdit={() => setStep(2)} />
            <SummaryRow label="Recording" value={audio ? `${(audio.durationMs / 1000).toFixed(1)}s recorded` : "None"} onEdit={() => setStep(3)} />
            {(form.partOfSpeech || form.contextNote || form.reason) && (
              <SummaryRow label="Extra details" value="Added" onEdit={() => setStep(4)} last />
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        {step > 0 && (
          <button type="button" className="btn-secondary" onClick={goBack}
            style={{ minHeight: 52, fontSize: 17, flex: step === STEP_COUNT - 1 ? "0 0 120px" : 1 }}>
            Back
          </button>
        )}
        {step === 3 && (
          <button type="button" className="btn-secondary" onClick={goNext} style={{ minHeight: 52, fontSize: 17, flex: 1 }}>
            Skip
          </button>
        )}
        {step < STEP_COUNT - 1 ? (
          <button type="button" className="btn-primary" onClick={goNext}
            disabled={step === 1 && touchedWordStep && !wordFilled}
            style={{ minHeight: 56, fontSize: 18, flex: 1 }}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}
            style={{ minHeight: 56, fontSize: 18, flex: 1 }}>
            {submitting ? "Submitting..." : "Submit Word"}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, onEdit, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: last ? "none" : "1px solid #F0E8DA" }}>
      <div>
        <div style={{ fontSize: 13, color: "#9B8B75", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 17, color: "#1A1208" }}>{value}</div>
      </div>
      <button type="button" onClick={onEdit} style={{ background: "none", border: "none", color: "#C0392B", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "8px 4px" }}>
        Edit
      </button>
    </div>
  );
}
