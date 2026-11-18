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
import ForgotPasswordPage from './components/ForgotPasswordPage'
import SendingResetLinkPage from './components/SendingResetLinkPage'
import ResetLinkSentPage from './components/ResetLinkSentPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import SavingPasswordPage from './components/SavingPasswordPage'
import PasswordUpdatedPage from './components/PasswordUpdatedPage'
import SigningInLoadingPage from './components/SigningInLoadingPage'
import PageTransition from './components/PageTransition'

function App() {
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'create-account' | 'creating-account' | 'account-failed' | 'verify-email' | 'verification-failed' | 'account-verified' | 'forgot-password' | 'sending-reset-link' | 'check-inbox' | 'verifying-link' | 'reset-password' | 'matching-password' | 'password-reset-failed' | 'saving-password' | 'password-updated' | 'signing-in' | 'sign-in-failed' | 'dashboard'
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

  let content

  if (page === 'dashboard') {
    content = (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Dashboard (coming soon)</h1>
        <button className="mt-4 underline" onClick={() => setPage('landing')}>
          Sign out
        </button>
      </div>
    )
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
