'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Volume2 } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { speak } from "@/lib/tts";
import { SealChip } from "@/components/ui";
import { dialects, lessons } from "@/data/staticData";

const STEPS = ["pick", "micro-lesson", "done"];

export default function WelcomePage() {
  const router = useRouter();
  const { awardXp, handleGoogleSuccess, setAuthError, setSelectedDialect, markIntroSeen } = useApp();

  const [step, setStep] = useState(0);
  const [dialectId, setDialectId] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const dialect = dialects.find(d => d.id === dialectId);
  const microCards = dialect ? (lessons[dialect.id]?.greetings || []).slice(0, 3) : [];

  function goTo(idx) {
    setStep(idx);
  }

  function pickDialect(d) {
    setDialectId(d.id);
    setSelectedDialect(d.id);
    goTo(1);
  }

  function onKnowCard() {
    setEarnedXp(x => x + 10);
    awardXp(10, 'greeting learned');
    if (cardIndex < microCards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCardIndex(i => i + 1), 150);
    } else {
      setTimeout(() => goTo(2), 400);
    }
  }

  function goLearn() {
    markIntroSeen();
    router.push(dialectId ? `/learn/${dialectId}` : '/learn');
  }

  function skip() {
    markIntroSeen();
    router.push('/');
  }

  async function onSignIn(credentialResponse) {
    const result = await handleGoogleSuccess(credentialResponse);
    markIntroSeen();
    if (result?.needsProfile) {
      const next = dialectId ? `/learn/${dialectId}` : '/';
      router.push(`/signin?next=${encodeURIComponent(next)}${dialectId ? `&dialect=${dialectId}` : ''}`);
    } else {
      router.push(dialectId ? `/learn/${dialectId}` : '/');
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", minHeight: "70vh" }} className="fade-up">
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= step ? "var(--color-primary)" : "var(--color-border)" }} />
        ))}
      </div>

      {/* Step 0: Pick a dialect */}
      {step === 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Welcome to tiagong.sg</div>
            <h1 className="display-1" style={{ fontSize: 36, marginBottom: 12 }}>Pick a dialect to start</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
              A language lost is a worldview lost — you can always explore the others later.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {dialects.map(d => (
              <div key={d.id} className="card card-hover" style={{ padding: 20, cursor: "pointer", textAlign: "center" }}
                onClick={() => pickDialect(d)}>
                <SealChip dialect={d} size="lg" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{d.speakers}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button className="btn-ghost" onClick={skip}>Skip for now</button>
          </div>
        </div>
      )}

      {/* Step 1: Micro-lesson */}
      {step === 1 && dialect && microCards.length > 0 && (
        <div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{dialect.name} · Greetings</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Card {cardIndex + 1} of {microCards.length}</div>
          </div>
          <div className="progress" style={{ marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${((cardIndex + 1) / microCards.length) * 100}%`, background: dialect.color }} />
          </div>
          <div className="card-3d flashcard" style={{ marginBottom: 20, cursor: "pointer" }} onClick={() => setFlipped(!flipped)}>
            <div className={`card-inner ${flipped ? "flipped" : ""}`} style={{ height: "100%", width: "100%" }}>
              <div className="card-face" style={{ background: `linear-gradient(135deg, ${dialect.color}, ${dialect.accent})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
                <div className="romanized" style={{ fontSize: 36, fontWeight: 700, color: "white", textAlign: "center", padding: "0 24px" }}>
                  {microCards[cardIndex]?.phrase}
                </div>
                <div style={{ fontFamily: "var(--font-chinese)", fontSize: 22, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                  {microCards[cardIndex]?.chinese}
                </div>
                <button onClick={(e) => { e.stopPropagation(); speak(microCards[cardIndex]?.phrase, dialect.id); }}
                  className="btn-tts"
                  style={{ marginTop: 16, padding: "8px 20px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-pill)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <Volume2 size={15} /> Hear it
                </button>
              </div>
              <div className="card-face card-back" style={{ background: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `3px solid ${dialect.color}`, borderRadius: 20, padding: "24px 20px" }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, color: "var(--color-text)", textAlign: "center" }}>
                  {microCards[cardIndex]?.meaning}
                </div>
                <div style={{ fontSize: 13, color: dialect.color, marginTop: 8, fontWeight: 600 }}>
                  {microCards[cardIndex]?.romanisation}
                </div>
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={onKnowCard} style={{ width: "100%" }}>
            {cardIndex < microCards.length - 1 ? "Next phrase" : "Finish"} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: You're in — soft finish, no sign-up gate */}
      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Nice work!</div>
          <h1 className="display-1" style={{ fontSize: 32, marginBottom: 12 }}>You earned {earnedXp} XP</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 15, marginBottom: 28 }}>
            You're ready to keep going in {dialect?.name || "your dialect"}.
          </p>
          <button className="btn-primary" onClick={goLearn} style={{ width: "100%", marginBottom: 20 }}>
            Start learning {dialect?.name} <ArrowRight size={16} />
          </button>
          <div style={{ paddingTop: 20, borderTop: "1px solid var(--color-border)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginBottom: 14 }}>
              Want to save this progress across devices? Sign in — totally optional.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={onSignIn}
                onError={() => setAuthError("Google sign-in failed")}
                text="signup_with"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
