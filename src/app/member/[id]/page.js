'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { getAvatar } from "@/lib/avatar";
import { getLevel } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";
import { computeBadges } from "@/lib/badges";
import { Flame, PenLine, Calendar } from "lucide-react";

const CONTRIB_LABELS = {
  new_word: 'words added',
  usage_example: 'examples added',
  pronunciation_audio: 'recordings made',
  correction: 'corrections',
};

export default function MemberPage() {
  const params = useParams();
  const { currentUser } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/users/${params.id}/public`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.ok ? r.json() : Promise.reject();
      })
      .then(data => { if (data) setProfile(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <div className="shimmer" style={{ height: 160, borderRadius: 20, background: '#F0E8DA', marginBottom: 20 }} />
        <div className="shimmer" style={{ height: 80, borderRadius: 14, background: '#F0E8DA' }} />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🫥</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--color-text)', marginBottom: 8 }}>Member not found</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>This profile doesn't exist or is no longer available.</p>
      </div>
    );
  }

  const isOwn = currentUser?.id === profile.id;
  const level = getLevel(profile.xp);
  const badges = computeBadges(profile.contributions, { xp: profile.xp, streak: profile.streak });
  const memberDialects = (profile.custodianDialects || []).map(id => dialects.find(d => d.id === id)).filter(Boolean);
  const contribEntries = Object.entries(profile.contributions || {}).filter(([, n]) => n > 0);
  const totalContributions = contribEntries.reduce((sum, [, n]) => sum + n, 0);
  const memberSince = profile.memberSince ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }} className="fade-up">
      <div className="card" style={{ padding: 32, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>{getAvatar(profile.gender, profile.role)}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          {profile.firstName} {profile.lastName}
          {profile.verified && <span style={{ color: '#D4860B', fontSize: 18 }} title="Verified">✓</span>}
        </div>
        {profile.languageInterest && (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>Learning {profile.languageInterest}</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 }}>
          {memberDialects.map(d => (
            <span key={d.id} className="chip" style={{ background: `${d.color}15`, color: d.color, border: `1px solid ${d.color}40` }}>
              {d.icon} {d.name} custodian
            </span>
          ))}
        </div>
        {memberSince && (
          <div style={{ fontSize: 12, color: 'var(--color-text-faint)', marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} /> Member since {memberSince}
          </div>
        )}
        {isOwn && (
          <div style={{ marginTop: 12 }}>
            <Link href="/profile" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Edit your story →</Link>
          </div>
        )}
      </div>

      {profile.heritageStory && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>About Me</div>
          <p style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{profile.heritageStory}</p>
        </div>
      )}

      {profile.bio && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{profile.bio}</p>
        </div>
      )}

      {badges.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Badges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {badges.map(b => (
              <div key={b.id} title={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 76 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{b.icon}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Learning</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{level.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{level.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{profile.xp} XP</div>
            </div>
          </div>
          {profile.streak > 0 && (
            <div style={{ fontSize: 13, color: '#D4860B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flame size={14} /> {profile.streak} day streak
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Contributing</div>
          {totalContributions === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>No accepted contributions yet.</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <PenLine size={16} color="#C0392B" />
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{totalContributions} accepted</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {contribEntries.map(([type, n]) => (
                  <div key={type} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{n} {CONTRIB_LABELS[type] || type}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
