import { useEffect } from "react";

const OPTIONS = [
  { label: "Create new invoice", destination: "Invoices & Receivables" },
  { label: "Record an expense", destination: "Expenses" },
  { label: "Prepare a journal entry", destination: "Journal Entries" },
  { label: "Add a supplier bill", destination: "Bills & Payables" },
];

export default function NewTransactionModal({ open, onClose, onNavigate }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (destination) => {
    onClose?.();
    onNavigate?.(destination);
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#021820]/45 p-4 backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-transaction-title"
        className="w-full max-w-[560px] rounded-2xl border border-[#dce5ea] bg-white p-8 shadow-[0_24px_60px_rgba(2,24,32,0.28)] sm:p-10"
      >
        <h2
          id="new-transaction-title"
          className="text-[24px] font-bold leading-8 text-[#021820]"
        >
          What would you like to record?
        </h2>
        <p className="mt-2 text-[15px] leading-5 text-[#637a8a]">
          Choose a transaction to continue
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(option.destination)}
              className="flex w-full items-center justify-center rounded-xl border border-[#dce5ea] bg-white px-4 py-4 text-center text-[15px] font-bold leading-5 text-[#02355d] transition-colors hover:border-[#0693c7] hover:bg-[#f1f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
