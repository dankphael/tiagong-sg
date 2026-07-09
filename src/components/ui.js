// Shared UI components for tiagong.sg

import { useState, useEffect, useRef } from "react";

/* ── SealChip ──
   A refined Chinese-character seal for a dialect: the dialect's 方言
   character on a tinted dialectColor background. Culturally grounded,
   never an emoji. */
export function SealChip({ dialect, size = "md", style }) {
  const dims = size === "lg" ? 60 : size === "sm" ? 38 : 48;
  const font = size === "lg" ? 26 : size === "sm" ? 17 : 22;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dims,
        height: dims,
        borderRadius: "var(--radius-md)",
        background: dialect.bg || `${dialect.color}1A`,
        color: dialect.color,
        fontFamily: "var(--font-chinese)",
        fontWeight: 700,
        fontSize: font,
        lineHeight: 1,
        boxShadow: `inset 0 0 0 1.5px ${dialect.color}55`,
        flexShrink: 0,
        ...style,
      }}
    >
      {dialect.chinese}
    </span>
  );
}

export function Badge({ children, color, style }) {
  return (
    <span
      className="badge"
      style={color ? { background: `${color}14`, color, borderColor: `${color}40` } : undefined}
      {...style}
    >
      {children}
    </span>
  );
}

export function Chip({ children, style }) {
  return (
    <span className="chip" style={style}>
      {children}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action, className }) {
  return (
    <div className={`section-header${className ? " " + className : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && <h2 className="heading">{title}</h2>}
      {subtitle && <p className="body-text" style={{ marginTop: "var(--space-2)", maxWidth: 640 }}>{subtitle}</p>}
      {action}
    </div>
  );
}

export function Card({ children, hover, className, style }) {
  return (
    <div className={`card${hover ? " card-hover" : ""}${className ? " " + className : ""}`} style={style}>
      {children}
    </div>
  );
}

export function IconButton({ children, onClick, label, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.2s, color 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function CountUp({ value, active, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!active) { setDisplay(0); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, active, duration]);
  return <>{display.toLocaleString()}</>;
}

export function DialectTooltip({ phrase, meaning, romanization, color = "#C0392B" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  const handleShow = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top - 100, left: rect.left });
      setShowTooltip(true);
    }
  };

  return (
    <span
      ref={ref}
      style={{
        cursor: "help",
        color: color,
        fontWeight: 500
      }}
      onMouseEnter={handleShow}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleShow}
    >
      {phrase}
      {showTooltip && (
        <div style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 1000,
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          boxShadow: "var(--shadow-md)",
          border: `1.5px solid ${color}40`,
          minWidth: 200,
          fontSize: 13,
          fontFamily: "var(--font-sans)"
        }}>
          <div style={{ fontWeight: 700, color: color, marginBottom: 6, fontSize: 14 }}>
            {phrase}
          </div>
          <div style={{ color: "var(--color-text-secondary)", marginBottom: romanization ? 8 : 0 }}>
            {meaning}
          </div>
          {romanization && (
            <div style={{ fontSize: 12, color: "var(--color-text-faint)", fontStyle: "italic" }}>
              {romanization}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export function AnnotatedText({ text, dialectColor = "#C0392B" }) {
  const parts = [];
  const regex = /\[\[([^\|]+)\|([^\|]+)(?:\|([^\]]+))?\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    const [, phrase, meaning, romanization] = match;
    parts.push(
      <DialectTooltip
        key={`tooltip-${match.index}`}
        phrase={phrase}
        meaning={meaning}
        romanization={romanization}
        color={dialectColor}
      />
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}
