'use client';

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Calendar, Check, X, ArrowLeft } from "lucide-react";
import { getIcebreakers } from "@/lib/matching";
import { useApp } from "@/components/AppProvider";

const POLL_MS = 5000;

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// Fourth "Chats" view for the Network page — deliberately lightweight
// vestibule chat: conversation list + thread + icebreakers + meetup
// proposals. Not meant to replace WhatsApp, just to get two people to a
// first coffee chat.
export default function ChatPanel({ currentUser, connections, openConnectionId, onOpenConnection, users, connectionsLoading }) {
  const { showToast } = useApp();
  const [activeId, setActiveId] = useState(openConnectionId || null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [proposing, setProposing] = useState(false);
  const [proposal, setProposal] = useState({ date: "", time: "", place: "" });
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const sinceIdRef = useRef(null);
  const bottomRef = useRef(null);

  const accepted = (connections || []).filter(c => c.status === "accepted");
  const active = accepted.find(c => c.id === activeId) || null;

  useEffect(() => {
    if (openConnectionId) setActiveId(openConnectionId);
  }, [openConnectionId]);

  useEffect(() => {
    setMessages([]);
    sinceIdRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeId) { setThreadLoading(false); return; }
    setThreadLoading(true);

    async function fetchMessages(isInitial) {
      const token = localStorage.getItem("auth_token");
      if (!token) { if (isInitial) setThreadLoading(false); return; }
      try {
        const params = new URLSearchParams({ connectionId: activeId });
        if (sinceIdRef.current) params.set("sinceId", sinceIdRef.current);
        const res = await fetch(`/api/messages?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;
        if (data.length > 0) {
          setMessages(prev => sinceIdRef.current ? [...prev, ...data] : data);
          sinceIdRef.current = data[data.length - 1].id;
        }
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        if (isInitial) setThreadLoading(false);
      }
    }

    fetchMessages(true);
    pollRef.current = setInterval(() => fetchMessages(false), POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(type, body, metadata) {
    const token = localStorage.getItem("auth_token");
    if (!token || !activeId) return;
    setError(null);
    const optimistic = { id: `pending-${Date.now()}`, connection_id: activeId, sender_id: currentUser.id, type, body, metadata: metadata || {}, created_at: new Date().toISOString(), _pending: true };
    setMessages(prev => [...prev, optimistic]);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ connectionId: activeId, type, body, metadata }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Failed to send message";
        setError(errMsg);
        showToast(errMsg, "error");
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        return;
      }
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m));
      sinceIdRef.current = data.id;
    } catch (e) {
      console.error("Failed to send message:", e);
      setError("Network error — please try again");
      showToast("Network error — please try again", "error");
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  }

  async function respondToProposal(messageId, action) {
    const token = localStorage.getItem("auth_token");
    setError(null);
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Failed to respond";
        setError(errMsg);
        showToast(errMsg, "error");
        return;
      }
      setMessages(prev => prev.map(m => m.id === data.id ? data : m));
    } catch (e) {
      console.error("Failed to respond to proposal:", e);
      setError("Network error — please try again");
      showToast("Network error — please try again", "error");
    }
  }

  const otherProfile = active && users ? users.find(u => u.id === active.connected_user_id) : null;
  const icebreakers = active && currentUser ? getIcebreakers(currentUser, otherProfile || {}) : [];

  return (
    <div className="chat-layout" style={{ gap: 20, minHeight: 480 }}>
      <div className={`card${active ? " chat-list-col-hidden-mobile" : ""}`} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #E8DDD0", fontSize: 12, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", fontWeight: 700 }}>Chats</div>
        {connectionsLoading ? (
          <div style={{ padding: "10px 18px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="shimmer" style={{ background: "#F0E8DA", borderRadius: 8, height: 52, marginBottom: 8 }} />
            ))}
          </div>
        ) : accepted.length === 0 ? (
          <div style={{ padding: "24px 18px", fontSize: 13, color: "#9B8B75", textAlign: "center" }}>
            No conversations yet. Connect with someone to start chatting.
          </div>
        ) : (
          <div>
            {accepted.map(c => (
              <button key={c.id} onClick={() => { setActiveId(c.id); onOpenConnection?.(c.id); }}
                style={{ width: "100%", textAlign: "left", padding: "14px 18px", border: "none", borderBottom: "1px solid #F0E8DA", background: activeId === c.id ? "#FAF6F0" : "white", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1208" }}>{c.connected_user_name}</div>
                  {c.connected_user_verified && <span style={{ fontSize: 11, color: "#D4860B" }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, color: "#9B8B75", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.last_message_body || "Say hello 👋"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`card${!active ? " chat-thread-col-hidden-mobile" : ""}`} style={{ padding: 0, display: "flex", flexDirection: "column" }}>
        {!active ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9B8B75", padding: 40 }}>
            <MessageCircle size={36} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Select a conversation to start chatting</div>
          </div>
        ) : (
          <>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8DDD0", fontWeight: 700, fontSize: 15, color: "#1A1208", display: "flex", alignItems: "center", gap: 10 }}>
              <button className="chat-mobile-back" onClick={() => setActiveId(null)} title="Back to chats"
                style={{ alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: "#FAF6F0", border: "1px solid #E8DDD0", color: "#6B5B45", cursor: "pointer", flexShrink: 0 }}>
                <ArrowLeft size={16} />
              </button>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{active.connected_user_name}</span>
            </div>
            <div style={{ flex: 1, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: "min(380px, 55vh)" }}>
              {threadLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="shimmer" style={{ background: "#F0E8DA", borderRadius: 14, height: 36, width: i % 2 ? "50%" : "65%", alignSelf: i % 2 ? "flex-end" : "flex-start" }} />
                  ))}
                </div>
              ) : messages.length === 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 8 }}>Not sure how to start? Try:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {icebreakers.map((text, i) => (
                      <button key={i} onClick={() => sendMessage("text", text)}
                        style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, background: "#FAF6F0", border: "1px solid #E8DDD0", fontSize: 13, color: "#6B5B45", cursor: "pointer", fontFamily: "inherit" }}>
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(m => {
                const isMe = m.sender_id === currentUser?.id;
                if (m.type === "meetup_proposal") {
                  const st = m.metadata?.status || "proposed";
                  return (
                    <div key={m.id} style={{ alignSelf: "center", maxWidth: "min(320px, 100%)", width: "100%", padding: 16, borderRadius: 12, background: st === "accepted" ? "#EAFAF1" : st === "declined" ? "#FDEDEC" : "#FEF3E2", border: "1px solid " + (st === "accepted" ? "#1A6B3C40" : st === "declined" ? "#C0392B40" : "#D4860B40") }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 700, fontSize: 13, color: "#1A1208" }}>
                        <Calendar size={16} /> Meetup Proposal
                      </div>
                      <div style={{ fontSize: 13, color: "#6B5B45", marginBottom: 4 }}>{m.metadata?.date} {m.metadata?.time ? `· ${m.metadata.time}` : ""}</div>
                      <div style={{ fontSize: 13, color: "#6B5B45", marginBottom: 10 }}>📍 {m.metadata?.place}</div>
                      {st === "accepted" ? (
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A6B3C" }}>Meetup confirmed ☕</div>
                      ) : st === "declined" ? (
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#C0392B" }}>Declined</div>
                      ) : isMe ? (
                        <div style={{ fontSize: 12, color: "#D4860B", fontWeight: 600 }}>Waiting for response…</div>
                      ) : (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => respondToProposal(m.id, "decline_meetup")}
                            style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            <X size={13} /> Decline
                          </button>
                          <button onClick={() => respondToProposal(m.id, "accept_meetup")}
                            style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#1A6B3C", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            <Check size={13} /> Accept
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={m.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                    <div style={{ padding: "10px 14px", borderRadius: 14, background: isMe ? "#1A1208" : "#FAF6F0", color: isMe ? "#F5E6C8" : "#1A1208", fontSize: 13, opacity: m._pending ? 0.6 : 1 }}>
                      {m.body}
                    </div>
                    <div style={{ fontSize: 10, color: "#9B8B75", marginTop: 3, textAlign: isMe ? "right" : "left" }}>{fmtTime(m.created_at)}</div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div style={{ padding: "8px 20px", fontSize: 12, color: "#C0392B" }}>{error}</div>
            )}

            {proposing && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid #E8DDD0", background: "#FAF6F0" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <input type="date" value={proposal.date} onChange={e => setProposal(p => ({ ...p, date: e.target.value }))} className="input" style={{ flex: 1, minWidth: 130, height: 38 }} />
                  <input type="time" value={proposal.time} onChange={e => setProposal(p => ({ ...p, time: e.target.value }))} className="input" style={{ flex: 1, minWidth: 100, height: 38 }} />
                </div>
                <input type="text" value={proposal.place} onChange={e => setProposal(p => ({ ...p, place: e.target.value }))} placeholder="Where? e.g. Toa Payoh Kopitiam" className="input" style={{ width: "100%", height: 38, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setProposing(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "white", border: "1px solid #E8DDD0", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>Cancel</button>
                  <button onClick={() => {
                    if (!proposal.date || !proposal.place) { setError("Date and place are required"); return; }
                    sendMessage("meetup_proposal", null, proposal);
                    setProposing(false);
                    setProposal({ date: "", time: "", place: "" });
                  }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Propose Meetup</button>
                </div>
              </div>
            )}

            <div style={{ padding: 14, borderTop: "1px solid #E8DDD0", display: "flex", gap: 8 }}>
              <button onClick={() => setProposing(p => !p)} title="Propose a meetup"
                style={{ padding: "10px 12px", borderRadius: 10, background: "#FAF6F0", border: "1px solid #E8DDD0", cursor: "pointer", color: "#6B5B45" }}>
                <Calendar size={16} />
              </button>
              <input value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { sendMessage("text", draft.trim()); setDraft(""); } }}
                placeholder="Type a message..." className="input" style={{ flex: 1, height: 40 }} />
              <button onClick={() => { if (draft.trim()) { sendMessage("text", draft.trim()); setDraft(""); } }}
                style={{ padding: "10px 14px", borderRadius: 10, background: "#C0392B", color: "white", border: "none", cursor: "pointer" }}>
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
