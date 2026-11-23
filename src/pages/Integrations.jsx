import ModulePage from "../components/ModulePage";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { Icon } from "../components/AppShell";

const ACTION_CARDS = [
  {
    "icon": "users",
    "title": "Payroll module",
    "text": "Import summarized salary expenses for review and posting. Payroll processing remains in the existing module.",
    "badge": "CSV workflow",
    "button": "Preview payroll import"
  },
  {
    "icon": "chart",
    "title": "Business analytics",
    "text": "Export approved ledger records for the existing analytics environment. Keep reporting connected to the books.",
    "badge": "CSV workflow",
    "button": "Export ledger data"
  }
];

const COLUMNS = [
  [
    "DATE",
    170,
    "code"
  ],
  [
    "MODULE",
    250,
    ""
  ],
  [
    "ACTIVITY",
    496,
    ""
  ],
  [
    "STATUS",
    250,
    "badge"
  ]
];

const ROWS = [
  [
    "14 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "14 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ],
  [
    "03 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "04 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ],
  [
    "05 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "06 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ],
  [
    "07 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "08 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ],
  [
    "09 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "10 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ],
  [
    "11 Oct 2026",
    "Business analytics",
    "Ledger export ready",
    "Available",
    1
  ],
  [
    "12 Oct 2026",
    "Payroll",
    "No imports yet",
    "Ready",
    0
  ]
];

export default function Integrations(props) {
  return (
    <ModulePage
      active="Integrations"
      title="Connected records. Clear boundaries."
      description="Exchange relevant data with the existing payroll and analytics modules."
      actionLabel="null"
      {...props}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {ACTION_CARDS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-start gap-5 rounded-xl border border-[#dce5ea] bg-white p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f4f8] text-[#0693c7]">
              <Icon name={item.icon} className="h-6 w-6" />
            </div>
            <h2 className="text-[19px] font-bold leading-7 text-[#021820]">{item.title}</h2>
            <p className="max-w-[706px] text-sm leading-[22px] text-[#637a8a]">{item.text}</p>
            <Badge label={item.badge} />
            <button type="button" className="flex h-11 min-w-[230px] items-center justify-center rounded-lg bg-[#43c3ed] px-4 text-[13px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]">
              {item.button}
            </button>
          </div>
        ))}
      </div>
      <DataTable
        title={"Exchange activity"}
        filterBy={"Module"}
        columns={COLUMNS}
        rows={ROWS}
        moduleLabel={"Integrations"}
      />
    </ModulePage>
  );
}
