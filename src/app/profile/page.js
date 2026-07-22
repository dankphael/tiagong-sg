'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mars, Venus } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { getAvatar } from "@/lib/avatar";
import { getLevel, getNextLevel, getLevelProgress } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";
import { SealChip } from "@/components/ui";
import MatchPreferencesFields from "@/components/MatchPreferencesFields";

export default function ProfilePage() {
  const router = useRouter();
  const {
    currentUser, xp, streak, authError, setAuthError, successMessage,
    pendingGoogle, saveProfile: ctxSaveProfile, handleLogout,
    setSelectedDialect,
  } = useApp();

  const [profileForm, setProfileForm] = useState({
    firstName: "", lastName: "", username: "", age: "", occupation: "", email: "", languageInterest: "Hokkien", role: "mentee", gender: "", dialectsKnown: [],
    intent: "", offerings: [], availability: [], formats: [], region: "", interests: [], proficiency: "", bio: "", huayKuan: "",
    heritageStory: "", leaderboardOptOut: false,
  });
  const [profileEditMode, setProfileEditMode] = useState(false);

  function saveProfile() { return ctxSaveProfile(profileForm).then(ok => { if (ok) setProfileEditMode(false); }); }

  function continueLearning(dialectId) {
    if (!dialectId) return;
    setSelectedDialect(dialectId);
    router.push(`/learn/${dialectId}`);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      {currentUser ? (
        <div className="fade-up">
          {profileEditMode ? (
            <div className="card" style={{ padding: 32 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "#1A1208", marginBottom: 20 }}>Edit Profile</div>

              <div className="form-grid-2" style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                {[["First Name", "text", profileForm.firstName, v => setProfileForm(f => ({ ...f, firstName: v }))],
                  ["Last Name", "text", profileForm.lastName, v => setProfileForm(f => ({ ...f, lastName: v }))]].map(([label, type, val, setter]) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                    <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Username</label>
                <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, fontSize: 14, color: "#9B8B75", pointerEvents: "none", zIndex: 1 }}>@</span>
                  <input className="input" type="text" value={profileForm.username} onChange={e => setProfileForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30) }))} placeholder="pick a username"
                    style={{ paddingLeft: 28 }} />
                </div>
                <div style={{ fontSize: 11, color: "#B8A898", marginTop: 4 }}>Lowercase letters, numbers and underscores. 3–30 characters.</div>
              </div>

              {[["Age", "number", profileForm.age, v => setProfileForm(f => ({ ...f, age: v }))],
                ["Occupation", "text", profileForm.occupation, v => setProfileForm(f => ({ ...f, occupation: v }))]].map(([label, type, val, setter]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>{label}</label>
                  <input className="input" type={type} value={val} onChange={e => setter(e.target.value)} placeholder={label} />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 6 }}>Dialect Interest (Optional)</label>
                <select value={profileForm.languageInterest} onChange={e => setProfileForm(f => ({ ...f, languageInterest: e.target.value }))} className="input"
                  style={{ height: 44 }}>
                  <option value="">—  Not interested in learning</option>
                  {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Dialects I already know</label>
                <div className="pill-toggle" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(d => {
                    const checked = (profileForm.dialectsKnown || []).includes(d);
                    return (
                      <button key={d} type="button"
                        onClick={() => setProfileForm(f => ({
                          ...f,
                          dialectsKnown: checked
                            ? f.dialectsKnown.filter(x => x !== d)
                            : [...(f.dialectsKnown || []), d],
                        }))}
                        className={checked ? "active" : ""}
                        style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid " + (checked ? "#C0392B" : "#E8DDD0"), background: checked ? "#FDF0EF" : "white", color: checked ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                        {checked ? "✓ " : ""}{d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>My gender</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["male", Mars, "Male"], ["female", Venus, "Female"]].map(([val, Icon, label]) => (
                    <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, gender: val }))}
                      style={{ flex: 1, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.gender === val ? "#C0392B" : "#E8DDD0"), background: profileForm.gender === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 24, marginBottom: 4, display: "flex", justifyContent: "center" }}><Icon size={22} /></div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: profileForm.gender === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>I am a</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {[["mentee", "Mentee", "Learn dialects"], ["mentor", "Mentor", "Teach as a Sin Seh"], ["both", "Both", "Learn & teach"], ["none", "Observer", "Just exploring"]].map(([val, label, sub]) => {
                    const emoji = val === "both" || val === "none" ? "👤" : getAvatar(profileForm.gender, val);
                    return (
                      <button key={val} type="button" onClick={() => setProfileForm(f => ({ ...f, role: val }))}
                        style={{ flex: 1, minWidth: 120, padding: "14px 12px", borderRadius: 12, border: "2px solid " + (profileForm.role === val ? "#C0392B" : "#E8DDD0"), background: profileForm.role === val ? "#FDF0EF" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.2s" }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: profileForm.role === val ? "#C0392B" : "#1A1208" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 2 }}>{sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Matchmaking Preferences</div>
                <MatchPreferencesFields form={profileForm} setForm={setProfileForm} />
              </div>

              <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Community Profile</div>
                <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>My Dialect Journey</label>
                <textarea value={profileForm.heritageStory || ""} onChange={e => setProfileForm(f => ({ ...f, heritageStory: e.target.value.slice(0, 1000) }))}
                  placeholder="Which dialect did your family speak? Why are you learning it? Share your story — it'll show on your public community profile."
                  className="input" style={{ minHeight: 100, resize: "vertical", marginBottom: 4 }} />
                <div style={{ fontSize: 11, color: "#9B8B75", textAlign: "right", marginBottom: 16 }}>{(profileForm.heritageStory || "").length}/1000</div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B5B45", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!profileForm.leaderboardOptOut}
                    onChange={e => setProfileForm(f => ({ ...f, leaderboardOptOut: e.target.checked }))} />
                  Hide me from public leaderboards
                </label>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={saveProfile} style={{ flex: 1 }}>
                  Save Changes
                </button>
                <button className="btn-secondary" onClick={() => { setProfileEditMode(false); setAuthError(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {(() => {
                const level = getLevel(xp);
                const nextLevel = getNextLevel(xp);
                const progress = getLevelProgress(xp);
                const dialectObj = currentUser.languageInterest ? dialects.find(d => d.name === currentUser.languageInterest) : null;
                const ringColor = dialectObj?.color || "#C0392B";

                return (
                  <>
                    {/* Identity Header */}
                    <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", background: ringColor + "20", border: "3px solid " + ringColor }}></div>
                          <div style={{ fontSize: 56, zIndex: 1 }}>{currentUser.avatar}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "#1A1208", marginBottom: 2 }}>{currentUser.firstName} {currentUser.lastName}</div>
                          {currentUser.username && <div style={{ fontSize: 12, color: "#B8A898", marginBottom: 2 }}>@{currentUser.username}</div>}
                          <div style={{ fontSize: 14, color: "#8B7355", marginBottom: 12 }}>{currentUser.occupation}{currentUser.age ? ` · Age ${currentUser.age}` : ""}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                            {level && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: level.color + "20", color: level.color, fontWeight: 700, fontSize: 12 }}>
                                <span>{level.icon}</span>{level.name}
                              </div>
                            )}
                            <div style={{ fontSize: 11, background: currentUser.role === "mentor" ? "#FEF3E2" : currentUser.role === "both" ? "#E8D5F2" : currentUser.role === "none" ? "#F0E8DA" : "#EEF2FF", color: currentUser.role === "mentor" ? "#D4860B" : currentUser.role === "both" ? "#6B21A8" : currentUser.role === "none" ? "#6B5B45" : "#5B21B6", padding: "4px 10px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>{currentUser.role}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-secondary" onClick={() => {
                          setProfileForm({
                            firstName: currentUser.firstName || '',
                            lastName: currentUser.lastName || '',
                            username: currentUser.username || '',
                            age: currentUser.age || '',
                            occupation: currentUser.occupation || '',
                            email: currentUser.email || '',
                            languageInterest: currentUser.languageInterest || '',
                            gender: currentUser.gender || '',
                            role: currentUser.role || 'mentee',
                            dialectsKnown: currentUser.dialectsKnown || [],
                            intent: currentUser.intent || "",
                            offerings: currentUser.offerings || [],
                            availability: currentUser.availability || [],
                            formats: currentUser.formats || [],
                            region: currentUser.region || "",
                            interests: currentUser.interests || [],
                            proficiency: currentUser.proficiency || "",
                            bio: currentUser.bio || "",
                            huayKuan: currentUser.huayKuan || "",
                            heritageStory: currentUser.heritageStory || "",
                            leaderboardOptOut: !!currentUser.leaderboardOptOut,
                          });
                          setProfileEditMode(true);
                        }} style={{ flex: 1 }}>
                          Edit Profile
                        </button>
                        <button className="btn-ghost" onClick={handleLogout} style={{ flex: 1 }}>
                          Sign Out
                        </button>
                      </div>
                      {currentUser.id && (
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                          <Link href={`/member/${currentUser.id}`} style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                            View your public community profile →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Learning Journey */}
                    {currentUser.languageInterest && (
                      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                        <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>Learning Journey</div>
                        {nextLevel ? (
                          <>
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>
                                Progress to {nextLevel.name}
                              </div>
                              <div className="progress" style={{ height: 8 }}>
                                <div className="progress-fill" style={{ width: progress + "%", background: level?.color || "#C0392B" }}></div>
                              </div>
                              <div style={{ fontSize: 12, color: "#9B8B75", marginTop: 6 }}>
                                {xp} XP · {nextLevel.minXP - xp} XP to {nextLevel.name}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 600 }}>Max level reached!</div>
                        )}
                        <div className="form-grid-3" style={{ display: "grid", gap: 12, marginTop: 16 }}>
                          <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Streak</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#C0392B" }}>
                              🔥 {streak}
                            </div>
                          </div>
                          <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Total XP</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1208" }}>{xp}</div>
                          </div>
                          <div style={{ background: "#FAF6F0", borderRadius: 10, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#6B5B45", marginBottom: 4 }}>Dialects</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1208" }}>{(currentUser.dialectsKnown || []).length}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* My Dialects */}
                    <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                      <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }}>My Dialects</div>

                      {currentUser.languageInterest && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 12, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Currently Learning</div>
                          {dialectObj && <SealChip dialect={dialectObj} size="md" />}
                          <button className="btn-primary" onClick={() => continueLearning(dialectObj?.id)} style={{ marginTop: 12, width: "100%", fontSize: 13 }}>
                            Continue Learning
                          </button>
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: 12, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>Heritage — Dialects I Know</div>
                        {(currentUser.dialectsKnown || []).length > 0 ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {currentUser.dialectsKnown.map(d => {
                              const dObj = dialects.find(x => x.name === d);
                              return dObj ? <SealChip key={d} dialect={dObj} size="md" /> : null;
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: "#9B8B75", fontStyle: "italic" }}>
                            Add dialects you know in your profile to celebrate your heritage.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Community Role */}
                    <div className="card" style={{ padding: 24 }}>
                      <div style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Community Role</div>
                      <div style={{ fontSize: 14, color: "#1A1208", marginBottom: 8 }}>
                        {currentUser.role === "mentor" && "You are a Sin Seh (先生) — an experienced mentor. Learners can find you in the Network directory."}
                        {currentUser.role === "mentee" && "You are a learner. Browse Sin Sehs in the Network to find a mentor for your dialect journey."}
                        {currentUser.role === "both" && "You are both a mentor and learner. Help others while continuing your own dialect journey."}
                        {currentUser.role === "none" && "You're exploring the community. You can update your role anytime to connect with mentors or mentees."}
                      </div>
                      <button className="btn-primary" onClick={() => router.push("/network")} style={{ marginTop: 12, width: "100%" }}>
                        Go to Network
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 36, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 12 }}>
            {pendingGoogle ? "Almost there" : "Welcome to tiagongSG"}
          </div>
          <p style={{ color: "#8B7355", fontSize: 14, marginBottom: 32 }}>
            {pendingGoogle
              ? "Just a few essentials left to finish setting up your account."
              : "A language lost is a worldview lost. Sign in to start your dialect learning journey and connect with native speakers across Singapore."}
          </p>
          <Link href="/signin?next=/profile" className="btn-primary" style={{ textDecoration: "none", display: "inline-block", padding: "12px 28px" }}>
            {pendingGoogle ? "Finish setting up" : "Sign In"}
          </Link>
        </div>
      )}

      {authError && (
        <div style={{ marginTop: 16, padding: 12, background: "#FDF0EF", border: "1px solid #C0392B", borderRadius: 10, color: "#C0392B", fontSize: 13 }}>
          {authError}
        </div>
      )}
      {successMessage && (
        <div style={{ marginTop: 16, padding: 12, background: "#EAFAF1", border: "1px solid #1A6B3C", borderRadius: 10, color: "#1A6B3C", fontSize: 13 }}>
          {successMessage}
        </div>
      )}
    </div>
  );
}
