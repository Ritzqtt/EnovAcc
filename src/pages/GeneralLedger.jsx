import ModulePage from "../components/ModulePage";
import DataTable from "../components/DataTable";

const BANNER = {
  "left": "1000 / Operating bank account",
  "label": "CLOSING BALANCE",
  "value": "₱122,000.00"
};

const COLUMNS = [
  [
    "DATE",
    125,
    "code"
  ],
  [
    "REFERENCE",
    125,
    ""
  ],
  [
    "DESCRIPTION",
    425,
    ""
  ],
  [
    "DEBIT",
    150,
    ""
  ],
  [
    "CREDIT",
    150,
    ""
  ],
  [
    "BALANCE",
    145,
    ""
  ]
];

const ROWS = [
  [
    "01 Oct 2026",
    "JE-0001",
    "Opening balances",
    "₱100,000.00",
    "—",
    "₱100,000.00",
    1
  ],
  [
    "06 Oct 2026",
    "JE-0003",
    "Meridian Health payment",
    "₱30,000.00",
    "—",
    "₱130,000.00",
    0
  ],
  [
    "07 Oct 2026",
    "JE-0004",
    "Cloud infrastructure",
    "—",
    "₱8,000.00",
    "₱122,000.00",
    0
  ],
  [
    "04 Oct 2026",
    "Internet expense",
    "Opening balances",
    "₱100,000.00",
    "—",
    "₱100,000.00",
    1
  ],
  [
    "05 Oct 2026",
    "Payroll transfer",
    "Meridian Health payment",
    "₱30,000.00",
    "—",
    "₱130,000.00",
    0
  ],
  [
    "06 Oct 2026",
    "Bank service fee",
    "Cloud infrastructure",
    "—",
    "₱8,000.00",
    "₱122,000.00",
    0
  ],
  [
    "07 Oct 2026",
    "Supplier settlement",
    "Opening balances",
    "₱100,000.00",
    "—",
    "₱100,000.00",
    1
  ],
  [
    "08 Oct 2026",
    "Consulting receipt",
    "Meridian Health payment",
    "₱30,000.00",
    "—",
    "₱130,000.00",
    0
  ],
  [
    "09 Oct 2026",
    "Opening balance",
    "Cloud infrastructure",
    "—",
    "₱8,000.00",
    "₱122,000.00",
    0
  ],
  [
    "10 Oct 2026",
    "Customer collection",
    "Opening balances",
    "₱100,000.00",
    "—",
    "₱100,000.00",
    1
  ],
  [
    "11 Oct 2026",
    "Rent payment",
    "Meridian Health payment",
    "₱30,000.00",
    "—",
    "₱130,000.00",
    0
  ],
  [
    "12 Oct 2026",
    "Internet expense",
    "Cloud infrastructure",
    "—",
    "₱8,000.00",
    "₱122,000.00",
    0
  ]
];

export default function GeneralLedger(props) {
  return (
    <ModulePage
      active="General ledger"
      title="The complete accounting record."
      description="Approved transactions, organized by account and posting date."
      actionLabel="null"
      {...props}
    >
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl bg-gradient-to-r from-[#02355d] to-[#046fc3] p-6 font-bold text-white"
      >
        <p className="text-[19px] leading-7">{BANNER.left}</p>
        <p className="text-[10px] leading-4 text-[#a7bfce]">{BANNER.label}</p>
        <p className="text-4xl leading-[44px]">{BANNER.value}</p>
      </div>
      <DataTable
        title={"Posted movements"}
        filterBy={"Description"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"General ledger"}
      />
    </ModulePage>
  );
}
