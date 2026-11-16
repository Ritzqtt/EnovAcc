import { useState } from 'react'
import Hero from './components/Hero'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import LoginPage from './components/LoginPage'
import CreateAccountPage from './components/CreateAccountPage'
import CreateAccountLoadingPage from './components/CreateAccountLoadingPage'
import SigningInLoadingPage from './components/SigningInLoadingPage'
import PageTransition from './components/PageTransition'

function App() {
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'create-account' | 'creating-account' | 'signing-in' | 'dashboard'

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  const submitAccount = () => {
    setPage('creating-account')
    setTimeout(() => setPage('login'), 2200)
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
  } else if (page === 'create-account') {
    content = (
      <CreateAccountPage
        onBackToLanding={() => setPage('landing')}
        onSignIn={() => setPage('login')}
        onCreateAccount={async ({ fullName, email, password }) => {
          await new Promise((r) => setTimeout(r, 600))
          if (!fullName || !email || !password) throw new Error('missing fields')
          submitAccount()
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
        onForgotPassword={() =>
          window.alert('Password reset is coming soon.')
        }
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
