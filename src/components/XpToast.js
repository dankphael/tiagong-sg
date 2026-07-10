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
      {toasts.map(t => {
        const border = t.type === "error" ? "#C0392B" : t.type === "success" ? "#1A6B3C" : "var(--color-primary)";
        return (
          <div
            key={t.id}
            className="fade-up"
            role={t.type === "error" || t.type === "success" ? "status" : undefined}
            style={{
              background: "var(--color-dark)", color: "var(--color-cream)",
              padding: "10px 18px", borderRadius: "var(--radius-md)",
              fontSize: 13, fontWeight: 600, boxShadow: "var(--shadow-md)",
              border: `1px solid ${border}`,
            }}
          >
            {t.text}
          </div>
        );
      })}
    </div>
  );
}
