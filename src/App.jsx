import { useState } from 'react'
import Hero from './components/Hero'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import LoginPage from './components/LoginPage'
import CreateAccountPage from './components/CreateAccountPage'
import CreateAccountLoadingPage from './components/CreateAccountLoadingPage'
import VerifyEmailPage from './components/VerifyEmailPage'
import AccountVerifiedPage from './components/AccountVerifiedPage'
import AccountCreationFailedPage from './components/AccountCreationFailedPage'
import VerificationFailedPage from './components/VerificationFailedPage'
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
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'create-account' | 'creating-account' | 'account-failed' | 'verify-email' | 'verification-failed' | 'account-verified' | 'forgot-password' | 'sending-reset-link' | 'check-inbox' | 'verifying-link' | 'reset-password' | 'matching-password' | 'password-reset-failed' | 'saving-password' | 'password-updated' | 'signing-in' | 'sign-in-failed' | modules (see MODULES): 'dashboard' | 'chart-of-accounts' | 'journal-entries' | 'general-ledger' | 'invoices-receivables' | 'bills-payables' | 'expenses' | 'bank-reconciliation' | 'financial-reports' | 'tax-summaries' | 'integrations'
  const [pendingEmail, setPendingEmail] = useState('')
  const [registeredEmails, setRegisteredEmails] = useState([])

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  const submitAccount = (email) => {
    setRegisteredEmails((prev) => (prev.includes(email) ? prev : [...prev, email]))
    setPendingEmail(email)
    setPage('creating-account')
    setTimeout(() => setPage('verify-email'), 2200)
  }

  const handleNavigate = (label) => {
    const next = NAV_PAGE[label]
    if (next) setPage(next)
  }

  const handleSignOut = () => setPage('landing')

  const moduleProps = { onNavigate: handleNavigate, onSignOut: handleSignOut }

  const MODULES = {
    'dashboard': <Dashboard {...moduleProps} />,
    'chart-of-accounts': <ChartOfAccounts {...moduleProps} />,
    'journal-entries': <JournalEntries {...moduleProps} />,
    'general-ledger': <GeneralLedger {...moduleProps} />,
    'invoices-receivables': <InvoicesReceivables {...moduleProps} />,
    'bills-payables': <BillsPayables {...moduleProps} />,
    'expenses': <Expenses {...moduleProps} />,
    'bank-reconciliation': <BankReconciliation {...moduleProps} />,
    'financial-reports': <FinancialReports {...moduleProps} />,
    'tax-summaries': <TaxSummaries {...moduleProps} />,
    'integrations': <Integrations {...moduleProps} />,
  }

  let content

  if (MODULES[page]) {
    content = MODULES[page]
  } else if (page === 'signing-in') {
    content = <SigningInLoadingPage />
  } else if (page === 'creating-account') {
    content = <CreateAccountLoadingPage />
  } else if (page === 'verify-email') {
    content = (
      <VerifyEmailPage
        email={pendingEmail}
        onBackToLanding={() => setPage('landing')}
        onVerify={async (code) => {
          await new Promise((r) => setTimeout(r, 600))
          if (code !== '123456') throw new Error('invalid code')
          setPage('account-verified')
        }}
        onVerifyFailed={() => setPage('verification-failed')}
        onResend={() => window.alert('We sent a new code to ' + pendingEmail)}
        onUseDifferentEmail={() => setPage('create-account')}
      />
    )
  } else if (page === 'verification-failed') {
    content = (
      <VerificationFailedPage
        onBackToLanding={() => setPage('landing')}
        onTryAgain={() => setPage('verify-email')}
        onSendNewCode={() => {
          window.alert('We sent a new code to ' + pendingEmail)
          setPage('verify-email')
        }}
      />
    )
  } else if (page === 'account-verified') {
    content = (
      <AccountVerifiedPage
        onBackToLanding={() => setPage('landing')}
        onContinueToSignIn={() => setPage('login')}
      />
    )
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
  } else if (page === 'create-account') {
    content = (
      <CreateAccountPage
        onBackToLanding={() => setPage('landing')}
        onSignIn={() => setPage('login')}
        onCreateAccount={async ({ fullName, email, password }) => {
          await new Promise((r) => setTimeout(r, 600))
          if (!fullName || !email || !password) throw new Error('missing fields')
          if (registeredEmails.includes(email)) throw new Error('email taken')
          submitAccount(email)
        }}
        onAccountFailed={() => setPage('account-failed')}
      />
    )
  } else if (page === 'account-failed') {
    content = (
      <AccountCreationFailedPage
        onBackToLanding={() => setPage('landing')}
        onTryAgain={() => setPage('create-account')}
        onResetPassword={() => setPage('forgot-password')}
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
        onCreateAccount={() => setPage('create-account')}
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
          onCreateAccount={() => setPage('create-account')}
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
