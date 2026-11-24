import ModulePage from "../components/ModulePage";
import MetricCards from "../components/MetricCards";
import DataTable from "../components/DataTable";

const METRICS = [
  [
    "Posted cash expenses",
    "₱8,000.00",
    "Cloud infrastructure"
  ],
  [
    "Awaiting approval",
    "₱2,400.00",
    "Development tools"
  ],
  [
    "Approved supplier costs",
    "₱6,000.00",
    "Recorded through payables"
  ]
];

const COLUMNS = [
  [
    "REFERENCE",
    120,
    "code"
  ],
  [
    "PAYEE / DESCRIPTION",
    439,
    ""
  ],
  [
    "DATE",
    120,
    ""
  ],
  [
    "AMOUNT",
    140,
    ""
  ],
  [
    "STATUS",
    140,
    "badge"
  ],
  [
    "ACTION",
    170,
    "link"
  ]
];

const ROWS = [
  [
    "EXP-0002",
    "DevTools · Development subscription",
    "12 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0001",
    "Cloud hosting · Infrastructure",
    "07 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "EXP-0103",
    "Local transport",
    "03 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0104",
    "Internet reimbursement",
    "04 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "EXP-0105",
    "Software subscription",
    "05 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0106",
    "Equipment maintenance",
    "06 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "EXP-0107",
    "Courier services",
    "07 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0108",
    "Team training",
    "08 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "EXP-0109",
    "Client meeting",
    "09 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0110",
    "Office supplies",
    "10 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ],
  [
    "EXP-0111",
    "Local transport",
    "11 Oct 2026",
    "₱2,400.00",
    "Pending",
    "Review expense →",
    1
  ],
  [
    "EXP-0112",
    "Internet reimbursement",
    "12 Oct 2026",
    "₱8,000.00",
    "Posted",
    "View entry →",
    0
  ]
];

export default function Expenses(props) {
  return (
    <ModulePage
      active="Expenses"
      title="Keep every expense in view."
      description="Capture operating costs and keep the approval trail intact."
      actionLabel="+ Record expense"
      {...props}
    >
      <MetricCards items={METRICS} />
      <DataTable
        title={"Expense register"}
        filterBy={"Status"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"Expenses"}
      />
    </ModulePage>
  );
}
