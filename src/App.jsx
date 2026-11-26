import { useEffect, useLayoutEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import useIdleTimeout from "./lib/useIdleTimeout";
import { useWorkspaceUsers } from "./hooks/useWorkspaceUsers";
import { useAuditLogs } from "./hooks/useAuditLogs";
import InitialLoadingScreen from "./components/loading/InitialLoadingScreen";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./components/dashboard/Dashboard";
import ChartOfAccounts from "./components/accounting/ChartOfAccounts";
import JournalEntries from "./components/accounting/JournalEntries";
import GeneralLedger from "./components/accounting/GeneralLedger";
import InvoicesReceivables from "./components/accounting/InvoicesReceivables";
import BillsPayables from "./components/accounting/BillsPayables";
import Expenses from "./components/accounting/Expenses";
import BankReconciliation from "./components/accounting/BankReconciliation";
import FinancialReports from "./components/accounting/FinancialReports";
import TaxSummaries from "./components/accounting/TaxSummaries";
import Integrations from "./components/integrations/Integrations";
import AuditTrail from "./components/audit/AuditTrail";
import AddUserModal from "./components/admin/AddUserModal";
import EditUserModal from "./components/admin/EditUserModal";
import ResetPasswordModal from "./components/admin/ResetPasswordModal";
import UsersRoles from "./components/admin/UsersRoles";
import AuthSurface from "./components/auth/AuthSurface";
import AccountSettings from "./components/settings/AccountSettings";
import ChangePassword from "./components/settings/ChangePassword";

const BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

// Same shape as Topnav's month picker and every page's CURRENT_MONTH
// default ("November 2026"), so the shared state drops straight in.
const CURRENT_MONTH_LABEL = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

const IDLE_TIMEOUT_MINUTES = 15;
const IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MINUTES * 60 * 1000;

const PAGE_LABELS = {
  dashboard: "Dashboard",
  "chart-of-accounts": "Chart of Accounts",
  "journal-entries": "Journal Entries",
  "general-ledger": "General Ledger",
  "invoices-receivables": "Invoices & Receivables",
  "bills-payables": "Bills & Payables",
  expenses: "Expenses",
  "bank-reconciliation": "Bank Reconciliation",
  "financial-reports": "Financial Reports",
  "tax-summaries": "Tax Summaries",
  integrations: "Integrations",
  "audit-trail": "Audit Trail",
  "users-roles": "Users & Roles",
  "account-settings": "Account Settings",
  "change-password": "Change Password",
};

function readAuthView() {
  if (typeof window === "undefined") return "landing";
  const path = window.location.pathname;
  const relative =
    BASE_PATH && path.startsWith(BASE_PATH)
      ? path.slice(BASE_PATH.length)
      : path;

  const normalized = relative.replace(/\/+$/, "") || "/";
  if (normalized === "/login") return "login";
  if (normalized === "/forgot-password") return "forgot-password";
  return "landing";
}

function authUrl(view) {
  if (view === "login") return `${BASE_PATH}/login`;
  if (view === "forgot-password") return `${BASE_PATH}/forgot-password`;
  return `${BASE_PATH}/`;
}

function hasStoredSession() {
  try {
    return Object.keys(window.localStorage).some(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    );
  } catch {
    return false;
  }
}

function friendlyOtpError(error) {
  const message = error?.message?.toLowerCase() ?? "";
  if (
    error?.status === 429 ||
    message.includes("rate limit") ||
    message.includes("security purposes")
  ) {
    return "Please wait a few seconds before requesting another code.";
  }
  return "We couldn't send the code. Try again.";
}

async function logAuthEvent(action) {
  const { error } = await supabase.rpc("log_auth_event", {
    p_action: action,
  });
  if (error) console.error("Audit log failed:", error.message);
}

function AuditTrailPage({ month, currentUser }) {
  const { entries, loading, error, refetch } = useAuditLogs();

  const canDelete = currentUser?.role_name === "Finance Manager";

  const handleDelete = async (ids) => {
    const { error } = await supabase.rpc("delete_audit_logs", {
      p_ids: ids,
    });
    if (error) throw new Error(error.message);
    await refetch();
  };

  return (
    <AuditTrail
      month={month}
      entries={entries}
      loading={loading}
      error={error}
      canDelete={canDelete}
      onDelete={handleDelete}
    />
  );
}

function UsersRolesPage({ month }) {
  const { users, loading, error, refetch } = useWorkspaceUsers();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPasswordUser, setSelectedPasswordUser] = useState(null);

  return (
    <>
      <UsersRoles
        month={month}
        users={users}
        loading={loading}
        error={error}
        onInviteUser={() => setShowAdd(true)}
        onEditUser={(user) => setSelectedUser(user)}
        onResetPassword={(user) => setSelectedPasswordUser(user)}
        onDeleteUser={async (user) => {
          const confirmed = window.confirm(
            `Are you sure you want to delete ${user.full_name}?\n\nThis will permanently delete their account and profile. This action cannot be undone.`,
          );

          if (!confirmed) return;

          try {
            const { data, error } = await supabase.functions.invoke(
              "delete-user",
              {
                body: {
                  user_id: user.id,
                },
              },
            );

            if (error) {
              let message = "Could not delete the user.";

              try {
                const body = await error.context.json();
                if (body?.error) message = body.error;
              } catch {}

              throw new Error(message);
            }

            if (data?.error) {
              throw new Error(data.error);
            }

            await refetch();

            window.alert("User account deleted successfully.");
          } catch (err) {
            window.alert(err.message || "Could not delete the user.");
          }
        }}
      />
      {showAdd && (
        <AddUserModal onClose={() => setShowAdd(false)} onCreated={refetch} />
      )}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={refetch}
        />
      )}
      {selectedPasswordUser && (
        <ResetPasswordModal
          user={selectedPasswordUser}
          onClose={() => setSelectedPasswordUser(null)}
          onReset={refetch}
        />
      )}
    </>
  );
}

