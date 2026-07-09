'use client';

import Link from "next/link";
import Image from "next/image";
import { dialects } from "@/data/staticData";

export function Footer() {
  return (
    <div style={{ background: "#1A1208", padding: "48px 32px 32px", borderTop: "3px solid #C0392B" }}>
      <div className="footer-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Image src="/logo/06-seal-only-dark-bg.png" alt="tiagong.sg" width={28} height={28} style={{ width: 28, height: 28 }} />
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "#F5E6C8" }}>tiagong.sg</div>
          </div>
          <p style={{ color: "#6B5B45", fontSize: 13, lineHeight: 1.7 }}>
            Preserving Singapore's Chinese dialect heritage — one phrase at a time.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Explore</div>
          {[["/?screen=home", "Learn Dialects"], ["/dictionary", "Search Phrases"], ["/singlish", "Dialects in Singlish"], ["/associations", "Clan Associations"], ["/about", "About Us"]].map(([href, label]) => (
            <Link key={href} href={href} style={{ display: "block", color: "#8B7355", fontSize: 13, marginBottom: 8, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F5E6C8"} onMouseLeave={e => e.currentTarget.style.color = "#8B7355"}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Dialects</div>
          {dialects.map(d => (
            <Link key={d.id} href={`/?screen=lesson&dialect=${d.id}`} style={{ color: "#8B7355", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F5E6C8"} onMouseLeave={e => e.currentTarget.style.color = "#8B7355"}>
              <span>{d.icon}</span> {d.name}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "24px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <p style={{ color: "#4A3A28", fontSize: 13, fontStyle: "italic" }}>
          "A language lost is a culture lost." — Promote dialect preservation in Singapore.
        </p>
      </div>
    </div>
  );
}
