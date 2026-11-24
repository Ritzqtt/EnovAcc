/* ------------------------------------------------------------------ *
 *  EnovAcc: every button and where it goes.
 *
 *  Source: the prototype links in your Figma file (Accountant flow,
 *  plus the Manager / Admin screens). Rows marked `inferred: true`
 *  have no link in Figma; I filled them in from the screen names.
 *
 *  Destination format:
 *    "page:<id>"    a full screen          (see PAGES)
 *    "dialog:<id>"  a pop-up over a screen (see DIALOGS)
 *    "state:<id>"   a loading / success / error message (see STATES)
 *    "close"        close the current dialog
 *    "filter"       changes the table in place (no new screen)
 * ------------------------------------------------------------------ */

/** Full screens. `built: true` means the code already exists in your project. */
export const PAGES = {
  landing: { figma: "Landing page", built: true },
  login: { figma: "Login", built: true },
  createAccount: { figma: "Create account" },
  verifyEmail: { figma: "Verify email" },
  forgotPassword: { figma: "Forgot password" },
  resetPassword: { figma: "Reset password" },
  dashboard: { figma: "Dashboard", built: true },
  managerDashboard: { figma: "Manager dashboard" },
  adminDashboard: { figma: "Admin dashboard" },
  chartOfAccounts: { figma: "Chart of accounts", built: true },
  journalEntries: { figma: "Journal entries", built: true },
  generalLedger: { figma: "General ledger", built: true },
  invoices: { figma: "Invoices & receivables", built: true },
  bills: { figma: "Bills & payables", built: true },
  expenses: { figma: "Expenses", built: true },
  bankReconciliation: { figma: "Bank reconciliation", built: true },
  financialReports: { figma: "Financial reports", built: true }, // Income statement tab
  balanceSheet: { figma: "Balance sheet", built: true }, // tab of Financial reports
  cashFlow: { figma: "Cash flow", built: true }, // tab of Financial reports
  taxSummaries: { figma: "Tax summaries", built: true },
  integrations: { figma: "Integrations", built: true },
  usersRoles: { figma: "Users & roles" },
  auditTrail: { figma: "Audit trail" },
  profile: { figma: "My profile / Account and security" },
};

/** Pop-ups that open over a screen. */
export const DIALOGS = {
  newTransaction: { figma: "New transaction", built: true },
  newInvoice: { figma: "New invoice" },
  newExpense: { figma: "New expense" },
  newJournal: { figma: "New journal" },
  newBill: { figma: "New bill" },
  newAccount: { figma: "New account" },
  newUser: { figma: "New user" },
  invoiceDetail: { figma: "Invoice detail" },
  invoiceApproval: { figma: "Invoice approval" },
  recordPayment: { figma: "Record payment" },
  paymentReview: { figma: "Payment review" },
  journalReview: { figma: "Journal review" },
  rejectJournal: { figma: "Reject journal" },
  journalDetail: { figma: "Journal detail / Detail JE-xxxx" },
  payBill: { figma: "Pay supplier" },
  matchTransaction: { figma: "Match transaction" },
  importBank: { figma: "Import bank" },
  importPayroll: { figma: "Import payroll" },
  taxSettings: { figma: "Tax settings" },
  notificationsPanel: { figma: "Notifications Panel" },
  periodMenu: { figma: "Period Menu" },
  filterMenu: { figma: "Filter menu" },
  searchResults: { figma: "Search results" },
};

/** Loading, success and error messages. */
export const STATES = {
  signingIn: { figma: "Signing in" },
  signInFailed: { figma: "Sign in failed" },
  sendingResetLink: { figma: "Sending reset link" },
  resetLinkSent: { figma: "Reset link sent" },
  savingNewPassword: { figma: "Saving new password" },
  passwordResetFailed: { figma: "Password reset failed" },
  passwordResetComplete: { figma: "Password reset complete" },
  verifyingEmail: { figma: "Verifying email" },
  verificationFailed: { figma: "Verification failed" },
  codeResent: { figma: "Code resent" },
  accountVerified: { figma: "Account verified" },
  accountCreationFailed: { figma: "Account creation failed" },
  savingProfile: { figma: "Saving profile" },
  profileUpdated: { figma: "Profile updated" },
  updatingPassword: { figma: "Updating password" },
  passwordChanged: { figma: "Password changed" },
  passwordChangeFailed: { figma: "Password change failed" },
  exportReady: { figma: "Export ready" },
  invoiceSubmitted: { figma: "Invoice submitted" },
  invoiceCreated: { figma: "Invoice created" },
  invoiceApproved: { figma: "Invoice approved" },
  invoicePosted: { figma: "Invoice posted" },
  paymentRecorded: { figma: "Payment recorded" },
  billSubmitted: { figma: "Bill submitted" },
  supplierPaymentSubmitted: { figma: "Supplier payment submitted" },
  expenseSubmitted: { figma: "Expense submitted" },
  journalSubmitted: { figma: "Journal submitted" },
  journalPosted: { figma: "Journal posted" },
  journalRejected: { figma: "Journal rejected" },
  accountSaved: { figma: "Account saved" },
  bankImported: { figma: "Bank imported" },
  bankMatched: { figma: "Bank matched" },
  payrollImported: { figma: "Payroll imported" },
  settingsSaved: { figma: "Settings saved" },
  userCreated: { figma: "User created" },
};