function App() {
  const [page, setPage] = useState(() =>
    hasStoredSession() ? "dashboard" : "landing",
  );
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loaderDone, setLoaderDone] = useState(false);

  const [authNotice, setAuthNotice] = useState("");
  const [ledgerAccount, setLedgerAccount] = useState(null);
  const [month, setMonth] = useState(CURRENT_MONTH_LABEL);

  useEffect(() => {
    window.history.replaceState({ auth: "landing" }, "", authUrl("landing"));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPage(readAuthView());
      setLoading(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const getUserProfile = async (authUser) => {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, full_name, role_id, status, avatar_url")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Your user profile could not be found.");
    }

    if (profile.status !== "Active") {
      throw new Error("Your account is inactive.");
    }

    if (!profile.role_id) {
      throw new Error("No role has been assigned to your account.");
    }

    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("role_name")
      .eq("role_id", profile.role_id)
      .single();

    if (roleError || !role) {
      throw new Error("Your assigned role could not be verified.");
    }

    return {
      id: profile.id,
      email: authUser.email,
      full_name: profile.full_name,
      role_id: profile.role_id,
      role_name: role.role_name,
      status: profile.status,
      avatar_url: profile.avatar_url ?? null,
    };
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const session = data.session;

        if (!session?.user) {
          if (mounted) {
            setCurrentUser(null);
            setPage("landing");
          }

          return;
        }

        const userProfile = await getUserProfile(session.user);

        if (mounted) {
          setCurrentUser(userProfile);
          setPage("dashboard");
        }
      } catch (error) {
        console.error("Session restoration error:", error.message);

        await supabase.auth.signOut();

        if (mounted) {
          setCurrentUser(null);
          setPage("landing");
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (loaderDone && !checkingSession) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [loaderDone, checkingSession]);

  const navigateAuth = (next) => {
    if (next === page) return;

    if (next !== "login") setAuthNotice("");

    setLoading(false);

    if (typeof window !== "undefined") {
      if (
        next === "landing" &&
        window.history.state?.auth === "login" &&
        window.history.state?.from === "landing"
      ) {
        window.history.back();
        return;
      }

      window.history.pushState({ auth: next, from: page }, "", authUrl(next));
    }

    setPage(next);
  };

  const handleLoadingComplete = () => {
    setAuthNotice("");
    window.history.replaceState({ auth: "dashboard" }, "", authUrl("landing"));
    setPage("dashboard");
  };

  const handleSupabaseSignIn = async (email, password) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const invalid = authError.message
        ?.toLowerCase()
        .includes("invalid login credentials");
      throw new Error(
        invalid ? "Incorrect email or password." : authError.message,
      );
    }

    if (!authData.user) {
      await supabase.auth.signOut({ scope: "local" });
      throw new Error("Unable to retrieve authenticated user.");
    }

    try {
      await getUserProfile(authData.user);
    } catch (profileError) {
      await supabase.auth.signOut({ scope: "local" });
      throw profileError;
    }

    await supabase.auth.signOut({ scope: "local" });

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      throw new Error(friendlyOtpError(otpError));
    }

    const [name, domain] = email.split("@");
    return {
      challengeId: email,
      maskedEmail: `${name[0]}${"*".repeat(Math.max(name.length - 1, 2))}@${domain}`,
    };
  };

  const handleVerifyOtp = async (email, code) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error || !data.user) {
      throw new Error("Incorrect or expired code. Try again.");
    }

    try {
      const userProfile = await getUserProfile(data.user);
      setCurrentUser(userProfile);
    } catch (profileError) {
      await supabase.auth.signOut({ scope: "local" });
      throw profileError;
    }

    await logAuthEvent("Signed in");
  };

  const handleResendOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      throw new Error(friendlyOtpError(error));
    }
  };

  const handleSendResetCode = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(friendlyOtpError(error));
  };

  const handleVerifyResetCode = async (email, code) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });
    if (error || !data.session) {
      throw new Error("Incorrect or expired code. Try again.");
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const handleResetComplete = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setAuthNotice("Your password was updated. Sign in with your new password.");
    navigateAuth("login");
  };

  const handleResetBackToSignIn = async () => {
    await supabase.auth.signOut({ scope: "local" });
    navigateAuth("login");
  };

  const handleSignOut = async () => {
    await logAuthEvent("Signed out");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      return;
    }

    setCurrentUser(null);
    setPage("landing");
    navigateAuth("landing");
  };

  const handleIdleLogout = async () => {
    await logAuthEvent("Signed out");

    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: "local" });

    setCurrentUser(null);
    setAuthNotice(
      `You were signed out after ${IDLE_TIMEOUT_MINUTES} minutes of inactivity.`,
    );
    navigateAuth("login");
  };

  useIdleTimeout({
    enabled: Boolean(currentUser),
    timeoutMs: IDLE_TIMEOUT_MS,
    onTimeout: handleIdleLogout,
  });

  const handleNavigate = (label) => {
    const key = label.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
    if (MODULES[key]) setPage(key);
  };

  const handleProfileUpdated = (updates) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const moduleProps = {
    currentUser,
  };

  const MODULES = {
    dashboard: <Dashboard month={month} />,
    "chart-of-accounts": (
      <ChartOfAccounts
        month={month}
        onViewLedger={(account) => {
          setLedgerAccount(account);
          handleNavigate("General Ledger");
        }}
      />
    ),
    "journal-entries": <JournalEntries month={month} />,
    "general-ledger": <GeneralLedger account={ledgerAccount} month={month} />,
    "invoices-receivables": <InvoicesReceivables month={month} />,
    "bills-payables": <BillsPayables month={month} />,
    expenses: <Expenses month={month} />,
    "bank-reconciliation": <BankReconciliation month={month} />,
    "financial-reports": <FinancialReports month={month} />,
    "tax-summaries": <TaxSummaries month={month} />,
    integrations: <Integrations month={month} />,
    "audit-trail": <AuditTrailPage month={month} currentUser={currentUser} />,
    "users-roles": <UsersRolesPage month={month} />,
    "account-settings": (
      <AccountSettings
        {...moduleProps}
        onProfileUpdated={handleProfileUpdated}
      />
    ),
    "change-password": <ChangePassword {...moduleProps} />,
  };

  if (page === "landing" || page === "login" || page === "forgot-password") {
    return (
      <>
        <AuthSurface
          view={page}
          preloading={loading}
          notice={authNotice}
          onNavigate={navigateAuth}
          onSignIn={handleSupabaseSignIn}
          onSignInFailed={() => setPage("login")}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onLoadingComplete={handleLoadingComplete}
          onForgotPassword={() => setPage("forgot-password")}
          onSendResetCode={handleSendResetCode}
          onVerifyResetCode={handleVerifyResetCode}
          onResendResetCode={handleSendResetCode}
          onUpdatePassword={handleUpdatePassword}
          onResetComplete={handleResetComplete}
          onResetBackToSignIn={handleResetBackToSignIn}
        />

        {page === "landing" && loading ? (
          <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
        ) : null}
      </>
    );
  }

  const content = MODULES[page] ?? null;

  const shellUser = currentUser
    ? {
        name: currentUser.full_name,
        role: currentUser.role_name,
        email: currentUser.email,
        avatarUrl: currentUser.avatar_url,
      }
    : undefined;

  return (
    <>
      <AppShell
        active={PAGE_LABELS[page]}
        user={shellUser}
        month={month}
        onMonthChange={setMonth}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      >
        <div key={page} className="content-enter">
          {content}
        </div>
      </AppShell>

      {page === "dashboard" && loading ? (
        <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
      ) : null}
    </>
  );
}

export default App;
