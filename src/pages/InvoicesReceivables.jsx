import ModulePage from "../components/ModulePage";
import MetricCards from "../components/MetricCards";
import DataTable from "../components/DataTable";
import PanelGroup from "../components/Panel";

const METRICS = [
  [
    "Total invoiced",
    "₱50,000.00",
    "October subscription revenue"
  ],
  [
    "Collected",
    "₱30,000.00",
    "60% of posted invoices"
  ],
  [
    "Outstanding",
    "₱20,000.00",
    "Next due: 20 October"
  ]
];

const COLUMNS = [
  [
    "INVOICE",
    120,
    "ref"
  ],
  [
    "CUSTOMER / DESCRIPTION",
    432,
    ""
  ],
  [
    "DUE DATE",
    125,
    ""
  ],
  [
    "TOTAL",
    140,
    ""
  ],
  [
    "OUTSTANDING",
    140,
    ""
  ],
  [
    "ACTION",
    170,
    "link"
  ]
];

const ROWS = [
  [
    "INV-0001",
    "Meridian Health · Subscription",
    "20 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0102",
    "Cedar Works",
    "02 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0103",
    "BluePeak Studio",
    "03 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0104",
    "Meridian Health",
    "04 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0105",
    "Orbit Commerce",
    "05 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0106",
    "Harbor Systems",
    "06 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0107",
    "Civic Partners",
    "07 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0108",
    "Lumen Digital",
    "08 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0109",
    "Northstar Labs",
    "09 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0110",
    "Cedar Works",
    "10 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0111",
    "BluePeak Studio",
    "11 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ],
  [
    "INV-0112",
    "Meridian Health",
    "12 Oct 2026",
    "₱50,000.00",
    "₱20,000.00",
    "Record payment →",
    1
  ]
];

const PANELS = [
  {
    "type": "list",
    "title": "Receivables aging",
    "subtitle": "As of 14 October 2026",
    "items": [
      [
        "Not yet due",
        "₱20,000.00"
      ],
      [
        "1–30 days overdue",
        "₱0.00"
      ],
      [
        "31+ days overdue",
        "₱0.00"
      ]
    ]
  },
  {
    "type": "highlight",
    "kicker": "NEXT COLLECTION",
    "title": "Meridian Health",
    "value": "₱20,000.00",
    "note": "Due 20 October · INV-0001",
    "button": "View invoice →"
  }
];

export default function InvoicesReceivables(props) {
  return (
    <ModulePage
      active="Invoices & receivables"
      title="Turn services into steady cash."
      description="Track company subscriptions, licensing, and service invoices."
      actionLabel="+ Create invoice"
      {...props}
    >
      <MetricCards items={METRICS} />
      <DataTable
        title={"Invoice register"}
        filterBy={"Customer / description"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"Invoices & receivables"}
      />
      <PanelGroup panels={PANELS} />
    </ModulePage>
  );
}
