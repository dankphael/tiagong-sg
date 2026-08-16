'use client';

import { useEffect, useRef, useId } from "react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Shared accessible-modal behavior for every modal in the app: Escape
// closes, background scroll locks, focus moves into the modal on open and
// returns to whatever triggered it on close, and Tab is trapped inside the
// modal's own focusable elements. Returns a ref for the modal's content
// container (needs role="dialog" aria-modal="true" aria-labelledby={titleId}
// tabIndex={-1}) and an id to put on the title element.
export function useModalA11y(onClose, { active = true } = {}) {
  const containerRef = useRef(null);
  const titleId = useId();
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocusedRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const container = containerRef.current;
    const initialFocusable = container?.querySelectorAll(FOCUSABLE_SELECTOR);
    (initialFocusable?.[0] || container)?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !container) return;
      const items = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [active, onClose]);

  return { containerRef, titleId };
}
