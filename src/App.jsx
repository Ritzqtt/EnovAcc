import { useState } from 'react'
import Hero from './components/Hero'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import LoginPage from './components/LoginPage'
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
import ForgotPasswordPage from './components/ForgotPasswordPage'
import SendingResetLinkPage from './components/SendingResetLinkPage'
import ResetLinkSentPage from './components/ResetLinkSentPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import SavingPasswordPage from './components/SavingPasswordPage'
import PasswordUpdatedPage from './components/PasswordUpdatedPage'
import SigningInLoadingPage from './components/SigningInLoadingPage'
import PageTransition from './components/PageTransition'

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

function App() {
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'forgot-password' | 'sending-reset-link' | 'check-inbox' | 'verifying-link' | 'reset-password' | 'matching-password' | 'password-reset-failed' | 'saving-password' | 'password-updated' | 'signing-in' | 'sign-in-failed' | modules (see MODULES): 'dashboard' | 'chart-of-accounts' | 'journal-entries' | 'general-ledger' | 'invoices-receivables' | 'bills-payables' | 'expenses' | 'bank-reconciliation' | 'financial-reports' | 'tax-summaries' | 'integrations'
  const [pendingEmail, setPendingEmail] = useState('')
  const [month, setMonth] = useState('October 2026')

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  const handleNavigate = (label) => {
    const next = NAV_PAGE[label]
    if (next) setPage(next)
  }

  const handleSignOut = () => setPage('landing')

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

  let content

  if (MODULES[page]) {
    content = MODULES[page]
  } else if (page === 'signing-in') {
    content = <SigningInLoadingPage />
  } else if (page === 'forgot-password') {
    content = (
      <ForgotPasswordPage
        onBackToLanding={() => setPage('landing')}
        onBackToSignIn={() => setPage('login')}
        onSendResetLink={async (email) => {
          setPendingEmail(email)
          setPage('sending-reset-link')
          setTimeout(() => setPage('check-inbox'), 2200)
        }}
      />
    )
  } else if (page === 'sending-reset-link') {
    content = <SendingResetLinkPage />
  } else if (page === 'check-inbox') {
    content = (
      <ResetLinkSentPage
        email={pendingEmail}
        onBackToLanding={() => setPage('landing')}
        onBackToSignIn={() => setPage('login')}
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
        onBackToLanding={() => setPage('landing')}
        onBackToSignIn={() => setPage('login')}
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
        onBackToLanding={() => setPage('landing')}
        onTryAgain={() => setPage('reset-password')}
        onRequestNewLink={() => setPage('forgot-password')}
      />
    )
  } else if (page === 'saving-password') {
    content = <SavingPasswordPage />
  } else if (page === 'password-updated') {
    content = (
      <PasswordUpdatedPage
        onBackToLanding={() => setPage('landing')}
        onBackToSignIn={() => setPage('login')}
      />
    )
  } else if (page === 'login') {
    content = (
      <LoginPage
        onBackToLanding={() => setPage('landing')}
        onSignIn={async (email, password) => {
          await new Promise((r) => setTimeout(r, 600))
          if (password !== 'demo') throw new Error('bad login')
          acceptCredentials()
        }}
        onSignInFailed={() => setPage('sign-in-failed')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  } else if (page === 'sign-in-failed') {
    content = (
      <SignInFailedPage
        onBackToLanding={() => setPage('landing')}
        onTryAgain={() => setPage('login')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  } else {
    content = (
      <>
        <Hero
          entering={entering}
          onLogin={() => setPage('login')}
        />
        {loading ? (
          <InitialLoadingScreen
            onReveal={() => setEntering(true)}
            onDone={() => setLoading(false)}
          />
        ) : null}
      </>
    )
  }

  return <PageTransition pageKey={page}>{content}</PageTransition>
}

export default App
