'use client';

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
        <select value={form.region || ""} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="input" style={{ height: 44 }}>
          <option value="">— Not specified</option>
          {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
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

      <Field label="My bio / dialect story">
        <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 500) }))} className="input"
          placeholder="Share a bit about your dialect journey or what you're hoping to find here..."
          style={{ minHeight: 90, resize: "vertical", fontFamily: "inherit", padding: 12 }} />
        <div style={{ fontSize: 11, color: "#9B8B75", marginTop: 4, textAlign: "right" }}>{(form.bio || "").length}/500</div>
      </Field>
    </div>
  );
}
