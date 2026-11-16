import { useState } from 'react'
import Hero from './components/Hero'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import LoginPage from './components/LoginPage'
import CreateAccountPage from './components/CreateAccountPage'
import CreateAccountLoadingPage from './components/CreateAccountLoadingPage'
import VerifyEmailPage from './components/VerifyEmailPage'
import AccountVerifiedPage from './components/AccountVerifiedPage'
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
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'create-account' | 'creating-account' | 'verify-email' | 'account-verified' | 'forgot-password' | 'sending-reset-link' | 'check-inbox' | 'reset-password' | 'saving-password' | 'password-updated' | 'signing-in' | 'dashboard'
  const [pendingEmail, setPendingEmail] = useState('')

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  const submitAccount = (email) => {
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
        onVerify={async () => {
          await new Promise((r) => setTimeout(r, 600))
          setPage('account-verified')
        }}
        onResend={() => window.alert('We sent a new code to ' + pendingEmail)}
        onUseDifferentEmail={() => setPage('create-account')}
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
        onOpenResetLink={() => setPage('reset-password')}
        onResendLink={() => window.alert('We sent a new reset link to ' + pendingEmail)}
      />
    )
  } else if (page === 'reset-password') {
    content = (
      <ResetPasswordPage
        onBackToLanding={() => setPage('landing')}
        onBackToSignIn={() => setPage('login')}
        onSaveNewPassword={async () => {
          setPage('saving-password')
          setTimeout(() => setPage('password-updated'), 2200)
        }}
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
          submitAccount(email)
        }}
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
        onCreateAccount={() => setPage('create-account')}
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
