import ModulePage from "../components/ModulePage";
import ReportTabs from "../components/ReportTabs";

const COMPANY = "ENOV8TIVE TECHNOLOGY SOLUTIONS INC.";

const TABS = [
  {
    "name": "Income statement",
    "title": "Income statement",
    "sub": "For the month of October 2026 · Philippine peso",
    "rows": [
      [
        "Revenue",
        "₱50,000.00",
        ""
      ],
      [
        "Operating expenses",
        "₱14,000.00",
        ""
      ],
      [
        "Salary expenses",
        "₱0.00",
        ""
      ],
      [
        "Net income",
        "₱36,000.00",
        "total"
      ]
    ],
    "note": {
      "big": "72%",
      "line1": "Net profit margin",
      "line2": "Based on posted revenue and expenses."
    }
  },
  {
    "name": "Balance sheet",
    "title": "Balance sheet",
    "sub": "October 2026 · Philippine peso",
    "rows": [
      [
        "Assets",
        "",
        "heading"
      ],
      [
        "Operating bank account",
        "₱122,000.00",
        ""
      ],
      [
        "Accounts receivable",
        "₱20,000.00",
        ""
      ],
      [
        "Total assets",
        "₱142,000.00",
        "total"
      ],
      [
        "Accounts payable",
        "₱6,000.00",
        ""
      ],
      [
        "Opening equity",
        "₱100,000.00",
        ""
      ],
      [
        "Cumulative earnings",
        "₱36,000.00",
        ""
      ],
      [
        "Liabilities & equity",
        "₱142,000.00",
        "total"
      ]
    ],
    "note": null
  },
  {
    "name": "Cash flow",
    "title": "Cash flow",
    "sub": "October 2026 · Philippine peso",
    "rows": [
      [
        "Opening cash",
        "₱100,000.00",
        ""
      ],
      [
        "Customer receipts",
        "₱30,000.00",
        ""
      ],
      [
        "Operating cash payments",
        "− ₱8,000.00",
        ""
      ],
      [
        "Net cash movement",
        "₱22,000.00",
        "total"
      ],
      [
        "Closing cash balance",
        "₱122,000.00",
        "total"
      ]
    ],
    "note": null
  }
];

export default function FinancialReports(props) {
  return (
    <ModulePage
      active="Financial reports"
      title="A clearer story behind the numbers."
      description="Financial statements generated from approved ledger entries."
      actionLabel="Export report"
      {...props}
    >
      <ReportTabs company={COMPANY} tabs={TABS} />
    </ModulePage>
  );
}
