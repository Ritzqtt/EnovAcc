import ModulePage from "../components/ModulePage";
import MetricCards from "../components/MetricCards";
import DataTable from "../components/DataTable";
import PanelGroup from "../components/Panel";

const METRICS = [
  [
    "Ledger bank balance",
    "₱122,000.00",
    "Operating account · PHP"
  ],
  [
    "Matched movements",
    "01 / 03",
    "One movement linked to the ledger"
  ],
  [
    "Unmatched movements",
    "− ₱8,150.00",
    "2 items need attention"
  ]
];

const COLUMNS = [
  [
    "DATE",
    120,
    "code"
  ],
  [
    "BANK DESCRIPTION",
    425,
    ""
  ],
  [
    "AMOUNT",
    145,
    ""
  ],
  [
    "JOURNAL",
    145,
    ""
  ],
  [
    "STATUS",
    140,
    "badge"
  ],
  [
    "ACTION",
    150,
    "link"
  ]
];

const ROWS = [
  [
    "06 Oct 2026",
    "Meridian transfer",
    "+ ₱30,000.00",
    "JE-0003",
    "Matched",
    "View entry →",
    1
  ],
  [
    "07 Oct 2026",
    "Cloud infrastructure",
    "− ₱8,000.00",
    "—",
    "Unmatched",
    "Find match →",
    0
  ],
  [
    "10 Oct 2026",
    "Bank service charge",
    "− ₱150.00",
    "—",
    "Unmatched",
    "Create entry →",
    0
  ],
  [
    "04 Oct 2026",
    "Payroll debit",
    "+ ₱30,000.00",
    "JE-0003",
    "Matched",
    "View entry →",
    1
  ],
  [
    "05 Oct 2026",
    "Consulting receipt",
    "− ₱8,000.00",
    "—",
    "Unmatched",
    "Find match →",
    0
  ],
  [
    "06 Oct 2026",
    "Utilities payment",
    "− ₱150.00",
    "—",
    "Unmatched",
    "Create entry →",
    0
  ],
  [
    "07 Oct 2026",
    "Card settlement",
    "+ ₱30,000.00",
    "JE-0003",
    "Matched",
    "View entry →",
    1
  ],
  [
    "08 Oct 2026",
    "Interest credit",
    "− ₱8,000.00",
    "—",
    "Unmatched",
    "Find match →",
    0
  ],
  [
    "09 Oct 2026",
    "Customer transfer",
    "− ₱150.00",
    "—",
    "Unmatched",
    "Create entry →",
    0
  ],
  [
    "10 Oct 2026",
    "Supplier payment",
    "+ ₱30,000.00",
    "JE-0003",
    "Matched",
    "View entry →",
    1
  ],
  [
    "11 Oct 2026",
    "Bank service fee",
    "− ₱8,000.00",
    "—",
    "Unmatched",
    "Find match →",
    0
  ],
  [
    "12 Oct 2026",
    "Payroll debit",
    "− ₱150.00",
    "—",
    "Unmatched",
    "Create entry →",
    0
  ]
];

const PANELS = [
  {
    "type": "notice",
    "title": "Two movements need your attention.",
    "text": "Match the cloud payment to JE-0004, then record the bank service charge before completing review."
  }
];

export default function BankReconciliation(props) {
  return (
    <ModulePage
      active="Bank reconciliation"
      title="Bring your books and bank together."
      description="Compare cash movements, resolve differences, and complete your review."
      actionLabel="Import statement"
      {...props}
    >
      <MetricCards items={METRICS} />
      <DataTable
        title={"Statement movements"}
        filterBy={"Status"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"Bank reconciliation"}
      />
      <PanelGroup panels={PANELS} />
    </ModulePage>
  );
}
