import { useEffect, useState } from 'react'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import SignInFailedPage from './components/SignInFailedPage'
import PasswordResetFailedPage from './components/PasswordResetFailedPage'
import VerifyingLinkLoadingPage from './components/VerifyingLinkLoadingPage'
import MatchingPasswordLoadingPage from './components/MatchingPasswordLoadingPage'
import Dashboard from './components/Dashboard'
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

const NAV_PAGE = {
  'Dashboard': 'dashboard',
  'Chart of accounts': 'chart-of-accounts',
  'Journal entries': 'journal-entries',
  'General ledger': 'general-ledger',
  'Invoices & receivables': 'invoices-receivables',
  'Bills & payables': 'bills-payables',
  'Expenses': 'expenses',
  'Bank reconciliation': 'bank-reconciliation',
  'Financial reports': 'financial-reports',
  'Tax summaries': 'tax-summaries',
  'Integrations': 'integrations',
}

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

function readAuthView() {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname
  const relative =
    BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) : path
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

function App() {
  // Every full page load starts on the landing page behind the loader, no
  // matter which URL was requested (login, forgot password, etc.).
  const [page, setPage] = useState('landing')
  const [loading, setLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState('')
  const [month, setMonth] = useState('October 2026')

  // Normalise the address bar once per full load. The entry is replaced, so
  // Back never returns to the route that was refreshed.
  useEffect(() => {
    window.history.replaceState({ auth: 'landing' }, '', authUrl('landing'))
  }, [])

  // Browser back/forward drives the same landing <-> login transition.
  useEffect(() => {
    const handlePopState = () => {
      setPage(readAuthView())
      setLoading(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateAuth = (next) => {
    if (next === page) return

    // The loader belongs to the initial mount only; never let it return
    // during in-app navigation.
    setLoading(false)

    if (typeof window !== 'undefined') {
      // The in-app "Back to landing page" link consumes the login entry when
      // it was created by the CTA, so Back/Forward stay intuitive.
      if (
        next === 'landing' &&
        window.history.state?.auth === 'login' &&
        window.history.state?.from === 'landing'
      ) {
        window.history.back()
        return
      }

      window.history.pushState({ auth: next, from: page }, '', authUrl(next))
    }

    setPage(next)
  }

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  const handleNavigate = (label) => {
    const next = NAV_PAGE[label]
    if (next) setPage(next)
  }

  const handleSignOut = () => {
    navigateAuth('landing')
  }

  const moduleProps = { onNavigate: handleNavigate, onSignOut: handleSignOut }
  const monthProps = { month, onMonthChange: setMonth }

  const MODULES = {
    'dashboard': <Dashboard {...moduleProps} />,
    'chart-of-accounts': <ChartOfAccounts {...moduleProps} />,
    'journal-entries': <JournalEntries {...moduleProps} {...monthProps} />,
    'general-ledger': <GeneralLedger {...moduleProps} {...monthProps} />,
    'invoices-receivables': <InvoicesReceivables {...moduleProps} {...monthProps} />,
    'bills-payables': <BillsPayables {...moduleProps} month={month} onMonthChange={setMonth} />,
    'expenses': <Expenses {...moduleProps} {...monthProps} />,
    'bank-reconciliation': <BankReconciliation {...moduleProps} {...monthProps} />,
    'financial-reports': <FinancialReports {...moduleProps} {...monthProps} />,
    'tax-summaries': <TaxSummaries {...moduleProps} {...monthProps} />,
    'integrations': <Integrations {...moduleProps} {...monthProps} />,
  }

  if (page === 'landing' || page === 'login' || page === 'forgot-password') {
    return (
      <>
        <AuthSurface
          view={page}
          preloading={loading}
          onNavigate={navigateAuth}
          onSignIn={async (email, password) => {
            await new Promise((resolve) => setTimeout(resolve, 600))
            if (password !== 'demo') throw new Error('bad login')
            acceptCredentials()
          }}
          onSignInFailed={() => setPage('sign-in-failed')}
          onForgotPassword={() => setPage('forgot-password')}
          onSendResetLink={async (email) => {
            setPendingEmail(email)
            setPage('sending-reset-link')
            setTimeout(() => setPage('check-inbox'), 2200)
          }}
        />
        {page === 'landing' && loading ? (
          <InitialLoadingScreen onDone={() => setLoading(false)} />
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
          setTimeout(() => setPage('reset-password'), 2200)
        }}
        onResendLink={() => window.alert('We sent a new reset link to ' + pendingEmail)}
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
          setTimeout(() => setPage('password-reset-failed'), 2200)
        }}
        onSaveNewPassword={async () => {
          setPage('saving-password')
          setTimeout(() => setPage('password-updated'), 2200)
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

  return <PageTransition pageKey={page}>{content}</PageTransition>
}

export default App
