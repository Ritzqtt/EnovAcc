import { useEffect, useLayoutEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  ROUTE,
  STATE_PAGE,
  DIALOGS_BUILT,
  NAV_PAGE,
  TRANSACTION_PAGE,
  resolve,
  warnUnsupported,
} from './lib/navigation'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import SignInFailedPage from './components/SignInFailedPage'
import PasswordResetFailedPage from './components/PasswordResetFailedPage'
import VerifyingLinkLoadingPage from './components/VerifyingLinkLoadingPage'
import MatchingPasswordLoadingPage from './components/MatchingPasswordLoadingPage'
import Dashboard from './components/Dashboard'
import NewTransactionDialog from './components/NewTransactionDialog'
import ChartOfAccounts from './pages/ChartOfAccounts'
import JournalEntries from './pages/JournalEntries'
import GeneralLedger from './pages/GeneralLedger'
import InvoicesReceivables from './pages/InvoicesReceivables'
import BillsPayables from './pages/BillsPayables'
import Expenses from './pages/Expenses'
import BankReconciliation from './pages/BankReconciliation'
import FinancialReports from './pages/FinancialReports'
import TaxSummaries from './pages/TaxSummaries'
import Integrations from './pages/Integrations'
import SendingResetLinkPage from './components/SendingResetLinkPage'
import ResetLinkSentPage from './components/ResetLinkSentPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import SavingPasswordPage from './components/SavingPasswordPage'
import PasswordUpdatedPage from './components/PasswordUpdatedPage'
import SigningInLoadingPage from './components/SigningInLoadingPage'
import PageTransition from './components/PageTransition'
import AuthSurface from './components/auth/AuthSurface'

// NAV_PAGE and TRANSACTION_PAGE come from ./lib/navigation — the single
// place button destinations are resolved (see buttonDestinations.js).

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

function readAuthView() {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname
  const relative =
    BASE_PATH && path.startsWith(BASE_PATH)
      ? path.slice(BASE_PATH.length)
      : path

  const normalized = relative.replace(/\/+$/, '') || '/'
  if (normalized === '/login') return 'login'
  if (normalized === '/forgot-password') return 'forgot-password'
  return 'landing'
}

function authUrl(view) {
  if (view === 'login') return `${BASE_PATH}/login`
  if (view === 'forgot-password') return `${BASE_PATH}/forgot-password`
  return `${BASE_PATH}/`
}

// Supabase keeps the session in localStorage. Checking it synchronously lets
// us know on the very first render whether the user is probably logged in.
function hasStoredSession() {
  try {
    return Object.keys(window.localStorage).some(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
    )
  } catch {
    return false
  }
}

