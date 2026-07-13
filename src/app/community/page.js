'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dialects } from "@/data/staticData";
import { relativeTime } from "@/lib/time";
import { Trophy, Sparkles, Mic, UserPlus, PenLine, Crown } from "lucide-react";

const KIND_ICONS = {
  contribution: PenLine,
  pronunciation: Mic,
  new_member: UserPlus,
};

function AvatarDot({ gender, role, size = 32 }) {
  const emoji = gender === 'male' && role === 'mentor' ? '👨‍🏫'
    : gender === 'female' && role === 'mentor' ? '👩‍🏫'
    : gender === 'female' ? '👩‍🎓' : '👨‍🎓';
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: '#F5EFE6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, flexShrink: 0 }}>
      {emoji}
    </span>
  );
}

function LeaderboardRow({ entry, highlight }) {
  return (
    <Link href={`/member/${entry.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
        background: highlight ? 'var(--color-surface-warm)' : 'transparent',
      }}>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 13, color: entry.rank <= 3 ? '#D4860B' : 'var(--color-text-muted)' }}>
          {entry.rank}
        </div>
        <AvatarDot gender={entry.gender} role={entry.role} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.name}{entry.verified && <span style={{ color: '#D4860B', marginLeft: 4 }}>✓</span>}
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{entry.score}</div>
      </div>
    </Link>
  );
}

export default function CommunityPage() {
  const { currentUser, apiWords, overlay } = useApp();
  const [board, setBoard] = useState('learners');
  const [dialectFilter, setDialectFilter] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbError, setLbError] = useState(false);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    setLbLoading(true);
    setLbError(false);
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({ board });
    if (dialectFilter) params.set('dialect', dialectFilter);
    fetch(`/api/community/leaderboard?${params}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setLeaderboard(data))
      .catch(() => setLbError(true))
      .finally(() => setLbLoading(false));
  }, [board, dialectFilter]);

  useEffect(() => {
    fetch('/api/community/activity')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setActivity(Array.isArray(data) ? data : []))
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false));
  }, []);

  const coverage = dialects.map(d => {
    const words = apiWords.filter(w => w.dialect === d.id);
    const withAudio = words.filter(w => (overlay?.variants?.[w.id] || []).some(v => v.variant_type === 'pronunciation'));
    return { ...d, total: words.length, withAudio: withAudio.length, pct: words.length > 0 ? Math.round((withAudio.length / words.length) * 100) : 0 };
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px' }} className="fade-up">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C0392B', textTransform: 'uppercase', marginBottom: 8 }}>Community</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 7vw, 42px)', color: 'var(--color-text)', marginBottom: 10 }}>What's happening at tiagong.sg</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 560, margin: '0 auto' }}>
          See who's learning, who's building the archive, and how much of each dialect has real pronunciation recordings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Leaderboard */}
        <div className="card" style={{ padding: 24 }}>
          <div className="pill-toggle" style={{ marginBottom: 16 }}>
            <button onClick={() => setBoard('learners')} className={board === 'learners' ? 'active' : ''}>Learners</button>
            <button onClick={() => setBoard('builders')} className={board === 'builders' ? 'active' : ''}>Builders</button>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            <button onClick={() => setDialectFilter(null)} className="tab-btn"
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, border: `2px solid ${!dialectFilter ? 'var(--color-primary)' : 'var(--color-border)'}`, background: !dialectFilter ? 'var(--color-primary)' : 'var(--color-surface)', color: !dialectFilter ? 'white' : 'var(--color-text)' }}>
              All
            </button>
            {dialects.map(d => (
              <button key={d.id} onClick={() => setDialectFilter(d.name)} className="tab-btn"
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, border: `2px solid ${dialectFilter === d.name ? d.color : 'var(--color-border)'}`, background: dialectFilter === d.name ? d.color : 'var(--color-surface)', color: dialectFilter === d.name ? 'white' : 'var(--color-text)' }}>
                {d.icon} {d.name}
              </button>
            ))}
          </div>

          {lbLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 44, borderRadius: 10, background: '#F0E8DA' }} />)}
            </div>
          ) : lbError ? (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--color-text-muted)', fontSize: 13 }}>
              Couldn't load the leaderboard right now — check back soon.
            </div>
          ) : (
            <>
              {leaderboard?.champions?.length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #FEF3E2, #FEF9E7)', border: '1px solid #D4860B30', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#8B6020', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Crown size={13} /> Last week's champions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {leaderboard.champions.map(c => (
                      <Link key={c.userId} href={`/member/${c.userId}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#1A1208', fontSize: 13, fontWeight: 600 }}>
                        <AvatarDot gender={c.gender} role={c.role} size={22} /> {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(!leaderboard?.top || leaderboard.top.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                  Nobody's scored yet this week{dialectFilter ? ` in ${dialectFilter}` : ''} — be the first!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {leaderboard.top.map(entry => (
                    <LeaderboardRow key={entry.userId} entry={entry} highlight={currentUser?.id === entry.userId} />
                  ))}
                </div>
              )}

              {leaderboard?.me && !leaderboard.top.some(e => e.userId === leaderboard.me.userId) && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                  <LeaderboardRow entry={leaderboard.me} highlight />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar: activity + coverage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={15} color="#C0392B" /> Just happened
            </div>
            {activityLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[0, 1, 2].map(i => <div key={i} className="shimmer" style={{ height: 32, borderRadius: 8, background: '#F0E8DA' }} />)}
              </div>
            ) : activity.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No activity yet — contribute a word or a recording to get things started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activity.slice(0, 12).map((item, i) => {
                  const Icon = KIND_ICONS[item.kind] || Sparkles;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <Icon size={14} style={{ marginTop: 2, flexShrink: 0, color: '#8B7355' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/member/${item.userId}`} style={{ fontWeight: 600, color: 'var(--color-text)', textDecoration: 'none' }}>{item.name}</Link>
                        <span style={{ color: 'var(--color-text-muted)' }}> {item.label}</span>
                        <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 1 }}>{relativeTime(item.at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mic size={15} color="#1A6B3C" /> Real audio coverage
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {coverage.map(d => (
                <Link key={d.id} href="/dictionary" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{d.icon} {d.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{d.pct}% · {d.withAudio}/{d.total}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 3 }} />
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginTop: 12, textAlign: 'center' }}>
              Help record — tap a word in the dictionary and hit "Record pronunciation"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
