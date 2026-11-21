import { useState, useMemo } from "react";
import ModulePage from "../components/ModulePage";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// dueDate is stored as ISO (YYYY-MM-DD) so rows can be filtered by month and sorted.
const INITIAL_BILLS = [
  {
    id: "BILL-0001",
    supplier: "ClearSpace - Office services",
    dueDate: "2026-10-08",
    amount: 6000.0,
    status: "Overdue",
  },
  {
    id: "BILL-0002",
    supplier: "FiberLink Telecom - Monthly Fiber",
    dueDate: "2026-10-15",
    amount: 12500.0,
    status: "Paid",
  },
  {
    id: "BILL-0003",
    supplier: "Metro Utilities - Power & Water",
    dueDate: "2026-10-22",
    amount: 8400.0,
    status: "Outstanding",
  },
  {
    id: "BILL-0004",
    supplier: "PaperTrail Supplies",
    dueDate: "2026-10-25",
    amount: 3200.0,
    status: "Outstanding",
  },
  {
    id: "BILL-0005",
    supplier: "SecureIT Services - Cloud Security",
    dueDate: "2026-10-30",
    amount: 24000.0,
    status: "Outstanding",
  },
  {
    id: "BILL-0006",
    supplier: "Staffing Partners - Contract payroll",
    dueDate: "2026-09-28",
    amount: 42000.0,
    status: "Paid",
  },
  {
    id: "BILL-0007",
    supplier: "Northwind Logistics - Freight",
    dueDate: "2026-11-05",
    amount: 1800.0,
    status: "Outstanding",
  },
  {
    id: "BILL-0008",
    supplier: "CloudNine Hosting - Servers & domains",
    dueDate: "2026-11-14",
    amount: 9500.0,
    status: "Overdue",
  },
];

function formatPHP(value) {
  const absFormatted = Math.abs(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-₱${absFormatted}` : `₱${absFormatted}`;
}

function formatDueDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTH_SHORT[Number(m) - 1]} ${y}`;
}

/** "October 2026" -> "2026-10" so it can be compared against a dueDate. */
function monthKeyFromLabel(label) {
  const [name, year] = String(label || "").split(" ");
  const index = MONTH_NAMES.indexOf(name);
  if (index < 0 || !/^\d{4}$/.test(year || "")) return null;
  return `${year}-${String(index + 1).padStart(2, "0")}`;
}

export default function BillsPayables({
  month = "October 2026",
  onMonthChange,
  ...props
}) {
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All records");

  // Bills due in the selected month, earliest first.
  const monthBills = useMemo(() => {
    const key = monthKeyFromLabel(month);
    return bills
      .filter((b) => (key ? b.dueDate.startsWith(key) : true))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [bills, month]);

  const metrics = useMemo(() => {
    const outstanding = monthBills.filter((b) => b.status !== "Paid");
    const overdue = monthBills.filter((b) => b.status === "Overdue");
    const paid = monthBills.filter((b) => b.status === "Paid");

    const sum = (list) => list.reduce((total, b) => total + Math.abs(b.amount), 0);

    return {
      outstandingTotal: sum(outstanding),
      outstandingCount: outstanding.length,
      overdueTotal: sum(overdue),
      overdueCount: overdue.length,
      paidTotal: sum(paid),
      paidCount: paid.length,
    };
  }, [monthBills]);

  const filteredBills = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return monthBills.filter((bill) => {
      const matchesStatus =
        statusFilter === "All records" || bill.status === statusFilter;
      const matchesSearch =
        bill.id.toLowerCase().includes(q) ||
        bill.supplier.toLowerCase().includes(q) ||
        formatDueDate(bill.dueDate).toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [monthBills, searchQuery, statusFilter]);

  const handlePayBill = (id) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id ? { ...bill, status: "Paid" } : bill
      )
    );
  };

  const handleExportCSV = () => {
    const rows = filteredBills.map(
      (b) =>
        `"${b.id}","${b.supplier}","${formatDueDate(b.dueDate)}","${b.amount}","${b.status}"`
    );
    const header = "Reference,Supplier / Description,Due date,Amount,Status";
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bills-payables-${month.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModulePage
      active="Bills & payables"
      title="A clear view of what is due"
      description="Keep supplier obligations and payments organized"
      month={month}
      onMonthChange={onMonthChange}
      {...props}
    >
      {/* Summary cards for the selected period */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Open payables</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(metrics.outstandingTotal)}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            {`${metrics.outstandingCount} approve supplier ${
              metrics.outstandingCount === 1 ? "bill" : "bills"
            }`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Overdue</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(metrics.overdueTotal)}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            {metrics.overdueCount} past the due date
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Paid this period</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {formatPHP(metrics.paidTotal)}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">
            {`${metrics.paidCount} settled ${
              metrics.paidCount === 1 ? "bill" : "bills"
            }`}
          </p>
        </div>
      </div>

      {/* Main bills table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <h2 className="mr-2 text-base font-bold text-slate-900">
            Supplier bills
          </h2>

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

          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer rounded-lg border border-sky-100 bg-sky-50/70 px-3.5 py-2 text-xs font-medium text-sky-700 focus:border-sky-500 focus:outline-none"
            >
              <option value="All records">All records</option>
              <option value="Outstanding">Outstanding</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pl-6 pr-3">Reference</th>
                <th className="px-3 py-3.5">Supplier / Description</th>
                <th className="px-3 py-3.5">Due date</th>
                <th className="px-3 py-3.5">Amount</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 bg-sky-50/40 text-xs">
              {filteredBills.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="bg-white py-8 text-center text-slate-400"
                  >
                    No bills due in {month}.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const isPaid = bill.status === "Paid";
                  const isOverdue = bill.status === "Overdue";

                  return (
                    <tr
                      key={bill.id}
                      className="transition-colors hover:bg-sky-100/40"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 font-semibold text-sky-600">
                        {bill.id}
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-700">
                        {bill.supplier}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                        {formatDueDate(bill.dueDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 font-semibold text-slate-800">
                        {formatPHP(bill.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-100/80 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            Outstanding
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-6">
                        {isPaid ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePayBill(bill.id)}
                            className="cursor-pointer font-semibold text-sky-600 transition-colors hover:text-sky-800"
                          >
                            Pay bill
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
