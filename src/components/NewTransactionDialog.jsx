import { useEffect, useRef } from "react";

/* "New transaction" dialog, from the Figma frame "New transaction" (3034:28119). */

const TRANSACTION_OPTIONS = [
  { type: "invoice", label: "Create an invoice" },
  { type: "expense", label: "Record an expense" },
  { type: "journal", label: "Prepare a journal entry" },
  { type: "bill", label: "Add a supplier bill" },
];

/**
 * Props:
 *  open      show or hide the dialog
 *  onClose   called for the X button, the Esc key, or a click outside
 *  onSelect  called with "invoice" | "expense" | "journal" | "bill"
 */
export default function NewTransactionDialog({ open, onClose, onSelect }) {
  const dialogRef = useRef(null);
  const firstRef = useRef(null);
  const closeRef = useRef(onClose);

  // Keeps the Esc listener reading the latest onClose without re-binding it.
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    firstRef.current?.focus();

    function onKey(e) {
      if (e.key === "Escape") closeRef.current?.();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  // keep Tab inside the dialog
  function trapTab(e) {
    if (e.key !== "Tab") return;
    const items = dialogRef.current?.querySelectorAll("button");
    if (!items?.length) return;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#021820]/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-transaction-title"
        aria-describedby="new-transaction-desc"
        onKeyDown={trapTab}
        className="flex w-full max-w-[640px] flex-col gap-6 rounded-2xl bg-white p-8 font-['Inter',system-ui,sans-serif]"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="new-transaction-title"
            className="text-[19px] font-bold leading-7 text-[#021820]"
          >
            What would you like to record?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-5 w-5 items-center justify-center text-[#637a8a] hover:text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p id="new-transaction-desc" className="text-sm leading-[22px] text-[#637a8a]">
          Choose a transaction to continue.
        </p>

        {TRANSACTION_OPTIONS.map((o, i) => (
          <button
            key={o.type}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            onClick={() => onSelect?.(o.type)}
            className="box-border flex h-11 w-full items-center justify-center rounded-lg border border-[#dce5ea] bg-white p-3 text-[13px] font-bold leading-5 text-[#02355d] hover:bg-[#e9f4f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
