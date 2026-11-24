import { BUTTONS, SIDEBAR, TOP_BAR } from "./buttonDestinations";

/* ------------------------------------------------------------------ *
 *  The single place every button destination is interpreted.
 *
 *  buttonDestinations.js is raw Figma-derived data (untouched). This
 *  module translates its ids into the route keys App.jsx actually uses,
 *  and drops every target the codebase does not have yet — so nothing
 *  here can route the app to a screen that doesn't exist.
 * ------------------------------------------------------------------ */

/** spec page id -> app route key. Only ids that exist in App.jsx MODULES / auth pages. */
export const ROUTE = {
  landing: "landing",
  login: "login",
  forgotPassword: "forgot-password",
  resetPassword: "reset-password",
  dashboard: "dashboard",
  chartOfAccounts: "chart-of-accounts",
  journalEntries: "journal-entries",
  generalLedger: "general-ledger",
  invoices: "invoices-receivables",
  bills: "bills-payables",
  expenses: "expenses",
  bankReconciliation: "bank-reconciliation",
  financialReports: "financial-reports",
  balanceSheet: "financial-reports",
  cashFlow: "financial-reports",
  taxSummaries: "tax-summaries",
  integrations: "integrations",
};

/**
 * spec state id -> the auth page App.jsx already renders.
 * Four of these use a different id in code than in the Figma spec.
 */
export const STATE_PAGE = {
  signingIn: "signing-in",
  signInFailed: "sign-in-failed",
  sendingResetLink: "sending-reset-link",
  resetLinkSent: "check-inbox",
  savingNewPassword: "saving-password",
  passwordResetFailed: "password-reset-failed",
  passwordResetComplete: "password-updated",
  verifyingEmail: "verifying-link",
};

/** Dialogs that exist in the app. newAccount lives inside ChartOfAccounts already. */
export const DIALOGS_BUILT = new Set(["newTransaction"]);

/** Sidebar label -> app route key, derived from the spec so there is only one list. */
export const NAV_PAGE = Object.fromEntries(
  SIDEBAR.map(([label, dest]) => [label, ROUTE[dest.split(":")[1]]]),
);

/**
 * "+ New transaction" choice -> the spec page id that records it.
 * These MUST be spec ids (like resolve() returns), not route keys: goTo()
 * translates them through ROUTE. Feeding it a route key makes ROUTE[...]
 * come back undefined and the click silently no-ops.
 */
export const TRANSACTION_PAGE = {
  invoice: "invoices",
  expense: "expenses",
  journal: "journalEntries",
  bill: "bills",
};

// Fails loudly in dev if a spec id and a route key get mixed up again.
if (import.meta.env.DEV) {
  for (const [type, id] of Object.entries(TRANSACTION_PAGE)) {
    if (!ROUTE[id]) {
      console.error(
        `[navigation] TRANSACTION_PAGE.${type}: "${id}" is not a spec page id — goTo() would no-op.`,
      );
    }
  }
}

/** Dashboard summary card label -> module. The spec suffixes these with " card". */
const CARD_SUFFIX = " card";

/**
 * Labels are compared loosely: the spec and the rendered markup drift (a
 * non-breaking space here, a trailing arrow there), and an exact match would
 * silently fall through to a no-op.
 */
const normalize = (value) =>
  String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s*[→↗]\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/**
 * Where does a button go?
 * resolve("dashboard", "+ New transaction") -> { type: "dialog", to: "newTransaction" }
 * Returns null when the button is not in the spec.
 */
export function resolve(screenId, label) {
  const key = normalize(label);
  const rows = BUTTONS[screenId] ?? [];

  const hit =
    rows.find((row) => normalize(row.label) === key) ??
    rows.find((row) => normalize(row.label) === `${key}${CARD_SUFFIX}`.trim());

  if (hit) return hit;

  // Fall back to the tables shared across every screen.
  const shared = [...SIDEBAR, ...TOP_BAR].find(([l]) => normalize(l) === key);

  if (!shared) return null;

  const [type, to] = shared[1].split(":");
  return { label: shared[0], type, to };
}

/** Dev-only breadcrumb for destinations whose target has not been built yet. */
export function warnUnsupported(dest) {
  if (!import.meta.env.DEV || !dest) return;
  console.warn(
    `[navigation] "${dest.type}:${dest.to ?? ""}" has no target yet — left inert.`,
  );
}