function App() {
  // If a session is stored, start on the dashboard so that the loader fades
  // out onto the dashboard instead of the landing page.
  const [page, setPage] = useState(() =>
    hasStoredSession() ? 'dashboard' : 'landing'
  )
  const [loading, setLoading] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [pendingEmail, setPendingEmail] = useState('')
  const [month, setMonth] = useState('October 2026')
  const [currentUser, setCurrentUser] = useState(null)
  const [loaderDone, setLoaderDone] = useState(false)
  // One state for every overlay: the value is a dialog id, null when closed.
  const [dialog, setDialog] = useState(null)

  // Normalize the address bar once per full load.
  useEffect(() => {
    window.history.replaceState(
      { auth: 'landing' },
      '',
      authUrl('landing')
    )
  }, [])

  // Browser back/forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      setPage(readAuthView())
      setLoading(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Retrieve the user's profile and assigned role.
  const getUserProfile = async (authUser) => {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, role_id, status')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      throw new Error(
        'Your user profile could not be found.'
      )
    }

    if (profile.status !== 'Active') {
      throw new Error('Your account is inactive.')
    }

    if (!profile.role_id) {
      throw new Error(
        'No role has been assigned to your account.'
      )
    }

    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('role_name')
      .eq('role_id', profile.role_id)
      .single()

    if (roleError || !role) {
      throw new Error(
        'Your assigned role could not be verified.'
      )
    }

    return {
      id: profile.id,
      email: authUser.email,
      full_name: profile.full_name,
      role_id: profile.role_id,
      role_name: role.role_name,
      status: profile.status,
    }
  }

  // Restore the Supabase session when the application loads.
  useEffect(() => {
    let mounted = true

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        const session = data.session

        // No existing session: show the landing page.
        if (!session?.user) {
          if (mounted) {
            setCurrentUser(null)
            setPage('landing')
          }

          return
        }

        // Existing session: verify the user's profile and role.
        const userProfile = await getUserProfile(session.user)

        if (mounted) {
          setCurrentUser(userProfile)
          setPage('dashboard')
        }
      } catch (error) {
        console.error(
          'Session restoration error:',
          error.message
        )

        // Clear an invalid or unauthorized session.
        await supabase.auth.signOut()

        if (mounted) {
          setCurrentUser(null)
          setPage('landing')
        }
      } finally {
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [])

  // End the loader only when BOTH the animation and the session check are done.
  useLayoutEffect(() => {
    if (loaderDone && !checkingSession) {
      setLoading(false)
    }
  }, [loaderDone, checkingSession])

  // Navigate between authentication pages.
  const navigateAuth = (next) => {
    if (next === page) return

    setLoading(false)

    if (typeof window !== 'undefined') {
      if (
        next === 'landing' &&
        window.history.state?.auth === 'login' &&
        window.history.state?.from === 'landing'
      ) {
        window.history.back()
        return
      }

      window.history.pushState(
        { auth: next, from: page },
        '',
        authUrl(next)
      )
    }

    setPage(next)
  }

  // Show the existing signing-in loading screen.
  const acceptCredentials = () => {
    setPage('signing-in')

    setTimeout(() => {
      setPage('dashboard')
    }, 2200)
  }

  // Authenticate using Supabase.
  const handleSupabaseSignIn = async (email, password) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      await supabase.auth.signOut()
      throw new Error('Unable to retrieve authenticated user.')
    }

    try {
      const userProfile = await getUserProfile(authData.user)

      setCurrentUser(userProfile)

      acceptCredentials()
    } catch (error) {
      await supabase.auth.signOut()
      throw error
    }
  }

  // Navigate between application modules.
  const handleNavigate = (label) => {
    const next = NAV_PAGE[label]

    if (next) {
      setPage(next)
    }
  }

  // The one dispatcher: interprets a destination from buttonDestinations.js.
  // "close" and "filter" belong to the caller, not here.
  const goTo = (dest) => {
    if (!dest) return

    if (dest.type === 'page') {
      const route = ROUTE[dest.to]
      if (route) {
        setPage(route)
        return
      }
    } else if (dest.type === 'dialog') {
      if (DIALOGS_BUILT.has(dest.to)) {
        setDialog(dest.to)
        return
      }
    } else if (dest.type === 'state') {
      const route = STATE_PAGE[dest.to]
      if (route) {
        setPage(route)
        return
      }
    }

    warnUnsupported(dest)
  }

  // "+ New transaction" dialog -> the module that records the choice.
  const handleNewTransactionSelect = (type) => {
    setDialog(null)
    goTo({ type: 'page', to: TRANSACTION_PAGE[type] })
  }

  // Dashboard click-through (summary cards, "Review transaction", ...).
  const handleDashboardGo = (label) => {
    goTo(resolve('dashboard', label))
  }

  // Sign out from the actual Supabase session.
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error.message)
      return
    }

    setCurrentUser(null)
    setPage('landing')
    navigateAuth('landing')
  }

  const moduleProps = {
    onNavigate: handleNavigate,
    onSignOut: handleSignOut,
    currentUser,
  }

  const monthProps = {
    month,
    onMonthChange: setMonth,
  }

  const MODULES = {
    dashboard: (
      <Dashboard
        {...moduleProps}
        onNewTransaction={() => setDialog('newTransaction')}
        onSelectSummary={handleDashboardGo}
        onReviewTransaction={() => handleDashboardGo('Review transaction')}
      />
    ),

    'chart-of-accounts': (
      <ChartOfAccounts {...moduleProps} />
    ),

    'journal-entries': (
      <JournalEntries {...moduleProps} {...monthProps} />
    ),

    'general-ledger': (
      <GeneralLedger {...moduleProps} {...monthProps} />
    ),

    'invoices-receivables': (
      <InvoicesReceivables {...moduleProps} {...monthProps} />
    ),

    'bills-payables': (
      <BillsPayables
        {...moduleProps}
        month={month}
        onMonthChange={setMonth}
      />
    ),

    expenses: (
      <Expenses {...moduleProps} {...monthProps} />
    ),

    'bank-reconciliation': (
      <BankReconciliation {...moduleProps} {...monthProps} />
    ),

    'financial-reports': (
      <FinancialReports {...moduleProps} {...monthProps} />
    ),

    'tax-summaries': (
      <TaxSummaries {...moduleProps} {...monthProps} />
    ),

    integrations: (
      <Integrations {...moduleProps} {...monthProps} />
    ),
  }

  // Landing, login, and forgot-password pages.
  // The initial loader is an overlay on top of the landing page, so the
  // page's background is already in place when the loader finishes.
  if (
    page === 'landing' ||
    page === 'login' ||
    page === 'forgot-password'
  ) {
    return (
      <>
        <AuthSurface
          view={page}
          preloading={loading}
          onNavigate={navigateAuth}
          onSignIn={handleSupabaseSignIn}
          onSignInFailed={() => setPage('sign-in-failed')}
          onForgotPassword={() => setPage('forgot-password')}
          onSendResetLink={async (email) => {
            setPendingEmail(email)
            setPage('sending-reset-link')

            setTimeout(() => {
              setPage('check-inbox')
            }, 2200)
          }}
        />

        {page === 'landing' && loading ? (
          <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
        ) : null}
      </>
    )
  }

  let content

  if (MODULES[page]) {
    content = MODULES[page]

  } else if (page === 'signing-in') {
    content = <SigningInLoadingPage />

  } else if (page === 'sending-reset-link') {
    content = <SendingResetLinkPage />

  } else if (page === 'check-inbox') {
    content = (
      <ResetLinkSentPage
        email={pendingEmail}
        onBackToLanding={() => navigateAuth('landing')}
        onBackToSignIn={() => navigateAuth('login')}
        onOpenResetLink={() => {
          setPage('verifying-link')

          setTimeout(() => {
            setPage('reset-password')
          }, 2200)
        }}
        onResendLink={() =>
          window.alert(
            'We sent a new reset link to ' + pendingEmail
          )
        }
      />
    )

  } else if (page === 'verifying-link') {
    content = <VerifyingLinkLoadingPage />

  } else if (page === 'reset-password') {
    content = (
      <ResetPasswordPage
        onBackToLanding={() => navigateAuth('landing')}
        onBackToSignIn={() => navigateAuth('login')}
        onResetFailed={() => {
          setPage('matching-password')

          setTimeout(() => {
            setPage('password-reset-failed')
          }, 2200)
        }}
        onSaveNewPassword={async () => {
          setPage('saving-password')

          setTimeout(() => {
            setPage('password-updated')
          }, 2200)
        }}
      />
    )

  } else if (page === 'matching-password') {
    content = <MatchingPasswordLoadingPage />

  } else if (page === 'password-reset-failed') {
    content = (
      <PasswordResetFailedPage
        onBackToLanding={() => navigateAuth('landing')}
        onTryAgain={() => setPage('reset-password')}
        onRequestNewLink={() => setPage('forgot-password')}
      />
    )

  } else if (page === 'saving-password') {
    content = <SavingPasswordPage />

  } else if (page === 'password-updated') {
    content = (
      <PasswordUpdatedPage
        onBackToLanding={() => navigateAuth('landing')}
        onBackToSignIn={() => navigateAuth('login')}
      />
    )

  } else if (page === 'sign-in-failed') {
    content = (
      <SignInFailedPage
        onBackToLanding={() => navigateAuth('landing')}
        onTryAgain={() => navigateAuth('login')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )

  } else {
    content = null
  }

  return (
    <>
      <PageTransition pageKey={page}>
        {content}
      </PageTransition>

      {/* Sibling of PageTransition on purpose: its entering layer animates a
          transform, which would become the containing block for the dialog's
          position: fixed overlay. */}
      <NewTransactionDialog
        open={dialog === 'newTransaction'}
        onClose={() => setDialog(null)}
        onSelect={handleNewTransactionSelect}
      />

      {/* On refresh, the loader sits on top of the dashboard. */}
      {page === 'dashboard' && loading ? (
        <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
      ) : null}
    </>
  )
}

export default App