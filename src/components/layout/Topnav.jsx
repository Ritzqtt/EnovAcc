import { useEffect, useState } from "react";
import NotificationPanel from "./NotificationPanel";
import defaultProfile from "../../assets/default-profile.jpg";

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

function currentMonthLabel() {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function TopIcon({ name, className = "h-5 w-5" }) {
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
    case "chevron":
      return (
        <svg {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
}

const MENU_ITEM_CLASS =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0693c7]";

export default function Topnav({
  active,
  month,
  onMonthChange,
  user,
  onSignOut,
  onNavigate,
  notifications = [],
  onMarkAllRead,
  onViewAllNotifications,
  onNotificationClick,
  onOpenNavigation,
}) {
  const [selectedMonth, setSelectedMonth] = useState(
    month || currentMonthLabel(),
  );
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) =>
    setOpenMenu((current) => (current === name ? null : name));
  const closeMenu = () => setOpenMenu(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  const year = selectedMonth.split(" ")[1];
  const monthOptions = MONTH_NAMES.map((name) => `${name} ${year}`);

  const fullName = user?.name?.trim() || "User";
  const firstName = fullName.split(/\s+/)[0];
  const userRole = user?.role || "";
  const avatarSrc = user?.avatarUrl || defaultProfile;

  const selectMonth = (m) => {
    setSelectedMonth(m);
    closeMenu();
    onMonthChange?.(m);
  };

  const goTo = (label) => {
    closeMenu();
    onNavigate?.(label);
  };

  const signOut = () => {
    closeMenu();
    onSignOut?.();
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-2 bg-white px-3 py-3 shadow-[0_4px_16px_rgba(2,24,32,0.06)] sm:gap-4 sm:px-6 sm:py-4">
      {openMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        aria-label="Open navigation"
        onClick={onOpenNavigation}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#021820] hover:bg-[#f1f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0693c7] lg:hidden"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <p className="hidden min-w-0 flex-1 truncate text-xs leading-[18px] text-[#637a8a] sm:block">
        EnovAcc{"  /  "}
        {active}
      </p>

      <div className="flex h-9 items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("month")}
            aria-label="Change month"
            aria-haspopup="listbox"
            aria-expanded={openMenu === "month"}
            className="relative z-20 flex items-center gap-1 text-[13px] font-bold leading-5 text-[#021820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
          >
            <span className="max-w-[92px] truncate sm:max-w-none">
              {selectedMonth}
            </span>
            <TopIcon
              name="chevron"
              className={`h-4 w-4 transition-transform ${openMenu === "month" ? "rotate-180" : ""}`}
            />
          </button>

          {openMenu === "month" && (
            <div
              role="listbox"
              aria-label="Select month"
              className="absolute right-0 top-full z-30 mt-2 w-[280px] rounded-xl border border-[#dce5ea] bg-white p-3 shadow-xl"
            >
              <p className="mb-2 px-1 text-[10px] font-bold leading-4 text-[#637a8a]">
                SELECT PERIOD
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {monthOptions.map((m) => {
                  const short = m.split(" ")[0].slice(0, 3);
                  const isSelected = m === selectedMonth;
                  return (
                    <button
                      key={m}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectMonth(m)}
                      className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#0693c7] text-white"
                          : "text-[#021820] hover:bg-[#e6f6fd]"
                      }`}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("notifications")}
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={openMenu === "notifications"}
            className="relative z-20 text-[#021820] hover:text-[#0693c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
          >
            <TopIcon name="bell" />
            {unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0693c7]"
                aria-hidden="true"
              />
            )}
          </button>

          {openMenu === "notifications" && (
            <NotificationPanel
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onViewAll={() => {
                closeMenu();
                onViewAllNotifications?.();
              }}
              onItemClick={(item) => {
                closeMenu();
                onNotificationClick?.(item);
              }}
            />
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu("profile")}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={openMenu === "profile"}
            className="relative z-20 flex items-center gap-3 rounded-lg py-1 pl-1 pr-2 text-left transition-colors hover:bg-[#f3f6f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]"
          >
            <img
              src={avatarSrc}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultProfile;
              }}
              className="h-9 w-9 shrink-0 rounded-full bg-[#e9f4f8] object-cover"
            />

            <span className="hidden sm:block">
              <span className="block text-[13px] font-bold leading-5 text-[#021820]">
                {firstName}
              </span>
              {userRole && (
                <span className="block text-xs leading-[18px] text-[#637a8a]">
                  {userRole}
                </span>
              )}
            </span>

            <TopIcon
              name="chevron"
              className={`h-4 w-4 text-[#637a8a] transition-transform ${
                openMenu === "profile" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "profile" && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-full z-30 mt-3 w-[240px] rounded-xl border border-[#dce5ea] bg-white p-1.5 shadow-xl"
            >
              <div className="px-3 pb-2.5 pt-2">
                <p className="truncate text-[13px] font-bold leading-5 text-[#021820]">
                  {fullName}
                </p>
                {(user?.email || userRole) && (
                  <p className="truncate text-xs leading-[18px] text-[#637a8a]">
                    {user?.email || userRole}
                  </p>
                )}
              </div>

              <div
                role="separator"
                className="mx-1.5 mb-1.5 h-px bg-[#e6edf1]"
              />

              <button
                type="button"
                role="menuitem"
                onClick={() => goTo("Account Settings")}
                className={`${MENU_ITEM_CLASS} text-[#021820] hover:bg-[#f1f8fd]`}
              >
                <TopIcon
                  name="user"
                  className="h-[18px] w-[18px] text-[#637a8a]"
                />
                Account Settings
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => goTo("Change Password")}
                className={`${MENU_ITEM_CLASS} text-[#021820] hover:bg-[#f1f8fd]`}
              >
                <TopIcon
                  name="lock"
                  className="h-[18px] w-[18px] text-[#637a8a]"
                />
                Change Password
              </button>

              <div
                role="separator"
                className="mx-1.5 my-1.5 h-px bg-[#e6edf1]"
              />

              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className={`${MENU_ITEM_CLASS} text-[#c93a3f] hover:bg-[#fdf0f0]`}
              >
                <TopIcon name="logout" className="h-[18px] w-[18px]" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
