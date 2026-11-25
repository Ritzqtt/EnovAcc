import { useState } from "react";

const TYPES = {
  approval: { icon: "check", bg: "#fff2d7", color: "#d99a1c" },
  payment: { icon: "arrowDown", bg: "#e3f7ea", color: "#22a55b" },
  overdue: { icon: "alert", bg: "#fde4e4", color: "#e5484d" },
  bank: { icon: "bank", bg: "#ece8fb", color: "#6b4fd8" },
  reminder: { icon: "calendar", bg: "#e1f2fb", color: "#0693c7" },
  info: { icon: "info", bg: "#e9f4f8", color: "#637a8a" },
};

function PanelIcon({ name, className = "h-5 w-5" }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "check":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
      );
    case "arrowDown":
      return (
        <svg {...props}>
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
        </svg>
      );
    case "bank":
      return (
        <svg {...props}>
          <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 20 7H4z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M8 15h.01M12 15h.01M16 15h.01" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    default:
      return null;
  }
}

function NotificationItem({ item, onClick }) {
  const type = TYPES[item.type] || TYPES.info;

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className={`flex w-full items-start gap-3 border-b border-[#e6edf1] px-5 py-4 text-left transition-colors hover:bg-[#e9f4fb] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0693c7] ${
        item.unread ? "bg-[#f1f8fd]" : "bg-white"
      }`}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: type.bg, color: type.color }}
      >
        <PanelIcon name={type.icon} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-5 text-[#021820]">{item.title}</span>
        <span className="mt-0.5 block text-[13px] leading-5 text-[#637a8a]">{item.message}</span>
        <span className="mt-1 block text-xs leading-4 text-[#9aaab5]">{item.time}</span>
      </span>

      {item.unread && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0693c7]"
          aria-label="Unread"
        />
      )}
    </button>
  );
}

export default function NotificationPanel({
  notifications = [],
  onMarkAllRead,
  onViewAll,
  onItemClick,
}) {
  const [tab, setTab] = useState("all");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: unreadCount > 0 ? `Unread ${unreadCount}` : "Unread" },
    { id: "approvals", label: "Approvals" },
  ];

  const visible = notifications.filter((n) => {
    if (tab === "unread") return n.unread;
    if (tab === "approvals") return n.type === "approval";
    return true;
  });

  const emptyText =
    tab === "unread"
      ? "No unread notifications."
      : tab === "approvals"
        ? "Nothing is waiting for your approval."
        : "You're all caught up.";

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-30 mt-3 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#dce5ea] bg-white shadow-xl"
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold leading-6 text-[#021820]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#e1f2fb] px-2.5 py-0.5 text-xs font-bold text-[#0693c7]">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="text-[13px] font-semibold text-[#0693c7] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7] disabled:cursor-default disabled:text-[#9aaab5] disabled:no-underline"
        >
          Mark all as read
        </button>
      </div>

      <div role="tablist" aria-label="Filter notifications" className="flex gap-6 border-b border-[#e6edf1] px-5">
        {tabs.map((t) => {
          const selected = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-2.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7] ${
                selected
                  ? "border-[#0693c7] font-bold text-[#021820]"
                  : "border-transparent font-medium text-[#637a8a] hover:text-[#021820]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[min(480px,60vh)] overflow-y-auto">
        {visible.length > 0 ? (
          visible.map((item) => (
            <NotificationItem key={item.id} item={item} onClick={onItemClick} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f4f8] text-[#637a8a]">
              <PanelIcon name="bell" />
            </span>
            <p className="text-sm font-bold text-[#021820]">{emptyText}</p>
            <p className="text-xs text-[#637a8a]">New updates will show up here.</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="w-full border-t border-[#e6edf1] py-4 text-center text-[13px] font-semibold text-[#0693c7] hover:bg-[#f1f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0693c7]"
      >
        View all notifications
      </button>
    </div>
  );
}