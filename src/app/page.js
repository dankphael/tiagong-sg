'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Flame, ArrowRight, BookOpen, Sparkles, PenLine, Mic, UserPlus } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { getLevel, getNextLevel, getLevelProgress } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";
import { relativeTime } from "@/lib/time";

const STRIP_ICONS = { contribution: PenLine, pronunciation: Mic, new_member: UserPlus };
const NUDGE_DISMISSED_KEY = 'tiagong_profile_nudge_dismissed';

// Sign-up is now minimal (name/dialect/gender only) — this nudges signed-in
// users who never filled in matchmaking preferences (no `intent` set) to
// finish their profile, without forcing it during sign-up itself.
function ProfileNudge() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(NUDGE_DISMISSED_KEY) === '1');
  }, []);
  if (dismissed) return null;
  return (
    <div className="card" style={{ padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "#FEF9E7", border: "1px solid #D4860B30" }}>
      <div style={{ fontSize: 13, color: "#6B5B45" }}>
        <strong style={{ color: "#1A1208" }}>Finish setting up your profile</strong> — add your availability and interests so Sin Sehs can find you.
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/profile" style={{ fontSize: 13, fontWeight: 600, color: "#D4860B", textDecoration: "none" }}>Complete profile →</Link>
        <button onClick={() => { localStorage.setItem(NUDGE_DISMISSED_KEY, '1'); setDismissed(true); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8B75", fontSize: 13, fontFamily: "inherit" }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Light "the community is alive" signal on home — latest 3 activity items
// with a link through to the full /community page. Renders nothing at all
// if the fetch fails or there's no activity yet, so it never looks broken.
function CommunityStrip({ dark }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    fetch('/api/community/activity')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setItems(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  const textColor = dark ? '#E8D4A8' : 'var(--color-text)';
  const mutedColor = dark ? '#A08060' : 'var(--color-text-muted)';

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: '#C0392B', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Sparkles size={13} /> Just happened
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {items.map((item, i) => {
          const Icon = STRIP_ICONS[item.kind] || Sparkles;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Icon size={13} style={{ flexShrink: 0, color: mutedColor }} />
              <span style={{ color: textColor, fontWeight: 600 }}>{item.name}</span>
              <span style={{ color: mutedColor }}>{item.label}</span>
              <span style={{ color: mutedColor, fontSize: 11 }}>· {relativeTime(item.at)}</span>
            </div>
          );
        })}
      </div>
      <Link href="/community" style={{ fontSize: 13, fontWeight: 600, color: '#C0392B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        See what's happening <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function DialectPlatformContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, xp, streak, dailyCompleted, progress, selectedDialect } = useApp();

  // Legacy ?screen=&dialect= query params (pre-route-split) redirect to
  // their new routes so old bookmarks/links keep working.
  useEffect(() => {
    const screenParam = searchParams.get('screen');
    const dialectParam = searchParams.get('dialect');

    const routeMap = {
      search: '/dictionary', singlish: '/singlish', network: '/network',
      profile: '/profile', associations: '/associations', about: '/about',
    };

    if (screenParam === 'lesson' || screenParam === 'quiz') {
      const id = dialectParam && dialects.find(d => d.id === dialectParam) ? dialectParam : 'hokkien';
      router.replace(`/learn/${id}`);
    } else if (screenParam && routeMap[screenParam]) {
      router.replace(routeMap[screenParam]);
    }
  }, [searchParams]);

  if (currentUser) {
    const level = getLevel(xp);
    const nextLevel = getNextLevel(xp);
    const levelProgress = getLevelProgress(xp);
    const dialect = dialects.find(d => d.id === selectedDialect) || dialects[0];
    const reviewDue = Object.keys(progress).length;

    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Welcome back</div>
          <h1 className="heading" style={{ fontSize: 32 }}>{currentUser.firstName}</h1>
        </div>

        {!currentUser.intent && <ProfileNudge />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <Flame size={28} color={dailyCompleted ? "#E8A33D" : "var(--color-text-faint)"} fill={dailyCompleted ? "#E8A33D" : "none"} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{streak}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>day streak</div>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
              <span>{level?.icon} {level?.name}</span>
              <span>{xp} XP</span>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: levelProgress + "%", background: level?.color || "var(--color-primary)" }} />
            </div>
            {nextLevel && (
              <div style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 6 }}>{nextLevel.minXP - xp} XP to {nextLevel.name}</div>
            )}
          </div>
        </div>

        <Link href={`/learn/${dialect.id}?mode=daily-challenge`} style={{ textDecoration: "none" }}>
          <div className="card card-hover" style={{ padding: 28, marginBottom: 20, background: "linear-gradient(135deg, #1A1208 0%, #2C1810 100%)", border: "1px solid #3D2A18", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                {dailyCompleted ? "Done for today" : "Today's Challenge"}
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#F5E6C8" }}>
                {dailyCompleted ? "See you tomorrow" : `10 questions in ${dialect.name}`}
              </div>
            </div>
            <div style={{ color: "#F5E6C8", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
              {dailyCompleted ? "Review anyway" : "Start"} <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <Link href={`/learn/${dialect.id}`} style={{ textDecoration: "none" }}>
            <div className="card card-hover" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <BookOpen size={20} color={dialect.color} />
                <div style={{ fontWeight: 700, color: "var(--color-text)" }}>Continue {dialect.name}</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Pick up your flashcards and lesson modes where you left off.</p>
            </div>
          </Link>
          <Link href={`/learn/${dialect.id}?mode=review`} style={{ textDecoration: "none" }}>
            <div className="card card-hover" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>Review weak cards</div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Cycle through cards you haven't marked "known" yet in {dialect.name}.</p>
            </div>
          </Link>
          <Link href="/learn" style={{ textDecoration: "none" }}>
            <div className="card card-hover" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>Browse all dialects</div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{reviewDue} categories in progress · explore Cantonese, Teochew, Hakka and Hainanese too.</p>
            </div>
          </Link>
        </div>

        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <CommunityStrip />
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="orbital-wrapper" style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1810 50%, #3D1F10 100%)" }}>
            {/* Background radial overlays */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(192,57,43,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,134,11,0.1) 0%, transparent 50%)", pointerEvents: "none" }} />

            {/* Desktop: orbital stage */}
            <div className="orbital-stage">
              <div className="orbital-ring" />
              <div className="orbital-center" style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ marginBottom: 12, width: "100%", maxWidth: 200 }}>
                  <Image src="/logo/seal_and_name_transparent.png" alt="tiagong.sg" width={200} height={164} priority style={{ width: "100%", height: "auto" }} />
                </div>
                <p style={{ color: "#E8D4A8", lineHeight: 1.6, marginBottom: 12, fontSize: 15, maxWidth: 320 }}>
                  Singapore's Chinese dialects — Hokkien, Cantonese, Teochew, Hakka, Hainanese — are living bridges to our ancestors.
                </p>
                <p style={{ color: "#E8D4A8", fontSize: 14, fontStyle: "italic", lineHeight: 1.6, maxWidth: 320 }}>
                  每一句方言，都是一条连接过去的线。<br />Every dialect phrase is a thread connecting us to our past.
                </p>
                <Link href="/welcome" className="btn-primary" style={{ marginTop: 16, textDecoration: "none", fontSize: 14, padding: "10px 24px", pointerEvents: "auto", position: "relative", zIndex: 4 }}>
                  New here? 2-minute intro
                </Link>
              </div>
              {dialects.map((d, i) => {
                const angle = (-90 + i * 72) * (Math.PI / 180);
                const R = 285;
                const x = Math.round(R * Math.cos(angle));
                const y = Math.round(R * Math.sin(angle));
                const tooltipBelow = y < -150;
                const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
                return (
                  <div
                    key={d.id}
                    className="orbital-card"
                    onClick={() => router.push(`/learn/${d.id}`)}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      animationDelay: `${0.1 + i * 0.1}s`,
                      "--dialect-glow": `${d.color}99`,
                    }}
                  >
                    <div className={`orbital-tooltip ${tooltipBelow ? "orbital-tooltip-below" : "orbital-tooltip-above"}`}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: d.color, marginBottom: 6 }}>{d.name}</div>
                      <div style={{ fontSize: 14, color: "#E8D4A8", lineHeight: 1.5 }}>{d.description}</div>
                      <div style={{ fontSize: 13, color: "#E8D4A8", marginTop: 8 }}>📍 {d.origin}</div>
                      <div style={{ fontSize: 13, color: "#E8D4A8", marginTop: 2 }}>👥 {d.speakers}</div>
                    </div>
                    <div style={{ fontSize: 34 }}>{d.icon}</div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#F5E6C8", lineHeight: 1.2 }}>{d.name}</div>
                    <div style={{ fontSize: 18, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
                    {dialectProgress > 0 && (
                      <div style={{ width: 36, height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 1, marginTop: 3 }}>
                        <div style={{ width: `${(dialectProgress / 3) * 100}%`, height: "100%", background: d.color, borderRadius: 1 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: stacked layout */}
            <div className="orbital-mobile">
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ marginBottom: 12 }}>
                  <Image src="/logo/seal_and_name_transparent.png" alt="tiagong.sg" width={140} height={114} priority style={{ width: "100%", height: "auto", maxWidth: 140, margin: "0 auto" }} />
                </div>
                <p className="hero-subtext" style={{ color: "#A08060", lineHeight: 1.6, marginBottom: 8, fontSize: 14 }}>
                  Singapore's Chinese dialects — Hokkien, Cantonese, Teochew, Hakka, Hainanese — are living bridges to our ancestors.
                </p>
                <p style={{ color: "#7A6040", fontSize: 13, fontStyle: "italic", marginBottom: 20 }}>
                  每一句方言，都是一条连接过去的线。 · Every dialect phrase is a thread connecting us to our past.
                </p>
                <Link href="/welcome" className="btn-primary" style={{ display: "inline-block", marginBottom: 12, textDecoration: "none", fontSize: 14, padding: "10px 24px" }}>
                  New here? 2-minute intro
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dialects.map((d, i) => {
                  const dialectProgress = Object.keys(progress).filter(k => k.startsWith(d.id)).length;
                  return (
                    <div key={d.id} className="orbital-mobile-card" onClick={() => router.push(`/learn/${d.id}`)}
                      style={{ border: `1px solid ${d.color}44`, animationDelay: `${i * 0.08}s` }}>
                      <div style={{ fontSize: 32 }}>{d.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#F5E6C8" }}>{d.name}</div>
                        <div style={{ fontSize: 16, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
                        <p style={{ fontSize: 13, color: "#8B7355", marginTop: 4, lineHeight: 1.5 }}>{d.description}</p>
                      </div>
                      <div style={{ color: d.color, fontSize: 22, fontWeight: 300 }}>›</div>
                    </div>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px 40px" }}>
        <CommunityStrip />
      </div>
    </>
  );
}

export default function DialectPlatform() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FEF8F3', fontSize: 14, color: '#8B7355' }}>Loading...</div>}>
      <DialectPlatformContent />
    </Suspense>
  );
}
