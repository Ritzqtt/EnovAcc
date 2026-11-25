import logo from "../../assets/logo.png";

const SECTIONS = [
  {
    title: "WORKSPACE",
    items: [
      ["Dashboard", "grid"],
      ["Chart of Accounts", "accounts"],
      ["Journal Entries", "journal"],
      ["General Ledger", "book"],
      ["Invoices & Receivables", "receipt"],
      ["Bills & Payables", "briefcase"],
      ["Expenses", "card"],
      ["Bank Reconciliation", "bank"],
    ],
  },
  {
    title: "INSIGHTS & CONTROL",
    items: [
      ["Financial Reports", "chart"],
      ["Tax Summaries", "tax"],
      ["Integrations", "plug"],
      ["Audit Trail", "shield"],
      ["Users & Roles", "users"],
    ],
  },
];

const HIDDEN_ITEMS_BY_ROLE = {
  accountant: ["Audit trail", "Users & roles"],
  "finance manager": ["Users & roles"],
};

const ALL_RESTRICTED_ITEMS = new Set(
  Object.values(HIDDEN_ITEMS_BY_ROLE).flat(),
);

function getHiddenItems(role) {
  const key = (role || "").toLowerCase().replace(/[_-]+/g, " ").trim();
  if (!key) return ALL_RESTRICTED_ITEMS;
  return new Set(HIDDEN_ITEMS_BY_ROLE[key] ?? []);
}

function NavIcon({ name }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-5 w-5 shrink-0",
    "aria-hidden": true,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "accounts":
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "journal":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </svg>
      );
    case "book":
      return (
        <svg {...props}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...props}>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
          <path d="M8 8h8M8 12h8M8 16h4" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...props}>
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "bank":
      return (
        <svg {...props}>
          <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 20 7H4z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
        </svg>
      );
    case "tax":
      return (
        <svg {...props}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M9 6h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01" />
        </svg>
      );
    case "plug":
      return (
        <svg {...props}>
          <path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex h-[42px] w-full items-center gap-3 rounded-lg p-3 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active
          ? "bg-white font-bold text-[#02355d]"
          : "font-normal text-white hover:bg-white/10"
      }`}
    >
      <NavIcon name={icon} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export default function Sidenav({
  active,
  onNavigate,
  role,
  open = false,
  onClose,
}) {
  const hiddenItems = getHiddenItems(role);
  const sections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(([label]) => !hiddenItems.has(label)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[228px] shrink-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgb(67,195,237)_0%,rgb(50,173,229)_5.2885%,rgb(4,97,169)_27.404%,rgb(3,82,144)_46.635%,rgb(2,53,93)_89.423%)] transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white lg:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[calc(100%-140px)] w-full object-cover object-bottom opacity-[0.08] brightness-0 invert"
      />

      <div className="relative flex shrink-0 flex-col items-center pt-8">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="h-[55px] w-[55px] object-contain brightness-0 invert drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        />
        <p className="mt-3 text-[32px] font-extrabold italic leading-none text-white [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
          EnovAcc
        </p>
      </div>

      <nav
        className="relative mt-[26px] min-h-0 flex-1 overflow-y-auto px-4 pb-4 [scrollbar-color:rgba(255,255,255,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent"
        aria-label="Main"
      >
        {sections.map((section, index) => (
          <div key={section.title} className={index > 0 ? "mt-4" : ""}>
            <p className="mb-1 text-[10px] font-bold leading-4 text-white">
              {section.title}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map(([label, icon]) => (
                <NavItem
                  key={label}
                  label={label}
                  icon={icon}
                  active={label === active}
                  onClick={() => onNavigate?.(label)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative flex shrink-0 flex-col gap-2 px-8 pb-8 pt-4">
        <p className="text-[10px] font-bold leading-4 text-white">ENOV8TIVE</p>
        <p className="text-[13px] font-bold leading-5 text-white">
          Philippine Entity
        </p>
        <p className="text-xs leading-[18px] text-[#a7bfce]">
          Financial Management System
        </p>
      </div>
    </aside>
  );
}
