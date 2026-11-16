import { useState } from 'react'
import Hero from './components/Hero'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './components/LoginPage'
import SigningInPage from './components/SigningInPage'

function App() {
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)
  const [page, setPage] = useState('landing') // 'landing' | 'login' | 'signing-in' | 'dashboard'

  const acceptCredentials = () => {
    setPage('signing-in')
    setTimeout(() => setPage('dashboard'), 2200)
  }

  if (page === 'dashboard') {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Dashboard (coming soon)</h1>
        <button className="mt-4 underline" onClick={() => setPage('landing')}>
          Sign out
        </button>
      </div>
    )
  }

  if (page === 'signing-in') {
    return <SigningInPage />
  }

  if (page === 'login') {
    return (
      <LoginPage
        onBackToLanding={() => setPage('landing')}
        onSignIn={async (email, password) => {
          await new Promise((r) => setTimeout(r, 600))
          if (password !== 'demo') throw new Error('bad login')
          acceptCredentials()
        }}
        onDemoLogin={acceptCredentials}
        onCreateAccount={() =>
          window.alert('Account creation is coming soon.')
        }
        onForgotPassword={() =>
          window.alert('Password reset is coming soon.')
        }
      />
    )
  }

  return (
    <>
      <Hero entering={entering} onLogin={() => setPage('login')} />
      {loading ? (
        <LoadingScreen
          onReveal={() => setEntering(true)}
          onDone={() => setLoading(false)}
        />
      ) : null}
    </>
  )
}

export default App