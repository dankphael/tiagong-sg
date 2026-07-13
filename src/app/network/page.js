'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, UserCheck, ArrowRight, Handshake, Sprout, BadgeCheck, MessageCircle } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { rankSinSehs, INTENTS } from "@/lib/matching";
import { huayKuan } from "@/data/staticData";
import ChatPanel from "@/components/ChatPanel";
import Avatar from "@/components/Avatar";

const HUAY_KUAN_BY_ID = Object.fromEntries(huayKuan.map(h => [h.id, h]));

export default function NetworkPage() {
  const router = useRouter();
  const { currentUser, registeredUsers, profilesLoading, showToast } = useApp();

  const [networkView, setNetworkView] = useState("directory");
  const [sinSehDialectFilter, setSinSehDialectFilter] = useState("All");
  const [sinSehIntentFilter, setSinSehIntentFilter] = useState("All");
  const [networkFilter, setNetworkFilter] = useState("All");
  const [requestModal, setRequestModal] = useState(null); // { user } when composing a mentorship request
  const [requestMessage, setRequestMessage] = useState("");
  const [connectError, setConnectError] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null); // { id, name } when confirming connection removal
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [openChatConnectionId, setOpenChatConnectionId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const unreadErrorShownRef = useRef(false);
  const connectionsErrorShownRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "chats") setNetworkView("chats");
    const c = params.get("c");
    if (c) setOpenChatConnectionId(Number(c));
  }, []);

  async function loadUnreadCounts() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch("/api/messages/unread", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!Array.isArray(data)) {
        if (!unreadErrorShownRef.current) { unreadErrorShownRef.current = true; showToast("Couldn't load unread messages", "error"); }
        return;
      }
      unreadErrorShownRef.current = false;
      setUnreadCounts(Object.fromEntries(data.map(r => [r.connection_id, r.unread_count])));
    } catch (e) {
      console.error("Failed to load unread counts:", e);
      if (!unreadErrorShownRef.current) { unreadErrorShownRef.current = true; showToast("Couldn't load unread messages", "error"); }
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    loadUnreadCounts();
    const interval = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      loadUnreadCounts(); loadConnections();
    }, 20000);

    function onVisible() {
      if (document.visibilityState === "visible") { loadUnreadCounts(); loadConnections(); }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [currentUser?.id]);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  async function loadConnections() {
    if (!currentUser) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const [a, b] = await Promise.all([
        fetch(`/api/connections?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`/api/connections/pending?userId=${currentUser.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      if (!Array.isArray(a) || !Array.isArray(b)) {
        if (!connectionsErrorShownRef.current) { connectionsErrorShownRef.current = true; showToast("Couldn't load your connections", "error"); }
      } else {
        connectionsErrorShownRef.current = false;
      }
      setConnections(Array.isArray(a) ? a : []);
      setPendingRequests(Array.isArray(b) ? b : []);
    } catch (e) {
      console.error('Failed to load connections:', e);
      if (!connectionsErrorShownRef.current) { connectionsErrorShownRef.current = true; showToast("Couldn't load your connections", "error"); }
    } finally {
      setConnectionsLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser) loadConnections();
  }, [currentUser?.id]);

  async function sendConnectRequest(targetUserId, message = '', targetName = '') {
    if (!currentUser || currentUser.id === targetUserId) return false;
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requesterId: currentUser.id, receiverId: targetUserId, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Request failed (${res.status})`;
        setConnectError(errMsg);
        showToast(errMsg, "error");
        return false;
      }
      await loadConnections();
      showToast(targetName ? `Request sent to ${targetName}` : "Request sent", "success");
      return true;
    } catch (e) {
      console.error('Failed to send connect request:', e);
      setConnectError('Network error — please try again');
      showToast('Network error — please try again', "error");
      return false;
    }
  }

  async function acceptConnectRequest(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Accept failed (${res.status})`;
        setConnectError(errMsg);
        showToast(errMsg, "error");
        return;
      }
      await loadConnections();
      showToast("You're now connected — chat is open", "success");
    } catch (e) {
      console.error('Failed to accept request:', e);
      setConnectError('Network error — please try again');
      showToast('Network error — please try again', "error");
    }
  }

  async function rejectConnectRequest(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Action failed (${res.status})`;
        setConnectError(errMsg);
        showToast(errMsg, "error");
        return;
      }
      await loadConnections();
      showToast("Request declined", "success");
    } catch (e) {
      console.error('Failed to reject request:', e);
      setConnectError('Network error — please try again');
      showToast('Network error — please try again', "error");
    }
  }

  async function removeConnection(connectionId) {
    const token = localStorage.getItem('auth_token');
    setConnectError(null);
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Remove failed (${res.status})`;
        setConnectError(errMsg);
        showToast(errMsg, "error");
        return;
      }
      setRemoveConfirm(null);
      await loadConnections();
      showToast("Connection removed", "success");
    } catch (e) {
      console.error('Failed to remove connection:', e);
      setConnectError('Network error — please try again');
      showToast('Network error — please try again', "error");
    }
  }

  function getAcceptedConnectionId(targetId) {
    const accepted = connections.find(c => c.connected_user_id === targetId && c.status === 'accepted');
    return accepted ? accepted.id : null;
  }

  function openChatWith(targetId) {
    const id = getAcceptedConnectionId(targetId);
    if (!id) return;
    setOpenChatConnectionId(id);
    setNetworkView("chats");
  }

  function getConnectionStatus(targetId) {
    const accepted = connections.find(c => c.connected_user_id === targetId && c.status === 'accepted');
    if (accepted) return 'accepted';
    const sent = connections.find(c => c.requester_id === currentUser?.id && c.connected_user_id === targetId && c.status === 'pending');
    if (sent) return 'sent';
    const received = pendingRequests.find(r => r.requester_id === targetId);
    if (received) return 'received';
    return 'none';
  }

  const dColors = { Hokkien: "#C0392B", Cantonese: "#8E44AD", Teochew: "#1A6B3C", Hakka: "#D4860B", Hainanese: "#1A7EA6" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Community</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px, 9vw, 48px)", color: "#1A1208", marginBottom: 12 }}>Network</h1>
        <p style={{ color: "#8B7355", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>Connect with fellow learners and Sin Sehs (mentors) across Singapore. Keep our dialects alive together.</p>
      </div>

      {/* Main view toggle */}
      <div className="pill-toggle" style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
        {[["directory", "Find a Sin Seh"], ["mentorships", "My Mentorships"], ["chats", "Chats"], ["everyone", "Everyone"]].map(([view, label]) => (
          <button key={view} onClick={() => setNetworkView(view)} className={networkView === view ? "active" : ""}
            style={{ padding: "11px 24px", borderRadius: 10, background: networkView === view ? "#C0392B" : "white", color: networkView === view ? "white" : "#6B5B45", fontSize: 14, border: "2px solid " + (networkView === view ? "#C0392B" : "#E8DDD0"), fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            {label}
            {view === "mentorships" && pendingRequests.length > 0 && (
              <span style={{ marginLeft: 8, background: networkView === view ? "rgba(255,255,255,0.3)" : "#C0392B", color: "white", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                {pendingRequests.length}
              </span>
            )}
            {view === "chats" && totalUnread > 0 && (
              <span style={{ marginLeft: 8, background: networkView === view ? "rgba(255,255,255,0.3)" : "#C0392B", color: "white", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                {totalUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request modal overlay — shared by directory & mentorships views */}
      {requestModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
              <Avatar url={requestModal.avatarUrl} emoji={requestModal.avatar} size={48} />
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208" }}>Request {requestModal.firstName}</div>
                <div style={{ fontSize: 13, color: "#9B8B75" }}>Sin Seh · {requestModal.languageInterest}</div>
              </div>
            </div>
            <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 8 }}>Introduction (optional)</label>
            <textarea
              value={requestMessage}
              onChange={e => setRequestMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell this Sin Seh a little about yourself and why you want to learn..."
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #E8DDD0", fontSize: 14, fontFamily: "inherit", background: "#FAF6F0", resize: "vertical", marginBottom: 20 }}
            />
            {connectError && (
              <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                {connectError}
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setRequestModal(null); setRequestMessage(""); setConnectError(null); }}
                style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                Cancel
              </button>
              <button onClick={async () => { const ok = await sendConnectRequest(requestModal.id, requestMessage, requestModal.firstName); if (ok) { setRequestModal(null); setRequestMessage(""); } }}
                style={{ flex: 1, padding: "13px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove-confirm modal overlay — shared */}
      {removeConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 36, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#1A1208", marginBottom: 12 }}>Remove Connection?</div>
            <p style={{ fontSize: 14, color: "#6B5B45", marginBottom: 24, lineHeight: 1.6 }}>
              This will disconnect you from <strong>{removeConfirm.name}</strong> and permanently delete your chat history with them. You can always send a new connection request later, but the conversation cannot be recovered.
            </p>
            {connectError && (
              <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, border: "1px solid #C0392B40" }}>
                {connectError}
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setRemoveConfirm(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#F5F0EA", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                Cancel
              </button>
              <button onClick={() => removeConnection(removeConfirm.id)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {networkView === "directory" && (
        <div>
          {/* Hero banner */}
          <div style={{ background: "linear-gradient(135deg, #2C1508, #4A1F10)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-primary)" }}><GraduationCap size={48} /></div>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 700, color: "#F5E6C8" }}>Sin Seh <span style={{ fontStyle: "italic", color: "#C0392B" }}>先生</span></div>
              <div style={{ fontSize: 14, color: "#A08060", marginTop: 4, marginBottom: 8 }}>Mentorship Programme · Completely Free</div>
              <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>Connect with native speakers who give their time freely. Find a mentor for your dialect journey below.</p>
            </div>
          </div>

          {/* Role-aware CTA */}
          {!currentUser ? (
            <div style={{ background: "#FAF6F0", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px dashed #D4C9B8" }}>
              <div style={{ fontSize: 14, color: "#8B7355" }}>Register your profile to access mentorship features.</div>
              <button onClick={() => router.push("/profile")} className="btn-hover"
                style={{ padding: "10px 20px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Register Profile
              </button>
            </div>
          ) : (currentUser.role === "mentor" || currentUser.role === "both") ? (
            <div style={{ background: "#FEF3E2", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #D4860B40" }}>
              <span style={{ display: "inline-flex", color: "var(--color-primary)" }}><UserCheck size={20} /></span>
              <div style={{ fontSize: 14, color: "#8B6020" }}>You are a <strong>Sin Seh</strong>. Mentees can find you here. Check <em>My Mentorships</em> to respond to requests.</div>
            </div>
          ) : (
            <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #5B21B640" }}>
              <span style={{ fontSize: 20 }}><GraduationCap size={20} /></span>
              <div style={{ fontSize: 14, color: "#3B1D8A" }}>Browse Sin Sehs below and send a mentorship request. Once accepted, a chat opens here so you can get to know each other.</div>
            </div>
          )}

          {/* Dialect filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["All", "Hokkien", "Cantonese", "Teochew", "Hakka", "Hainanese"].map(f => (
              <button key={f} onClick={() => setSinSehDialectFilter(f)} className={sinSehDialectFilter === f ? "active" : ""}
                style={{ padding: "7px 16px", borderRadius: 20, background: sinSehDialectFilter === f ? "#C0392B" : "white", color: sinSehDialectFilter === f ? "white" : "#6B5B45", fontSize: 13, border: "1px solid " + (sinSehDialectFilter === f ? "#C0392B" : "#E8DDD0"), fontWeight: sinSehDialectFilter === f ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Intent filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {[["All", "Any intent"], ...INTENTS.map(i => [i.id, i.label])].map(([id, label]) => (
              <button key={id} onClick={() => setSinSehIntentFilter(id)} className={sinSehIntentFilter === id ? "active" : ""}
                style={{ padding: "6px 14px", borderRadius: 20, background: sinSehIntentFilter === id ? "#1A1208" : "#FAF6F0", color: sinSehIntentFilter === id ? "#F5E6C8" : "#8B7355", fontSize: 12, border: "1px solid " + (sinSehIntentFilter === id ? "#1A1208" : "#E8DDD0"), fontWeight: sinSehIntentFilter === id ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>

          {connectError && (
            <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40", marginBottom: 20 }}>
              {connectError}
            </div>
          )}

          {(() => {
            const sinSehs = registeredUsers.filter(u => (u.role === "mentor" || u.role === "both") && u.id !== currentUser?.id);
            let filtered = sinSehDialectFilter === "All" ? sinSehs : sinSehs.filter(u => u.languageInterest === sinSehDialectFilter);
            if (sinSehIntentFilter !== "All") {
              filtered = filtered.filter(u => !Array.isArray(u.offerings) || u.offerings.length === 0 || u.offerings.includes(sinSehIntentFilter));
            }

            const sorted = rankSinSehs(currentUser, filtered);

            return profilesLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="card shimmer" style={{ padding: 28, height: 180, background: "#F0E8DA" }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-primary)" }}><UserCheck size={40} /></div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No Sin Sehs yet</div>
                <p style={{ fontSize: 14 }}>{sinSehDialectFilter !== "All" ? `No mentors available for ${sinSehDialectFilter} yet.` : "Be the first — set your role to Mentor in your Profile."}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
                {sorted.map(m => {
                  const dialectColor = dColors[m.languageInterest] || "#8B7355";
                  const status = currentUser ? getConnectionStatus(m.id) : 'none';
                  const isDialectMatch = currentUser?.languageInterest === m.languageInterest;
                  const isGreatMatch = currentUser && m._matchScore >= 50;
                  const hk = m.huayKuan ? HUAY_KUAN_BY_ID[m.huayKuan] : null;
                  return (
                    <div key={m.id} className="card" style={{ padding: 28, position: "relative" }}>
                      {isGreatMatch ? (
                        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, background: "#C0392B", color: "white", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          ⭐ Great match
                        </div>
                      ) : isDialectMatch && currentUser && (
                        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, background: "#1A6B3C", color: "white", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                          Matches your dialect ✓
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                        <Avatar url={m.avatarUrl} emoji={m.avatar} size={60} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#1A1208", display: "flex", alignItems: "center", gap: 6 }}>
                            <Link href={`/member/${m.id}`} style={{ color: "inherit", textDecoration: "none" }} onClick={e => e.stopPropagation()}>
                              {m.firstName} {m.lastName}
                            </Link>
                            {m.verified && <span title="Verified Sin Seh" style={{ display: "inline-flex", color: "#D4860B" }}><BadgeCheck size={16} /></span>}
                          </div>
                          <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, background: dialectColor + "18", color: dialectColor, padding: "4px 12px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest}</span>
                        <span style={{ fontSize: 11, background: "#FEF3E2", color: "#D4860B", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Sin Seh</span>
                        {m.menteeCount > 0 && (
                          <span style={{ fontSize: 11, background: "#F5F0EA", color: "#6B5B45", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{m.menteeCount} mentee{m.menteeCount > 1 ? "s" : ""}</span>
                        )}
                        {hk && (
                          <span style={{ fontSize: 11, background: "#F5F0EA", color: "#6B5B45", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{hk.shortName || hk.name}</span>
                        )}
                      </div>
                      {m.bio && (
                        <p style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {m.bio}
                        </p>
                      )}
                      {currentUser && m._matchReasons?.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                          {m._matchReasons.map((r, i) => (
                            <span key={i} style={{ fontSize: 11, background: "#EAFAF1", color: "#1A6B3C", padding: "3px 9px", borderRadius: 8, fontWeight: 500 }}>{r}</span>
                          ))}
                        </div>
                      )}
                      {status === 'accepted' ? (
                        <button className="btn-hover" onClick={() => openChatWith(m.id)}
                          style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          <MessageCircle size={15} /> Open Chat
                        </button>
                      ) : status === 'sent' ? (
                        <div style={{ padding: "12px", borderRadius: 10, background: "#FEF3E2", color: "#D4860B", fontSize: 13, fontWeight: 600, textAlign: "center", border: "1px solid #D4860B40" }}>
                          Request Sent ✓
                        </div>
                      ) : status === 'received' ? (
                        <button className="btn-hover" onClick={() => setNetworkView("mentorships")}
                          style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#5B21B6", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Respond to their request <ArrowRight size={15} />
                        </button>
                      ) : !currentUser ? (
                        <button className="btn-hover" onClick={() => router.push("/profile")}
                          style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#F5F0EA", color: "#8B7355", border: "1px dashed #D4C9B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Register to Connect
                        </button>
                      ) : (
                        <button className="btn-hover" onClick={() => { setRequestModal(m); setRequestMessage(""); }}
                          style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Request Mentorship
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {networkView === "mentorships" && (
        <div>
          {/* Hero banner */}
          <div style={{ background: "linear-gradient(135deg, #2C1508, #4A1F10)", borderRadius: 20, padding: "36px 32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-primary)" }}><GraduationCap size={48} /></div>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 700, color: "#F5E6C8" }}>Sin Seh <span style={{ fontStyle: "italic", color: "#C0392B" }}>先生</span></div>
              <div style={{ fontSize: 14, color: "#A08060", marginTop: 4, marginBottom: 8 }}>Mentorship Programme · Completely Free</div>
              <p style={{ color: "#8B7355", fontSize: 14, lineHeight: 1.7, maxWidth: 560 }}>Connect with native speakers who give their time freely. Set your role in your Profile, then find a Sin Seh or manage your mentees here.</p>
            </div>
          </div>

          {/* Role-aware CTA banner */}
          {!currentUser ? (
            <div style={{ background: "#FAF6F0", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px dashed #D4C9B8" }}>
              <div style={{ fontSize: 14, color: "#8B7355" }}>Register your profile to access mentorship features.</div>
              <button onClick={() => router.push("/profile")} className="btn-hover"
                style={{ padding: "10px 20px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Register Profile
              </button>
            </div>
          ) : (currentUser.role === "mentor" || currentUser.role === "both") ? (
            <div style={{ background: "#FEF3E2", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #D4860B40" }}>
              <span style={{ display: "inline-flex", color: "var(--color-primary)" }}><UserCheck size={20} /></span>
              <div style={{ fontSize: 14, color: "#8B6020" }}>You are a <strong>Sin Seh</strong>. Mentees can find you in the directory. Check <em>My Mentorships</em> to respond to requests.</div>
            </div>
          ) : (
            <div style={{ background: "#EEF2FF", borderRadius: 14, padding: "16px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid #5B21B640" }}>
              <span style={{ fontSize: 20 }}><GraduationCap size={20} /></span>
              <div style={{ fontSize: 14, color: "#3B1D8A" }}>Browse Sin Sehs below and send a mentorship request. Once accepted, a chat opens here so you can get to know each other.</div>
            </div>
          )}

          {(() => {
            const incoming = pendingRequests;
            const sent = connections.filter(c => c.requester_id === currentUser?.id && c.status === 'pending');
            const active = connections.filter(c => c.status === 'accepted');
            const hasAny = incoming.length > 0 || sent.length > 0 || active.length > 0;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {connectError && (
                  <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40" }}>
                    {connectError}
                  </div>
                )}
                {!currentUser ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}><Handshake size={40} /></div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 16 }}>Sign in to view your mentorships</div>
                    <Link href={`/signin?next=${encodeURIComponent("/network")}`} className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                      Sign In
                    </Link>
                  </div>
                ) : connectionsLoading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="card shimmer" style={{ padding: 24, height: 120, background: "#F0E8DA" }} />
                    ))}
                  </div>
                ) : !hasAny ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}><Sprout size={40} /></div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No mentorships yet</div>
                    <p style={{ fontSize: 14, marginBottom: 24 }}>Browse Sin Sehs and send a request to get started.</p>
                    <button onClick={() => setNetworkView("directory")} className="btn-hover"
                      style={{ background: "#C0392B", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                      Find a Sin Seh
                    </button>
                  </div>
                ) : (
                  <>
                    {incoming.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#C0392B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Incoming Requests ({incoming.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {incoming.map(r => {
                            const dialectColor = dColors[r.language_interest] || "#8B7355";
                            return (
                              <div key={r.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{r.first_name} {r.last_name}</div>
                                  <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 8 }}>Age {r.age} · {r.occupation}</div>
                                  <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{r.language_interest}</span>
                                  <span style={{ fontSize: 11, background: "#EEF2FF", color: "#5B21B6", padding: "3px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize", marginLeft: 6 }}>{r.role}</span>
                                  {r.message && (
                                    <div style={{ marginTop: 10, fontSize: 13, color: "#6B5B45", fontStyle: "italic", background: "#FAF6F0", borderRadius: 8, padding: "8px 12px" }}>"{r.message}"</div>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => rejectConnectRequest(r.id)} className="btn-hover"
                                    style={{ padding: "10px 18px", borderRadius: 10, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                    Decline
                                  </button>
                                  <button onClick={() => acceptConnectRequest(r.id)} className="btn-hover"
                                    style={{ padding: "10px 18px", borderRadius: 10, background: "#1A6B3C", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                    Accept
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {sent.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Sent Requests ({sent.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {sent.map(c => (
                            <div key={c.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "#FEF9F0", borderColor: "#D4860B30" }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                <span style={{ fontSize: 11, background: "#FEF3E2", color: "#D4860B", padding: "3px 8px", borderRadius: 8, fontWeight: 700 }}>Sin Seh · {c.connected_user_dialect}</span>
                                {c.message && <div style={{ marginTop: 8, fontSize: 13, color: "#6B5B45", fontStyle: "italic" }}>"{c.message}"</div>}
                              </div>
                              <div style={{ fontSize: 13, color: "#D4860B", fontWeight: 600 }}>Awaiting response…</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {active.length > 0 && (() => {
                      const isValidMentorship = (c) => {
                        if (currentUser.role === 'mentor') return c.connected_user_role !== 'mentor';
                        if (currentUser.role === 'mentee') return c.connected_user_role !== 'mentee';
                        if (currentUser.role === 'both') return c.connected_user_role !== 'none';
                        return false;
                      };
                      const validMentorships = active.filter(isValidMentorship);
                      const lapsedMentorships = active.filter(c => !isValidMentorship(c));
                      return (
                        <>
                          {validMentorships.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, letterSpacing: 3, color: "#1A6B3C", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Active Mentorships ({validMentorships.length})</div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                                {validMentorships.map(c => {
                                  const dialectColor = dColors[c.connected_user_dialect] || "#8B7355";
                                  return (
                                    <div key={c.id} className="card" style={{ padding: 24 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                        <span style={{ fontSize: 11, background: c.connected_user_role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: c.connected_user_role === "mentor" ? "#D4860B" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                                          {c.connected_user_role}
                                        </span>
                                      </div>
                                      {c.connected_user_dialect && (
                                        <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>{c.connected_user_dialect}</span>
                                      )}
                                      <button className="btn-hover" onClick={() => openChatWith(c.connected_user_id)}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
                                        <MessageCircle size={15} /> Open Chat
                                      </button>
                                      <button onClick={() => setRemoveConfirm({ id: c.id, name: c.connected_user_name })} className="btn-hover"
                                        style={{ width: "100%", padding: "8px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                        Remove Connection
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {lapsedMentorships.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Lapsed Mentorships ({lapsedMentorships.length})</div>
                              <div style={{ background: "#FEF9F0", borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 12, color: "#8B7355", border: "1px solid #D4860B30" }}>
                                These connections no longer match your current role — both of you may now have the same role. You can remove them below.
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
                                {lapsedMentorships.map(c => {
                                  const dialectColor = dColors[c.connected_user_dialect] || "#8B7355";
                                  return (
                                    <div key={c.id} className="card" style={{ padding: 24, opacity: 0.7 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                        <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>{c.connected_user_name}</div>
                                        <span style={{ fontSize: 11, background: c.connected_user_role === "mentor" ? "#FEF3E2" : "#EEF2FF", color: c.connected_user_role === "mentor" ? "#D4860B" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                                          {c.connected_user_role}
                                        </span>
                                      </div>
                                      {c.connected_user_dialect && (
                                        <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600, display: "block", marginBottom: 10 }}>{c.connected_user_dialect}</span>
                                      )}
                                      <button className="btn-hover" onClick={() => openChatWith(c.connected_user_id)}
                                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "#F5F0EA", border: "1px solid #E8DDD0", fontSize: 13, color: "#6B5B45", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
                                        <MessageCircle size={15} /> Open Chat
                                      </button>
                                      <button onClick={() => setRemoveConfirm({ id: c.id, name: c.connected_user_name })} className="btn-hover"
                                        style={{ width: "100%", padding: "8px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                        Remove Connection
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {networkView === "chats" && (
        <div>
          {!currentUser ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-primary)" }}><MessageCircle size={40} /></div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 16 }}>Sign in to view your chats</div>
              <Link href={`/signin?next=${encodeURIComponent("/network")}`} className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Sign In
              </Link>
            </div>
          ) : (
            <ChatPanel currentUser={currentUser} connections={connections} users={registeredUsers} connectionsLoading={connectionsLoading}
              openConnectionId={openChatConnectionId} onOpenConnection={(id) => { setOpenChatConnectionId(id); setUnreadCounts(u => ({ ...u, [id]: 0 })); loadUnreadCounts(); }} />
          )}
        </div>
      )}

      {networkView === "everyone" && (
        <div>
          {connectError && (
            <div style={{ background: "#FDEDEC", color: "#C0392B", borderRadius: 10, padding: "12px 16px", fontSize: 13, border: "1px solid #C0392B40", marginBottom: 20 }}>
              {connectError}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
            {["All", "Mentor", "Mentee"].map(f => (
              <button key={f} className="pill-toggle" onClick={() => setNetworkFilter(f)}
                style={{ padding: "8px 16px", borderRadius: 20, background: networkFilter === f ? "#C0392B" : "white", color: networkFilter === f ? "white" : "#6B5B45", fontSize: 13, border: "1px solid " + (networkFilter === f ? "#C0392B" : "#E8DDD0"), fontWeight: networkFilter === f ? 600 : 400, cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>

          {profilesLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="card shimmer" style={{ padding: 24, height: 150, background: "#F0E8DA" }} />
              ))}
            </div>
          ) : registeredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "var(--color-primary)" }}><Sprout size={40} /></div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 8 }}>No members yet</div>
              <p style={{ fontSize: 14 }}>Be the first to join the community and connect with fellow dialect learners.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
              {registeredUsers
                .filter(m => networkFilter === "All" || m.role === networkFilter.toLowerCase())
                .map(m => {
                  const dialectColor = dColors[m.languageInterest] || "#8B7355";
                  const isCurrentUser = currentUser?.id === m.id;
                  const connStatus = currentUser ? getConnectionStatus(m.id) : 'none';
                  return (
                    <div key={m.id} className="card" style={{ padding: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <Avatar url={m.avatarUrl} emoji={m.avatar} size={56} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#1A1208" }}>
                              <Link href={`/member/${m.id}`} style={{ color: "inherit", textDecoration: "none" }}>{m.firstName} {m.lastName}</Link>
                            </div>
                            <div style={{ fontSize: 12, color: "#9B8B75" }}>Age {m.age} · {m.occupation}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, background: m.role === "mentor" ? "#FEF3E2" : m.role === "both" ? "#E8D5F2" : m.role === "none" ? "#F0E8DA" : "#EEF2FF", color: m.role === "mentor" ? "#D4860B" : m.role === "both" ? "#6B21A8" : m.role === "none" ? "#6B5B45" : "#5B21B6", padding: "4px 8px", borderRadius: 8, fontWeight: 700, textTransform: "capitalize" }}>
                          {m.role}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, background: dialectColor + "18", color: dialectColor, padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{m.languageInterest || "—"}</span>
                      </div>
                      {connStatus === 'accepted' ? (
                        <button className="btn-hover" onClick={() => openChatWith(m.id)}
                          style={{ marginTop: 4, width: "100%", padding: "10px 14px", borderRadius: 10, background: "#EAFAF1", border: "1px solid #1A6B3C40", fontSize: 13, color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          <MessageCircle size={15} /> Open Chat
                        </button>
                      ) : isCurrentUser ? (
                        <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#9B8B75", fontSize: 13, textAlign: "center" }}>
                          This is you
                        </div>
                      ) : !currentUser ? (
                        <button className="btn-hover" onClick={() => router.push("/profile")}
                          style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#F5F0EA", color: "#8B7355", border: "1px dashed #D4C9B8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Register to Connect
                        </button>
                      ) : connStatus === 'sent' ? (
                        <div style={{ marginTop: 4, padding: "10px", borderRadius: 10, background: "#FEF3E2", color: "#D4860B", fontSize: 13, fontWeight: 600, textAlign: "center", border: "1px solid #D4860B40" }}>
                          Request Sent ✓
                        </div>
                      ) : connStatus === 'received' ? (
                        <button className="btn-hover" onClick={() => setNetworkView("mentorships")}
                          style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#5B21B6", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Respond to their request <ArrowRight size={15} />
                        </button>
                      ) : (
                        <button className="btn-hover" onClick={() => sendConnectRequest(m.id, '', m.firstName)}
                          style={{ marginTop: 4, width: "100%", padding: "10px", borderRadius: 10, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Send Connect Request
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
