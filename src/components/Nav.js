'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, X, User, Flame } from "lucide-react";
import { useApp } from "./AppProvider";
import { getLevel } from "@/data/xpSystem";

// TODO: switch to clean paths (/learn, /dictionary, etc.) once each screen
// is migrated off the monolithic src/app/page.js into a real route.
const LINKS = [
  ["/?screen=home", "Learn", "home"],
  ["/dictionary", "Search", "dictionary"],
  ["/singlish", "Dialects in Singlish", "singlish"],
  ["/network", "Network", "network"],
  ["/associations", "Associations", "associations"],
  ["/about", "About", "about"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, handleLogout, xp, streak, dailyCompleted } = useApp();
  const level = getLevel(xp);
  const activeScreen = pathname === "/" ? (searchParams.get("screen") || "home") : pathname.replace(/^\//, "");

  return (
    <nav style={{ background: "var(--color-dark)", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "3px solid var(--color-primary)" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }} onClick={() => setOpen(false)}>
        <Image src="/logo/06-seal-only-dark-bg.png" alt="tiagong.sg" width={44} height={44} priority style={{ width: "auto", height: 44 }} />
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--color-cream)", letterSpacing: 1 }}>tiagong.sg</div>
          <div style={{ fontSize: 10, color: "var(--color-primary)", letterSpacing: 3, textTransform: "uppercase" }}>Dialect Heritage SG</div>
        </div>
      </Link>

      <div className={`nav-links${open ? " open" : ""}`}>
        {LINKS.map(([href, label, screenId]) => (
          <Link key={href} href={href} className="nav-link" onClick={() => setOpen(false)}
            style={{
              color: activeScreen === screenId ? "var(--color-cream)" : undefined,
              borderBottomColor: activeScreen === screenId ? "var(--color-primary)" : undefined,
            }}>
            {label}
          </Link>
        ))}
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
            <button onClick={() => { router.push("/?screen=profile"); setOpen(false); }} className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-cream)", fontSize: 13, fontStyle: "normal", background: "none", border: "none", cursor: "pointer" }}>
              <User size={16} /> {currentUser.firstName}
            </button>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: "7px 14px", fontSize: 12 }}>
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/?screen=profile" className="btn-primary" style={{ padding: "7px 14px", fontSize: 12, textDecoration: "none" }}>
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