/* ------------------------------------------------------------------ */
/*  Buttons that appear on every signed-in screen                       */
/* ------------------------------------------------------------------ */

export const SIDEBAR = [
  ["Dashboard", "page:dashboard"],
  ["Chart of accounts", "page:chartOfAccounts"],
  ["Journal entries", "page:journalEntries"],
  ["General ledger", "page:generalLedger"],
  ["Invoices & receivables", "page:invoices"],
  ["Bills & payables", "page:bills"],
  ["Expenses", "page:expenses"],
  ["Bank reconciliation", "page:bankReconciliation"],
  ["Financial reports", "page:financialReports"],
  ["Tax summaries", "page:taxSummaries"],
  ["Integrations", "page:integrations"],
];

export const TOP_BAR = [
  ["Notifications (bell)", "dialog:notificationsPanel"],
  ["Avatar / user name", "page:profile"],
  ["Logout", "page:login"],
];

/* ------------------------------------------------------------------ */
/*  Buttons on each screen: [label, destination, extra?]                */
/* ------------------------------------------------------------------ */

const RAW = {
  /* ---------- Sign in and account ---------- */
  login: [
    ["← Back to landing page", "page:landing"],
    ["Sign in to EnovAcc →", "state:signingIn", { note: "then dashboard on success, signInFailed on error" }],
    ["Accountant", "page:dashboard"],
    ["Manager", "page:managerDashboard"],
    ["Admin", "page:adminDashboard"],
    ["Create an account", "page:createAccount"],
    ["Forgot password?", "page:forgotPassword"],
  ],
  signInFailed: [
    ["Try again", "page:login"],
    ["Forgot password?", "page:forgotPassword"],
  ],
  createAccount: [
    ["Create account →", "state:verifyingEmail", { note: "Figma loops back to Create account; the next step is verify email" }],
    ["Already registered? Sign in", "page:login"],
  ],
  accountCreationFailed: [
    ["Try again", "page:createAccount"],
    ["Reset password", "page:forgotPassword"],
  ],
  verifyEmail: [
    ["Verify & continue →", "state:verifyingEmail"],
    ["Resend verification code", "state:verifyingEmail"],
    ["Use a different email", "page:createAccount"],
  ],
  verificationFailed: [
    ["Try again", "page:verifyEmail"],
    ["Send a new code", "state:codeResent"],
  ],
  codeResent: [["Enter new verification code", "page:verifyEmail"]],
  accountVerified: [["Continue to sign in →", "page:login"]],
  forgotPassword: [
    ["Send reset link →", "state:sendingResetLink"],
    ["Back to sign in", "page:login"],
  ],
  resetLinkSent: [
    ["Open reset link →", "page:resetPassword"],
    ["Resend link", "state:sendingResetLink"],
    ["Back to sign in", "page:login"],
  ],
  resetPassword: [["Save new password →", "state:savingNewPassword"]],
  passwordResetFailed: [
    ["Try again", "page:resetPassword"],
    ["Request a new reset link", "page:forgotPassword"],
  ],
  passwordResetComplete: [["Back to sign in →", "page:login"]],
  profile: [
    ["Save profile changes", "state:savingProfile"],
    ["Update password", "state:updatingPassword"],
  ],
  profileUpdated: [["Return to profile", "close"]],
  passwordChanged: [["Return to profile", "close"]],
  passwordChangeFailed: [["Try again", "close"]],

  /* ---------- Dashboards ---------- */
  dashboard: [
    ["+ New transaction", "dialog:newTransaction"],
    ["NET INCOME card", "page:financialReports"],
    ["RECEIVABLES card", "page:invoices"],
    ["PAYABLES card", "page:bills"],
    ["AWAITING APPROVAL card", "page:journalEntries"],
    ["Review transaction →", "dialog:journalReview"],
  ],
  managerDashboard: [
    ["+ New transaction", "dialog:newTransaction"],
    ["Month picker (October 2026 ▾)", "dialog:periodMenu"],
    ["NET INCOME card", "page:financialReports"],
    ["RECEIVABLES card", "page:invoices"],
    ["PAYABLES card", "page:bills"],
    ["AWAITING APPROVAL card", "page:journalEntries"],
    ["Review transaction →", "dialog:journalReview"],
    ["Audit trail (sidebar)", "page:auditTrail"],
  ],
  adminDashboard: [
    ["Month picker (October 2026 ▾)", "dialog:periodMenu"],
    ["Users & roles (sidebar)", "page:usersRoles"],
    ["Audit trail (sidebar)", "page:auditTrail"],
    ["NET INCOME card", "page:financialReports"],
    ["RECEIVABLES card", "page:invoices"],
    ["PAYABLES card", "page:bills"],
    ["AWAITING APPROVAL card", "page:journalEntries"],
    ["Review transaction →", "dialog:journalReview"],
  ],
  usersRoles: [["+ Invite user", "dialog:newUser"]],
  userCreated: [["View workspace members", "page:usersRoles"]],
  newUser: [
    ["Create user", "state:userCreated"],
    ["Cancel", "close"],
  ],

  /* ---------- New transaction chooser ---------- */
  newTransaction: [
    ["Create an invoice", "dialog:newInvoice"],
    ["Record an expense", "dialog:newExpense"],
    ["Prepare a journal entry", "dialog:newJournal"],
    ["Add a supplier bill", "dialog:newBill"],
    ["X (close)", "close"],
  ],

  /* ---------- Chart of accounts ---------- */
  chartOfAccounts: [
    ["+ New account", "dialog:newAccount"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
    ["View ledger →", "page:generalLedger", { inferred: true }],
  ],
  newAccount: [
    ["Save account", "state:accountSaved"],
    ["Cancel", "close"],
  ],
  accountSaved: [["View account directory", "page:chartOfAccounts"]],

  /* ---------- Journal entries ---------- */
  journalEntries: [
    ["+ New journal", "dialog:newJournal"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
    ["Review & approve →", "dialog:journalReview", { inferred: true }],
    ["View entry →", "dialog:journalDetail", { inferred: true }],
  ],
  newJournal: [
    ["Submit for approval", "state:journalSubmitted"],
    ["Cancel", "close"],
  ],
  journalSubmitted: [["View journal register", "page:journalEntries"]],
  journalReview: [
    ["Approve & post", "state:journalPosted"],
    ["Reject", "dialog:rejectJournal"],
    ["Cancel", "close"],
  ],
  rejectJournal: [
    ["Reject entry", "state:journalRejected"],
    ["Cancel", "close"],
  ],
  journalRejected: [["Back to journal", "page:journalEntries"]],
  journalDetail: [["View general ledger", "page:generalLedger"]],

  /* ---------- General ledger ---------- */
  generalLedger: [
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
  ],

  /* ---------- Invoices & receivables ---------- */
  invoices: [
    ["+ Create invoice", "dialog:newInvoice"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:invoicePosted", { note: "Figma opens the 'Invoice posted' screen from this button" }],
    ["View invoice →", "dialog:invoiceDetail"],
    ["Record payment →", "dialog:recordPayment", { inferred: true }],
  ],
  newInvoice: [
    ["Create & submit", "state:invoiceSubmitted"],
    ["Cancel", "close"],
  ],
  invoiceSubmitted: [["View invoice register", "state:invoiceCreated"]],
  invoiceDetail: [["Record payment", "dialog:recordPayment"]],
  invoiceApproval: [
    ["Approve invoice", "state:invoiceApproved"],
    ["Cancel", "close"],
  ],
  invoiceApproved: [["Return to invoices", "state:invoicePosted"]],
  recordPayment: [
    ["Submit payment", "dialog:paymentReview"],
    ["Cancel", "close"],
  ],
  paymentReview: [
    ["Approve & post", "state:paymentRecorded"],
    ["Cancel", "close"],
  ],

  /* ---------- Bills & payables ---------- */
  bills: [
    ["+ New supplier bill", "dialog:newBill"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
    ["Pay bill →", "dialog:payBill", { inferred: true }],
  ],
  newBill: [
    ["Create supplier bill", "state:billSubmitted"],
    ["Cancel", "close"],
  ],
  billSubmitted: [["View payables", "page:bills"]],
  payBill: [
    ["Submit payment", "state:supplierPaymentSubmitted"],
    ["Cancel", "close"],
  ],
  supplierPaymentSubmitted: [["View payables", "page:bills"]],

  /* ---------- Expenses ---------- */
  expenses: [
    ["+ Record expense", "dialog:newExpense"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
    ["Review expense →", "dialog:journalReview", { inferred: true }],
    ["View entry →", "dialog:journalDetail", { inferred: true }],
  ],
  newExpense: [
    ["Submit expense", "state:expenseSubmitted"],
    ["Cancel", "close"],
  ],
  expenseSubmitted: [["View expenses", "page:expenses"]],

  /* ---------- Bank reconciliation ---------- */
  bankReconciliation: [
    ["Import statement", "dialog:importBank"],
    ["All records ▾ (filter)", "filter"],
    ["Export", "state:exportReady"],
    ["Find match →", "dialog:matchTransaction", { inferred: true }],
    ["Create entry →", "dialog:newJournal", { inferred: true }],
    ["View entry →", "dialog:journalDetail", { inferred: true }],
  ],
  importBank: [
    ["Import 1 movement", "state:bankImported"],
    ["Cancel", "close"],
  ],
  bankImported: [["Open reconciliation", "page:bankReconciliation"]],
  matchTransaction: [
    ["Confirm match", "state:bankMatched"],
    ["Cancel", "close"],
  ],

  /* ---------- Financial reports ---------- */
  financialReports: [
    ["Income statement (tab)", "page:financialReports"],
    ["Balance sheet (tab)", "page:balanceSheet"],
    ["Cash flow (tab)", "page:cashFlow"],
    ["Export report", "state:exportReady"],
  ],
  exportReady: [["Return to overview", "page:dashboard"]],

  /* ---------- Tax summaries ---------- */
  taxSummaries: [["Review settings", "dialog:taxSettings"]],
  taxSettings: [
    ["Save settings", "state:settingsSaved"],
    ["Cancel", "close"],
  ],
  settingsSaved: [["Back to tax summaries", "page:taxSummaries"]],

  /* ---------- Integrations ---------- */
  integrations: [
    ["Preview payroll import", "dialog:importPayroll"],
    ["Export ledger data", "state:exportReady"],
  ],
  importPayroll: [
    ["Import for approval", "state:payrollImported"],
    ["Cancel", "close"],
  ],
  payrollImported: [["Review journal entries", "page:journalEntries"]],

  /* ---------- Menus and panels ---------- */
  notificationsPanel: [
    ["Approval needed — JE-0391", "page:journalEntries"],
    ["Payment received", "page:bills", { note: "as drawn in Figma" }],
    ["Invoices overdue", "page:invoices"],
    ["VAT filing reminder", "page:taxSummaries"],
  ],
  filterMenu: [
    ["Pending approvals", "page:journalEntries"],
    ["Posted ledger entries", "page:generalLedger"],
    ["Outstanding invoices", "page:invoices"],
  ],
  searchResults: [
    ["INV-0001 · Meridian Health", "dialog:invoiceDetail"],
    ["JE-0003 · Customer payment", "dialog:journalDetail"],
  ],
};

/* ------------------------------------------------------------------ */
/*  Normalized version + helpers                                        */
/* ------------------------------------------------------------------ */

function parse(dest) {
  if (dest === "close" || dest === "filter") return { type: dest, to: null };
  const [type, to] = dest.split(":");
  return { type, to };
}

/** BUTTONS[screenId] -> [{ label, type, to, inferred?, note? }] */
export const BUTTONS = Object.fromEntries(
  Object.entries(RAW).map(([screen, rows]) => [
    screen,
    rows.map(([label, dest, extra]) => ({ label, ...parse(dest), ...extra })),
  ])
);

/** Where does a button go?  getDestination("dashboard", "+ New transaction") */
export function getDestination(screenId, label) {
  const own = BUTTONS[screenId]?.find((b) => b.label === label);
  if (own) return own;
  const shared = [...SIDEBAR, ...TOP_BAR].find(([l]) => l === label);
  return shared ? { label, ...parse(shared[1]) } : null;
}

/** Sidebar label -> page id, handy for the sidebar's onNavigate(label). */
export const SIDEBAR_TO_PAGE = Object.fromEntries(
  SIDEBAR.map(([label, dest]) => [label, parse(dest).to])
);
