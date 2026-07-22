'use client';

import { useState, useRef, useEffect } from "react";
import { INTENTS, AVAILABILITY_SLOTS, FORMATS, REGIONS, PROFICIENCY_LEVELS } from "@/lib/matching";
import { interestTags, huayKuan } from "@/data/staticData";

function PillGroup({ options, selected, onToggle, multi, labelKey = "label", emojiKey }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const checked = multi ? (selected || []).includes(opt.id) : selected === opt.id;
        return (
          <button key={opt.id} type="button" onClick={() => onToggle(opt.id, checked)}
            style={{ padding: "8px 16px", borderRadius: 20, border: "2px solid " + (checked ? "#C0392B" : "#E8DDD0"), background: checked ? "#FDF0EF" : "white", color: checked ? "#C0392B" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
            {emojiKey && opt[emojiKey] ? opt[emojiKey] + " " : (checked ? "✓ " : "")}{opt[labelKey]}
          </button>
        );
      })}
    </div>
  );
}

// Type-to-filter combobox for option lists too long for a plain <select> or
// a row of pills (e.g. Singapore's ~27 towns). Filters case-insensitively as
// you type; click or Enter selects; Escape/blur closes without changing value.
function SearchableSelect({ value, onChange, options, placeholder = "— Not specified" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  const selected = options.find(o => o.id === value);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function pick(opt) {
    onChange(opt ? opt.id : "");
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        className="input"
        style={{ height: 44 }}
        value={open ? query : (selected?.label || "")}
        placeholder={selected ? selected.label : placeholder}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Enter" && filtered.length > 0) { e.preventDefault(); pick(filtered[0]); }
          if (e.key === "Escape") { setOpen(false); setQuery(""); }
        }}
      />
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, maxHeight: 220, overflowY: "auto", background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))" }}>
          <button type="button" onClick={() => pick(null)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "#9B8B75" }}>
            {placeholder}
          </button>
          {filtered.length === 0 && (
            <div style={{ padding: "9px 14px", fontSize: 13, color: "#9B8B75" }}>No matches</div>
          )}
          {filtered.map(opt => (
            <button key={opt.id} type="button" onClick={() => pick(opt)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", background: opt.id === value ? "#FDF0EF" : "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: opt.id === value ? "#C0392B" : "#1A1208", fontWeight: opt.id === value ? 600 : 400 }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, color: "#6B5B45", fontWeight: 600, marginBottom: 10 }}>{label}</label>
      {children}
    </div>
  );
}

// Shared matchmaking-preference fields used in both the edit-profile and
// complete-profile (post-signup) forms so the two flows never drift apart.
export default function MatchPreferencesFields({ form, setForm }) {
  const isMentorish = form.role === "mentor" || form.role === "both";
  const isMenteeish = form.role === "mentee" || form.role === "both";

  function toggleMulti(key, id, checked) {
    setForm(f => ({
      ...f,
      [key]: checked ? (f[key] || []).filter(x => x !== id) : [...(f[key] || []), id],
    }));
  }

  return (
    <div>
      {isMenteeish && (
        <Field label="What I'm looking for">
          <PillGroup options={INTENTS} selected={form.intent} onToggle={id => setForm(f => ({ ...f, intent: f.intent === id ? "" : id }))} />
        </Field>
      )}

      {isMentorish && (
        <Field label="What I can offer as a mentor">
          <PillGroup options={INTENTS} selected={form.offerings} multi onToggle={(id, checked) => toggleMulti("offerings", id, checked)} />
        </Field>
      )}

      <Field label="My proficiency level">
        <select value={form.proficiency || ""} onChange={e => setForm(f => ({ ...f, proficiency: e.target.value }))} className="input" style={{ height: 44 }}>
          <option value="">— Not specified</option>
          {PROFICIENCY_LEVELS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </Field>

      <Field label="When I'm usually free">
        <PillGroup options={AVAILABILITY_SLOTS} selected={form.availability} multi onToggle={(id, checked) => toggleMulti("availability", id, checked)} />
      </Field>

      <Field label="How I'd like to connect">
        <PillGroup options={FORMATS} selected={form.formats} multi onToggle={(id, checked) => toggleMulti("formats", id, checked)} />
      </Field>

      <Field label="My region in Singapore">
        <SearchableSelect value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))} options={REGIONS} />
      </Field>

      <Field label="My interests">
        <PillGroup options={interestTags} selected={form.interests} multi emojiKey="emoji" onToggle={(id, checked) => toggleMulti("interests", id, checked)} />
      </Field>

      {isMentorish && (
        <Field label="My huay kuan (clan association)">
          <select value={form.huayKuan || ""} onChange={e => setForm(f => ({ ...f, huayKuan: e.target.value }))} className="input" style={{ height: 44 }}>
            <option value="">— Not affiliated</option>
            {huayKuan.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </Field>
      )}

      <Field label="My Dialect Journey">
        <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 500) }))} className="input"
          placeholder="Share a bit about your dialect journey or what you're hoping to find here..."
          style={{ minHeight: 90, resize: "vertical", fontFamily: "inherit", padding: 12 }} />
        <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 4, textAlign: "right" }}>{(form.bio || "").length}/500</div>
      </Field>
    </div>
  );
}
