'use client';

export function PageShell({ eyebrow, title, subtitle, actions, maxWidth = 1100, children }) {
  return (
    <div style={{ maxWidth, margin: "0 auto", padding: "40px 24px" }} className="fade-up">
      {(eyebrow || title || subtitle) && (
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
          {title && <h1 className="display-1" style={{ fontSize: 44, marginBottom: 12 }}>{title}</h1>}
          {subtitle && <p style={{ color: "var(--color-text-muted)", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>{subtitle}</p>}
          {actions && <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
