'use client';

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { relativeTime } from "@/lib/time";

// Collapsed "💬 N" button that expands into an inline comment thread for one
// dictionary word. `count` is the bulk-fetched count from the parent
// (dictionary page); the full list is only fetched once expanded.
export default function WordComments({ wordId, dialect, count = 0 }) {
  const { currentUser, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [localCount, setLocalCount] = useState(count);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      setLoading(true);
      fetch(`/api/comments?wordId=${encodeURIComponent(wordId)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setComments(Array.isArray(data) ? data : []))
        .catch(() => setComments([]))
        .finally(() => setLoading(false));
    }
  }

  function post() {
    const trimmed = draft.trim();
    if (trimmed.length < 3) { showToast("Comment is too short", "error"); return; }
    if (!currentUser) { showToast("Sign in to join the conversation", "error"); return; }
    const token = localStorage.getItem("auth_token");
    setPosting(true);
    fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ wordId, dialect, body: trimmed }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { showToast(data.error || "Failed to post comment", "error"); return; }
        setComments(prev => [...(prev || []), data]);
        setLocalCount(c => c + 1);
        setDraft("");
      })
      .catch(() => showToast("Network error — please try again", "error"))
      .finally(() => setPosting(false));
  }

  function remove(id) {
    const token = localStorage.getItem("auth_token");
    fetch(`/api/comments/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { showToast(data.error || "Failed to delete comment", "error"); return; }
        setComments(prev => prev.filter(c => c.id !== id));
        setLocalCount(c => Math.max(0, c - 1));
      })
      .catch(() => showToast("Network error — please try again", "error"));
  }

  const isCustodian = currentUser?.custodianDialects?.includes(dialect) || currentUser?.accountType === 'admin';

  return (
    <div>
      <button onClick={toggleOpen}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#8B7355", fontWeight: 600, padding: "8px", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <MessageSquare size={11} /> {localCount > 0 ? `${localCount} comment${localCount === 1 ? '' : 's'}` : 'Comment'}
      </button>

      {open && (
        <div style={{ marginTop: 8, padding: "12px 14px", background: "#FAF6F0", borderRadius: 10, border: "1px solid #F0E8DA" }}>
          {loading ? (
            <div style={{ fontSize: 12, color: "#9B8B75" }}>Loading…</div>
          ) : comments && comments.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
              {comments.map(c => (
                <div key={c.id} style={{ fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <Link href={`/member/${c.authorId}`} style={{ fontWeight: 700, color: "#1A1208", textDecoration: "none" }}>{c.authorName}</Link>
                      <span style={{ color: "#9B8B75", marginLeft: 6 }}>{relativeTime(c.createdAt)}</span>
                    </div>
                    {(currentUser?.id === c.authorId || isCustodian) && (
                      <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C0392B", fontSize: 11, fontFamily: "inherit", padding: 0 }}>
                        Delete
                      </button>
                    )}
                  </div>
                  <div style={{ color: "#1A1208", marginTop: 3, lineHeight: 1.5 }}>{c.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#9B8B75", marginBottom: 10 }}>No comments yet — start the conversation.</div>
          )}

          {currentUser ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !posting) post(); }}
                placeholder="Share a memory, correction, or usage note…" className="input" style={{ flex: 1, height: 36, fontSize: 13 }} />
              <button onClick={post} disabled={posting}
                style={{ padding: "0 14px", borderRadius: 8, background: "#1A1208", color: "#F5E6C8", border: "none", fontSize: 12, fontWeight: 600, cursor: posting ? "default" : "pointer", fontFamily: "inherit", opacity: posting ? 0.6 : 1 }}>
                Post
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#9B8B75" }}>Sign in to join the conversation.</div>
          )}
        </div>
      )}
    </div>
  );
}
