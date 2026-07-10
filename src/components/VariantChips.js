'use client';

const VARIANT_LABELS = {
  spelling: "Alternative spelling",
  romanisation: "Alternative romanisation",
  definition: "Alternative meaning",
  usage_context: "Usage note",
  usage_example: "Example",
  new_word: "Community submission",
};

function variantValue(v) {
  if (v.variant_type === "usage_example") return v.payload?.exampleText;
  if (v.variant_type === "new_word") return v.payload?.english;
  return v.payload?.proposedValue;
}

// Renders the "Attested variants" section on a dictionary card — accepted
// community corrections/examples that coexist with the original entry
// rather than replacing it, each credited to its contributor.
export default function VariantChips({ variants }) {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #F0E8DA" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B7355", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        Attested Variants
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {variants.map(v => (
          <div key={v.id} style={{ fontSize: 12, color: "#1A1208" }}>
            <span style={{ fontWeight: 600, color: "#1A6B3C" }}>{VARIANT_LABELS[v.variant_type] || v.variant_type}:</span>{" "}
            {variantValue(v)}
            {v.context_note && <span style={{ color: "#8B7355", fontStyle: "italic" }}> — "{v.context_note}"</span>}
            {v.contributor_name && <div style={{ fontSize: 11, color: "#9B8B75" }}>Contributed by {v.contributor_name}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
