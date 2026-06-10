// Shared UI components for tiagong.sg

import { useState, useEffect, useRef } from "react";

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
          background: "white",
          borderRadius: 12,
          padding: "14px 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          border: `2px solid ${color}30`,
          minWidth: 200,
          fontSize: 13,
          fontFamily: "inherit"
        }}>
          <div style={{ fontWeight: 700, color: color, marginBottom: 6, fontSize: 14 }}>
            {phrase}
          </div>
          <div style={{ color: "#6B5B45", marginBottom: romanization ? 8 : 0 }}>
            {meaning}
          </div>
          {romanization && (
            <div style={{ fontSize: 12, color: "#9B8B75", fontStyle: "italic" }}>
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
