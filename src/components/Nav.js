'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, Flame } from "lucide-react";
import { useApp } from "./AppProvider";
import { getLevel } from "@/data/xpSystem";

const OTHER_LINKS = [
  ["/dictionary", "Search", "dictionary"],
  ["/singlish", "Dialects in Singlish", "singlish"],
  ["/network", "Network", "network"],
  ["/community", "Community", "community"],
  ["/contribute", "Contribute", "contribute"],
  ["/associations", "Associations", "associations"],
  ["/about", "About", "about"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, handleLogout, xp, streak, dailyCompleted, selectedDialect } = useApp();
  // Once a learner has a dialect in progress, "Learn" jumps straight back
  // into it instead of the dialect-chooser grid. First-time visitors (no
  // dialect chosen yet) still land on /learn to pick one.
  const learnHref = selectedDialect ? `/learn/${selectedDialect}` : "/learn";
  const LINKS = [["/learn", "Learn", "learn", learnHref], ...OTHER_LINKS.map(([href, label, screenId]) => [href, label, screenId, href])];
  const level = getLevel(xp);
  const isAdmin = currentUser?.accountType === 'admin';
  const isCustodian = currentUser?.custodianDialects?.length > 0 || isAdmin;
  const activeScreen = pathname === "/" ? "home" : pathname.replace(/^\//, "").split("/")[0];

  useEffect(() => {
    if (!isCustodian) { setQueueCount(0); return; }
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetch("/api/contributions/queue", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setQueueCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, [isCustodian, currentUser?.id]);

  return (
    <nav style={{ background: "var(--color-dark)", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "3px solid var(--color-primary)" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }} onClick={() => setOpen(false)}>
        <Image src="/logo/06-seal-only-dark-bg.png" alt="tiagongSG" width={44} height={44} priority style={{ width: "auto", height: 44 }} />
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--color-cream)", letterSpacing: 1 }}>tiagongSG</div>
          <div style={{ fontSize: 10, color: "var(--color-primary)", letterSpacing: 3, textTransform: "uppercase" }}>Dialect Heritage SG</div>
        </div>
      </Link>

      <div className={`nav-links${open ? " open" : ""}`}>
        {LINKS.map(([staticHref, label, screenId, actualHref]) => (
          <Link key={staticHref} href={actualHref} className={`nav-link${activeScreen === screenId ? " active" : ""}`} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        {isCustodian && (
          <Link href="/custodian" className={`nav-link${activeScreen === "custodian" ? " active" : ""}`} onClick={() => setOpen(false)}>
            Custodian
            {queueCount > 0 && (
              <span style={{ marginLeft: 6, background: "#C0392B", color: "white", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                {queueCount}
              </span>
            )}
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin" className={`nav-link${activeScreen === "admin" ? " active" : ""}`} onClick={() => setOpen(false)}>
            Admin
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {currentUser && (
          <div title={dailyCompleted ? "Today's daily challenge is done" : "Complete today's daily challenge to keep your streak"}
            style={{ display: "flex", alignItems: "center", gap: 5, color: dailyCompleted ? "#E8A33D" : "var(--color-text-muted)", fontSize: 13, fontWeight: 700 }}>
            <Flame size={16} fill={dailyCompleted ? "#E8A33D" : "none"} /> {streak}
          </div>
        )}
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {level && (
              <span style={{ fontSize: 12, color: level.color, fontWeight: 700, display: "none" }} className="nav-level-chip">
                {level.icon} {level.name}
              </span>
            )}
            <button onClick={() => { router.push("/profile"); setOpen(false); }} className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-cream)", fontSize: 13, fontStyle: "normal", background: "none", border: "none", cursor: "pointer" }}>
              <User size={16} /> {currentUser.firstName}
            </button>
            <button onClick={handleLogout} className="btn-secondary nav-signout" style={{ padding: "7px 14px", fontSize: 12 }}>
              Sign Out
            </button>
          </div>
        ) : (
          <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className="btn-primary" style={{ padding: "7px 14px", fontSize: 12, textDecoration: "none" }}>
            Sign In
          </Link>
        )}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
