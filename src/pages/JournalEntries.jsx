import ModulePage from "../components/ModulePage";
import MetricCards from "../components/MetricCards";
import DataTable from "../components/DataTable";

const METRICS = [
  [
    "Posted entries",
    "09",
    "Included in financial reports"
  ],
  [
    "Awaiting review",
    "03",
    "₱2,400.00 to approve"
  ],
  [
    "Ledger integrity",
    "Balanced",
    "Total debits equal total credits"
  ]
];

const COLUMNS = [
  [
    "REFERENCE",
    140,
    "code"
  ],
  [
    "DESCRIPTION",
    480,
    ""
  ],
  [
    "DATE",
    180,
    ""
  ],
  [
    "DEBIT",
    190,
    ""
  ],
  [
    "CREDIT",
    190,
    ""
  ],
  [
    "STATUS",
    180,
    "badge"
  ],
  [
    "ACTION",
    220,
    "link"
  ]
];

const ROWS = [
  [
    "JE-0006",
    "Development tools subscription",
    "12 Oct 2026",
    "₱2,400.00",
    "₱2,400.00",
    "Pending",
    "Review & approve →",
    1
  ],
  [
    "JE-0005",
    "Office services · ClearSpace",
    "09 Oct 2026",
    "₱6,000.00",
    "₱6,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0004",
    "Cloud infrastructure",
    "07 Oct 2026",
    "₱8,000.00",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0003",
    "Customer payment · Meridian",
    "06 Oct 2026",
    "₱30,000.00",
    "₱30,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0002",
    "October subscription · Meridian",
    "02 Oct 2026",
    "₱50,000.00",
    "₱50,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0106",
    "Equipment purchase",
    "06 Oct 2026",
    "₱2,400.00",
    "₱2,400.00",
    "Pending",
    "Review & approve →",
    1
  ],
  [
    "JE-0107",
    "Bank service fee",
    "07 Oct 2026",
    "₱6,000.00",
    "₱6,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0108",
    "Insurance premium",
    "08 Oct 2026",
    "₱8,000.00",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0109",
    "Office supplies purchase",
    "09 Oct 2026",
    "₱30,000.00",
    "₱30,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0110",
    "Consulting invoice",
    "10 Oct 2026",
    "₱50,000.00",
    "₱50,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "JE-0111",
    "Monthly internet expense",
    "11 Oct 2026",
    "₱2,400.00",
    "₱2,400.00",
    "Pending",
    "Review & approve →",
    1
  ],
  [
    "JE-0112",
    "Customer collection",
    "12 Oct 2026",
    "₱6,000.00",
    "₱6,000.00",
    "Posted",
    "View entry →",
    0
  ]
];

export default function JournalEntries(props) {
  return (
    <ModulePage
      active="Journal entries"
      title="Every entry, accounted for."
      description="Prepare, review, and post with a clear approval trail."
      actionLabel="+ New journal"
      {...props}
    >
      <MetricCards items={METRICS} />
      <DataTable
        title={"Journal register"}
        filterBy={"Status"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"Journal entries"}
      />
    </ModulePage>
  );
}
