'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { dialects } from "@/data/staticData";
import { SealChip } from "@/components/ui";

// In-header dialect picker: click the dialect name to switch in place. A
// route change (router.push) fully remounts the learn page, which is what
// resets every game's state when the learner switches dialects.
export default function DialectSwitcher({ dialect }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "left" }}>
        <div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 8 }}>
            {dialect.name}
            <ChevronDown size={20} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </div>
          <div style={{ fontSize: 18, color: dialect.color, fontFamily: "var(--font-chinese)" }}>{dialect.chinese}</div>
        </div>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, background: "white", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--color-border)", overflow: "hidden", zIndex: 20, minWidth: 240, maxWidth: "calc(100vw - 48px)" }}>
          {dialects.map(d => (
            <button key={d.id} onClick={() => { setOpen(false); router.push(`/learn/${d.id}`); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: d.id === dialect.id ? `${d.color}12` : "white", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <SealChip dialect={d} size="sm" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: d.color, fontFamily: "var(--font-chinese)" }}>{d.chinese}</div>
              </div>
            </button>
          ))}
          <button onClick={() => { setOpen(false); router.push('/learn'); }}
            style={{ display: "block", width: "100%", padding: "10px 14px", background: "var(--color-surface)", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 600 }}>
            All dialects →
          </button>
        </div>
      )}
    </div>
  );
}
