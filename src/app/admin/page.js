'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";

export default function AdminPage() {
  const { currentUser, ready, showToast, setRegisteredUsers } = useApp();
  const [tab, setTab] = useState("applications");
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null); // user id pending confirmation

  const isAdmin = currentUser?.accountType === "admin";

  async function loadApplications() {
    const token = localStorage.getItem("auth_token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch("/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load applications:", e);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(searchTerm = "") {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const res = await fetch(`/api/admin/users${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load users:", e);
      setUsers([]);
    } finally {
      setUsersLoaded(true);
    }
  }

  useEffect(() => {
    if (isAdmin) loadApplications();
    else setLoading(false);
  }, [currentUser?.id, isAdmin]);

  useEffect(() => {
    if (isAdmin && tab === "users" && !usersLoaded) loadUsers();
  }, [isAdmin, tab, usersLoaded]);

  async function reviewApplication(id, action, note) {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to review application", "error");
        return;
      }
      setApplications(a => a.filter(x => x.id !== id));
      setRejectingId(null);
      showToast(action === "approve" ? "Approved — custodian access granted" : "Application rejected", "success");
    } catch (e) {
      console.error("Failed to review application:", e);
      showToast("Network error — please try again", "error");
    }
  }

  async function toggleVerified(user) {
    const token = localStorage.getItem("auth_token");
    const nextVerified = !user.verified;
    setUsers(u => u.map(x => x.id === user.id ? { ...x, verified: nextVerified } : x));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verified: nextVerified }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsers(u => u.map(x => x.id === user.id ? { ...x, verified: user.verified } : x));
        showToast(data.error || "Failed to update user", "error");
        return;
      }
      showToast(nextVerified ? "Verified badge granted" : "Verified badge revoked", "success");
    } catch (e) {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, verified: user.verified } : x));
      console.error("Failed to update user:", e);
      showToast("Network error — please try again", "error");
    }
  }

  async function toggleDeactivated(user) {
    const token = localStorage.getItem("auth_token");
    const nextDeactivated = !user.deactivated;
    setUsers(u => u.map(x => x.id === user.id ? { ...x, deactivated: nextDeactivated } : x));
    setConfirmDeactivate(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deactivated: nextDeactivated }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsers(u => u.map(x => x.id === user.id ? { ...x, deactivated: user.deactivated } : x));
        showToast(data.error || "Failed to update user", "error");
        return;
      }
      showToast(nextDeactivated ? "Account deactivated" : "Account reactivated", "success");
      fetch("/api/users/profiles")
        .then(r => r.json())
        .then(users => setRegisteredUsers(Array.isArray(users) ? users : []))
        .catch(err => console.error("Failed to refresh profiles:", err));
    } catch (e) {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, deactivated: user.deactivated } : x));
      console.error("Failed to update user:", e);
      showToast("Network error — please try again", "error");
    }
  }

  if (!ready || loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map(i => <div key={i} className="card shimmer" style={{ padding: 20, height: 100, background: "#F0E8DA" }} />)}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "#1A1208", marginBottom: 12 }}>Admin Access Required</div>
        <p style={{ color: "#8B7355", fontSize: 14 }}>This page is restricted to platform administrators.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }} className="fade-up">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#C0392B", textTransform: "uppercase", marginBottom: 8 }}>Admin Console</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, color: "#1A1208", marginBottom: 8 }}>Manage tiagongSG</h1>
        <Link href="/custodian" style={{ fontSize: 13, color: "#C0392B", fontWeight: 600 }}>
          Review contribution queue — all dialects →
        </Link>
      </div>

      <div className="pill-toggle" style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[["applications", `Applications (${applications.length})`], ["users", "Users"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}
            style={{ padding: "9px 18px", borderRadius: 10, background: tab === id ? "#C0392B" : "white", color: tab === id ? "white" : "#6B5B45", fontSize: 13, border: "2px solid " + (tab === id ? "#C0392B" : "#E8DDD0"), fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "applications" && (
        applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B8B75" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#1A1208", marginBottom: 8 }}>No pending applications</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {applications.map(app => (
              <div key={app.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1A1208" }}>{app.first_name} {app.last_name}</div>
                    <div style={{ fontSize: 12, color: "#9B8B75" }}>{app.email}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#9B8B75" }}>{new Date(app.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {(Array.isArray(app.dialects) ? app.dialects : []).map(d => (
                    <span key={d} style={{ fontSize: 11, background: "#F5F0EA", color: "#6B5B45", padding: "3px 10px", borderRadius: 8, fontWeight: 600, textTransform: "capitalize" }}>{d}</span>
                  ))}
                </div>
                {app.background && (
                  <div style={{ fontSize: 13, color: "#1A1208", marginBottom: 6 }}><strong>Background:</strong> {app.background}</div>
                )}
                {app.credentials && (
                  <div style={{ fontSize: 13, color: "#1A1208", marginBottom: 6 }}><strong>Credentials:</strong> {app.credentials}</div>
                )}
                {app.huay_kuan && (
                  <div style={{ fontSize: 13, color: "#1A1208", marginBottom: 10 }}><strong>Huay kuan:</strong> {app.huay_kuan}</div>
                )}

                {rejectingId === app.id ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setRejectingId(null)}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#F5F0EA", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                      Cancel
                    </button>
                    <button onClick={() => reviewApplication(app.id, "reject")}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#C0392B", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Confirm Reject
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setRejectingId(app.id)}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#FDEDEC", color: "#C0392B", border: "1px solid #C0392B40", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Reject
                    </button>
                    <button onClick={() => reviewApplication(app.id, "approve")}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#1A6B3C", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === "users" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") loadUsers(search); }}
              placeholder="Search by name or email..." className="input" style={{ flex: 1 }} />
            <button onClick={() => loadUsers(search)} className="btn-secondary">Search</button>
          </div>

          {!Array.isArray(users) || users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", color: "#9B8B75" }}>
              <p style={{ fontSize: 14 }}>No users found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {users.map(u => (
                <div key={u.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1A1208" }}>
                      {u.first_name} {u.last_name}
                      {u.account_type === "admin" && <span style={{ marginLeft: 8, fontSize: 10, background: "#1A1208", color: "#F5E6C8", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>ADMIN</span>}
                      {u.deactivated && <span style={{ marginLeft: 8, fontSize: 10, background: "#FDEDEC", color: "#C0392B", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>DEACTIVATED</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#9B8B75" }}>{u.email} · {u.role}</div>
                    {Array.isArray(u.custodian_dialects) && u.custodian_dialects.length > 0 && (
                      <div style={{ fontSize: 11, color: "#6B5B45", marginTop: 2 }}>Custodian: {u.custodian_dialects.join(", ")}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => toggleVerified(u)}
                      style={{ padding: "7px 14px", borderRadius: 8, background: u.verified ? "#EAFAF1" : "#F5F0EA", color: u.verified ? "#1A6B3C" : "#6B5B45", border: "1px solid " + (u.verified ? "#1A6B3C40" : "#E8DDD0"), fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {u.verified ? "✓ Verified" : "Verify"}
                    </button>
                    {confirmDeactivate === u.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setConfirmDeactivate(null)}
                          style={{ padding: "7px 10px", borderRadius: 8, background: "#F5F0EA", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B5B45" }}>
                          Cancel
                        </button>
                        <button onClick={() => toggleDeactivated(u)}
                          style={{ padding: "7px 10px", borderRadius: 8, background: "#C0392B", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => u.deactivated ? toggleDeactivated(u) : setConfirmDeactivate(u.id)}
                        style={{ padding: "7px 14px", borderRadius: 8, background: u.deactivated ? "#EAFAF1" : "#FDEDEC", color: u.deactivated ? "#1A6B3C" : "#C0392B", border: "1px solid " + (u.deactivated ? "#1A6B3C40" : "#C0392B40"), fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {u.deactivated ? "Reactivate" : "Deactivate"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
