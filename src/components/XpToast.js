'use client';

import { useApp } from "./AppProvider";

export function XpToastHost() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed", top: 76, right: 20, zIndex: 300,
        display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="fade-up"
          style={{
            background: "var(--color-dark)", color: "var(--color-cream)",
            padding: "10px 18px", borderRadius: "var(--radius-md)",
            fontSize: 13, fontWeight: 600, boxShadow: "var(--shadow-md)",
            border: "1px solid var(--color-primary)",
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
