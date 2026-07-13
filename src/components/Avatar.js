'use client';

// Circular avatar: renders the uploaded photo when present, falling back to
// the emoji avatar derived from gender/role (see src/lib/avatar.js). One
// place to keep that fallback so photo support doesn't need touching every
// render site individually.
export default function Avatar({ url, emoji, size = 48, fontSize, style }) {
  const fs = fontSize || Math.round(size * 0.73);
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    ...style,
  };

  if (url) {
    return (
      <div style={{ ...base, overflow: "hidden", background: "#FAF6F0" }}>
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ ...base, background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs }}>
      {emoji}
    </div>
  );
}
