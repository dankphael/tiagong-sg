'use client';

import { useState } from "react";
import { Flag as FlagIcon } from "lucide-react";
import ContributionModal from "@/components/ContributionModal";

// Small flag icon that opens the error_flag ContributionModal for a learn-page
// card. `card` can be dictionary-backed (has wordId) or static (no wordId,
// carries staticSource) — ContributionModal snapshots static content into the
// payload since there's no DB row to attach a correction to.
export default function ReportButton({ dialectId, card, gameMode, category, staticSource, style }) {
  const [open, setOpen] = useState(false);
  if (!card) return null;

  const word = {
    wordId: card.wordId || null,
    dialect: dialectId,
    phrase: card.phrase,
    chinese: card.chinese,
    meaning: card.meaning,
    romanisation: card.romanisation,
    gameMode,
    category,
    staticSource: card.staticSource || staticSource,
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label="Report an issue with this entry"
        title="Report an issue"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
          color: "inherit", cursor: "pointer", ...style,
        }}
      >
        <FlagIcon size={14} />
      </button>
      {open && <ContributionModal word={word} type="error_flag" onClose={() => setOpen(false)} />}
    </>
  );
}
