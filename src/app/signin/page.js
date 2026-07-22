'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { Mars, Venus, BookOpen, PenLine, Handshake } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { getAvatar } from "@/lib/avatar";
import { dialects } from "@/data/staticData";

const BENEFITS = [
  { icon: BookOpen, text: "Save your streak and XP across devices" },
  { icon: PenLine, text: "Contribute words, examples, and recordings" },
  { icon: Handshake, text: "Connect with Sin Sehs and fellow learners" },
];

// Only ever redirect within the site — an attacker-controlled ?next= must
// never be honored as an open redirect.
function safeNext(raw) {
  if (!raw || typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const dialectParam = dialects.find(d => d.id === searchParams.get("dialect"));
  const {
    currentUser, pendingGoogle, handleGoogleSuccess, completeProfile,
    authError, setAuthError,
  } = useApp();

  const [form, setForm] = useState({ firstName: "", lastName: "", languageInterest: dialectParam?.name || "", gender: "", role: "mentee" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace(next || "/profile");
  }, [currentUser, next, router]);

  useEffect(() => {
    if (pendingGoogle) {
      setForm(f => ({
        ...f,
        firstName: pendingGoogle.googleData?.firstName || "",
        lastName: pendingGoogle.googleData?.lastName || "",
      }));
    }
  }, [pendingGoogle]);

  function onGoogleSuccess(credentialResponse) {
    setAuthError(null);
    handleGoogleSuccess(credentialResponse).then(result => {
      if (result?.signedIn) router.push(next || "/");
    });
  }

  function submitCompletion() {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "Please enter your first name";
    if (!form.languageInterest) errors.languageInterest = "Pick a dialect you're learning";
    if (!form.gender) errors.gender = "Please select your gender";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    completeProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      languageInterest: form.languageInterest,
      gender: form.gender,
      role: form.role,
    }).then(ok => {
      setSubmitting(false);
      if (ok) router.push(next || "/");
    });
  }

  if (currentUser) return null;

  if (pendingGoogle) {
    return (
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
        <div className="card" style={{ padding: 32 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 6 }}>Almost there</div>
          <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 24 }}>
            Signed in as <strong>{pendingGoogle.googleData?.email}</strong>. Just a few essentials to get started — you can fill in the rest of your profile any time.
          </p>

          <div className="form-grid-2" style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>First name</label>
              <input className="input" type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
              {fieldErrors.firstName && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 4 }}>{fieldErrors.firstName}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Last name</label>
              <input className="input" type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Which dialect are you learning?</label>
            <div className="pill-toggle" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {dialects.map(d => (
                <button key={d.id} type="button" onClick={() => setForm(f => ({ ...f, languageInterest: d.name }))}
                  className={form.languageInterest === d.name ? "active" : ""}
                  style={{ padding: "8px 14px", borderRadius: 20, border: "2px solid " + (form.languageInterest === d.name ? d.color : "#E8DDD0"), background: form.languageInterest === d.name ? `${d.color}18` : "white", color: form.languageInterest === d.name ? d.color : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {d.icon} {d.name}
                </button>
              ))}
            </div>
            {fieldErrors.languageInterest && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{fieldErrors.languageInterest}</div>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Gender</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[["male", Mars, "Male"], ["female", Venus, "Female"]].map(([val, Icon, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, gender: val }))}
                  style={{ flex: 1, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (form.gender === val ? "#C0392B" : "#E8DDD0"), background: form.gender === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 4, display: "flex", justifyContent: "center" }}><Icon size={20} /></div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.gender === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                </button>
              ))}
            </div>
            {fieldErrors.gender && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{fieldErrors.gender}</div>}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>I want to join as a</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[["mentee", "Learner"], ["mentor", "Sin Seh"], ["both", "Both"]].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm(f => ({ ...f, role: val }))}
                  style={{ flex: 1, minWidth: 90, padding: "10px 12px", borderRadius: 10, border: "2px solid " + (form.role === val ? "#C0392B" : "#E8DDD0"), background: form.role === val ? "#FDF0EF" : "white", color: form.role === val ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={submitCompletion} disabled={submitting} style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Setting up…" : "Start learning"}
          </button>

          {authError && (
            <div style={{ marginTop: 16, padding: 12, background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 10, color: "#C0392B", fontSize: 13 }}>
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "64px 24px" }} className="fade-up">
      <div className="card" style={{ padding: 36, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>{getAvatar("male", "mentee")}</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 8 }}>Sign in to tiagongSG</div>
        <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 24 }}>
          A language lost is a worldview lost.
        </p>

        <div style={{ textAlign: "left", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          {BENEFITS.map(({ icon: Icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6B5B45" }}>
              <Icon size={16} color="#C0392B" style={{ flexShrink: 0 }} /> {text}
            </div>
          ))}
        </div>

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => setAuthError("Google sign-in failed")}
              text="signin_with"
            />
          </div>
        ) : (
          <div style={{ padding: 12, background: "#F5F0EA", borderRadius: 10, color: "#6B5B45", fontSize: 13 }}>
            Sign-in is temporarily unavailable — please check back soon.
          </div>
        )}

        {authError && (
          <div style={{ marginTop: 16, padding: 12, background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 10, color: "#C0392B", fontSize: 13 }}>
            {authError}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <SignInContent />
    </Suspense>
  );
}
