import { useState, useMemo } from "react";
import ModulePage from "../components/ModulePage";

const INITIAL_ACCOUNTS = [
  {
    code: "1000",
    name: "Operating bank account",
    accountClass: "Asset",
    balance: 122000.0,
  },
  {
    code: "1100",
    name: "Accounts receivable",
    accountClass: "Asset",
    balance: 20000.0,
  },
  {
    code: "2100",
    name: "Accounts payable",
    accountClass: "Liability",
    balance: 6000.0,
  },
  {
    code: "3000",
    name: "Opening equity",
    accountClass: "Equity",
    balance: 100000.0,
  },
  {
    code: "4000",
    name: "Service & subscription revenue",
    accountClass: "Revenue",
    balance: 50000.0,
  },
  {
    code: "5000",
    name: "Operating expenses",
    accountClass: "Expense",
    balance: 14000.0,
  },
  {
    code: "6600",
    name: "Utilities expense",
    accountClass: "Expense",
    balance: 122000.0,
  },
  {
    code: "6700",
    name: "Travel expense",
    accountClass: "Expense",
    balance: 20000.0,
  },
  {
    code: "6800",
    name: "Petty cash",
    accountClass: "Asset",
    balance: 6000.0,
  },
  {
    code: "6900",
    name: "Office supplies",
    accountClass: "Expense",
    balance: 4000.0,
  },
];

const CLASS_OPTIONS = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

function formatPHP(value) {
  const absFormatted = Math.abs(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-₱${absFormatted}` : `₱${absFormatted}`;
}

export default function ChartOfAccounts(props) {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All records");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("Asset");
  const [newBalance, setNewBalance] = useState("");

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesClass =
        classFilter === "All records" || acc.accountClass === classFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        acc.code.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q) ||
        acc.accountClass.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [accounts, searchQuery, classFilter]);

  const assetsTotal = useMemo(
    () =>
      accounts
        .filter((acc) => acc.accountClass === "Asset")
        .reduce((total, acc) => total + acc.balance, 0),
    [accounts]
  );

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    if (accounts.some((acc) => acc.code === newCode.trim())) return;

    const created = {
      code: newCode.trim(),
      name: newName.trim(),
      accountClass: newClass,
      balance: parseFloat(newBalance) || 0,
    };

    setAccounts((prev) =>
      [...prev, created].sort((a, b) => a.code.localeCompare(b.code))
    );
    setNewCode("");
    setNewName("");
    setNewClass("Asset");
    setNewBalance("");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const header = "Code,Account Name,Class,Balance";
    const rows = filteredAccounts.map(
      (a) => `"${a.code}","${a.name}","${a.accountClass}","${a.balance}"`
    );
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chart-of-accounts-oct-2026.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewLedger = (account) => {
    props.onSelectAccount?.(account);
  };

  return (
    <ModulePage
      active="Chart of accounts"
      title="Built on a balanced foundation."
      description="Organize every transaction with a consistent account structure."
      actionLabel="+ New account"
      onAction={() => setIsModalOpen(true)}
      {...props}
    >
      {/* Top 3 KPI Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active accounts</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {accounts.length}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            Across {CLASS_OPTIONS.length} account classes
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Ledger balance</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(assetsTotal)}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">Assets on record</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Posting status</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Balanced
          </p>
          <p className="mt-1.5 text-xs text-slate-400">Debits match credits</p>
        </div>
      </div>

      {/* Account Directory Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <h2 className="mr-2 text-base font-bold text-slate-900">
            Account directory
          </h2>

          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter & Export Controls */}
          <div className="flex items-center gap-2.5">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-sky-100 bg-sky-50/70 px-3.5 py-2 text-xs font-medium text-sky-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="All records">All records</option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pl-6 pr-3">Code</th>
                <th className="px-3 py-3.5">Account Name</th>
                <th className="px-3 py-3.5">Class</th>
                <th className="px-3 py-3.5">Balance</th>
                <th className="py-3.5 pl-3 pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 bg-sky-50/40 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="bg-white py-8 text-center text-slate-400"
                  >
                    No accounts found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.code}
                    className="transition-colors hover:bg-sky-100/40"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 font-semibold text-sky-600">
                      {acc.code}
                    </td>
                    <td className="px-3 py-4 font-medium text-slate-700">
                      {acc.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                      {acc.accountClass}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-700">
                      {formatPHP(acc.balance)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-6">
                      <button
                        type="button"
                        onClick={() => handleViewLedger(acc)}
                        className="cursor-pointer font-semibold text-sky-600 transition-colors hover:text-sky-800"
                      >
                        View ledger →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* "+ New account" Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-900">
              Create new account
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add a new account code to the EnovAcc chart of accounts.
            </p>

            <form onSubmit={handleAddAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Account code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1200"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Account name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prepaid insurance"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Class
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
                  >
                    {CLASS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Opening balance (PHP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
                >
                  Save account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModulePage>
  );
}
