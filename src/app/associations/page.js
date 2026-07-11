'use client';

import { Landmark, MapPin, Phone, MessageCircle, Printer, Clock, Mail, Globe, Building2 } from "lucide-react";
import { huayKuan } from "@/data/staticData";

export default function AssociationsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }} className="fade-up">

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 40 }}><Landmark size={40} /></div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>
              Clan Associations
            </h1>
            <p style={{ color: "#6B5B45", fontSize: 14, lineHeight: 1.6 }}>
              The <em>huay kuan</em> (会馆) of Singapore's dialect communities — guardians of language, culture, and identity since the 1800s.
            </p>
          </div>
        </div>
      </div>

      {/* DIRECTORY */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "#1A1208", marginBottom: 4 }}>Directory</h2>
        <p style={{ fontSize: 13, color: "#8B7355" }}>Full contact and background information for each huay kuan</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {huayKuan.map(hk => (
          <div key={hk.id}
            style={{ background: "white", borderRadius: 18, border: "1.5px solid #E8DDD0", padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
            className="btn-hover">
            {/* Card header */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: `${hk.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: hk.color, flexShrink: 0 }}>{hk.shortName?.[0] || hk.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, color: "#1A1208", lineHeight: 1.3, marginBottom: 4 }}>{hk.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ background: `${hk.color}18`, border: `1.5px solid ${hk.color}44`, borderRadius: 20, padding: "2px 9px", fontSize: 11, color: hk.color, fontWeight: 700 }}>{hk.dialectLabel}</span>
                  {hk.founded && <span style={{ fontSize: 11, color: "#8B7355", padding: "2px 0" }}>est. {hk.founded}</span>}
                  {hk.members && <span style={{ fontSize: 11, color: "#8B7355", padding: "2px 0" }}>· {hk.members} members</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: 13, color: "#6B5B45", lineHeight: 1.65, marginBottom: 16, borderLeft: `3px solid ${hk.color}40`, paddingLeft: 10 }}>{hk.description}</p>

            {/* Contact grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)", alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, color: hk.color, display: "inline-flex" }}><MapPin size={13} /></span>
                <span>{hk.address}</span>
              </div>
              {hk.tel && hk.tel.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: hk.color, display: "inline-flex" }}><Phone size={13} /></span><span>{t}</span>
                </div>
              ))}
              {hk.whatsapp && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: hk.color, display: "inline-flex" }}><MessageCircle size={13} /></span><span>WhatsApp: {hk.whatsapp}</span>
                </div>
              )}
              {hk.fax && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-muted)" }}>
                  <span style={{ color: hk.color, display: "inline-flex" }}><Printer size={13} /></span><span>{hk.fax}</span>
                </div>
              )}
              {hk.hours && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: hk.color, display: "inline-flex" }}><Clock size={13} /></span><span>{hk.hours}</span>
                </div>
              )}
              {hk.email && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: hk.color, display: "inline-flex" }}><Mail size={13} /></span><a href={`mailto:${hk.email}`} style={{ color: hk.color, textDecoration: "none" }} onClick={e => e.stopPropagation()}>{hk.email}</a>
                </div>
              )}
              {hk.website && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                  <span style={{ display:"inline-flex" }}><Globe size={13} /></span><a href={hk.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: hk.color, textDecoration: "none" }} onClick={e => e.stopPropagation()}>{hk.website}</a>
                </div>
              )}
              {hk.hallRental && (
                <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#6B5B45" }}>
                  <span style={{ display:"inline-flex" }}><Building2 size={13} /></span><span>Hall rental: {hk.hallRental.join(" / ")}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SFCCA footnote */}
      <div style={{ marginTop: 36, padding: "18px 22px", background: "#FDF6EE", borderRadius: 14, border: "1px solid #EDE0CC", fontSize: 13, color: "#6B5B45", lineHeight: 1.7 }}>
        <strong style={{ color: "#1A1208" }}><Landmark size={16} /> Singapore Federation of Chinese Clan Associations (SFCCA)</strong><br/>
        The umbrella body that unites over 200 Chinese clan associations in Singapore. Most of the huay kuan listed here are founding or key member associations of the SFCCA, which works to preserve Chinese culture, language, and heritage across all dialect groups.
      </div>

      {/* Non-affiliation disclaimer */}
      <div style={{ marginTop: 16, padding: "16px 22px", background: "#FBF2F0", borderRadius: 14, border: "1px solid #E9D3CD", fontSize: 12.5, color: "#7A5C55", lineHeight: 1.7 }}>
        <strong style={{ color: "#8A3324" }}>Disclaimer:</strong> tiagong.sg is an independent, community-driven social project. We are <strong>not affiliated with, endorsed by, or officially connected to</strong> any of the huay kuan listed above, the Singapore Federation of Chinese Clan Associations (SFCCA), or any of their member associations. All association details are shared for public reference and heritage-awareness purposes only. If you represent one of these organisations and would like something corrected or removed, please reach out to us.
      </div>
    </div>
  );
}
