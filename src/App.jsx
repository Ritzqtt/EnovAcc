import { useEffect, useLayoutEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import InitialLoadingScreen from './components/InitialLoadingScreen'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'
import ChartOfAccounts from './components/ChartOfAccounts'
import JournalEntries from './components/JournalEntries'
import GeneralLedger from './components/GeneralLedger'
import InvoicesReceivables from './components/InvoicesReceivables'
import BillsPayables from './components/BillsPayables'
import AuthSurface from './components/auth/AuthSurface'
import AccountSettings from './components/AccountSettings'
import ChangePassword from './components/ChangePassword'

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  'chart-of-accounts': 'Chart of Accounts',
  'journal-entries': 'Journal Entries',
  'general-ledger': 'General Ledger',
  'invoices-receivables': 'Invoices & Receivables',
  'bills-payables': 'Bills & Payables',
  'account-settings': 'Account Settings',
  'change-password': 'Change Password',
}

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

function friendlyOtpError(error) {
  const message = error?.message?.toLowerCase() ?? ''
  if (
    error?.status === 429 ||
    message.includes('rate limit') ||
    message.includes('security purposes')
  ) {
    return 'Please wait a few seconds before requesting another code.'
  }
  return "We couldn't send the code. Try again."
}

function App() {
  // If a session is stored, start on the dashboard so that the loader fades
  // out onto the dashboard instead of the landing page.
  const [page, setPage] = useState(() =>
    hasStoredSession() ? 'dashboard' : 'landing'
  )
  const [loading, setLoading] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [loaderDone, setLoaderDone] = useState(false)
  // Success message shown on the sign in screen (e.g. after a password reset).
  const [authNotice, setAuthNotice] = useState('')
  const [ledgerAccount, setLedgerAccount] = useState(null)

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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  // Retrieve the user's profile and assigned role.
  const getUserProfile = async (authUser) => {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, role_id, status, avatar_url')
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
      avatar_url: profile.avatar_url ?? null,
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

    // The "password updated" message only belongs on the sign in screen.
    if (next !== 'login') setAuthNotice('')

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

  // Runs after the sign in code is verified and the loading step is done.
  const handleLoadingComplete = () => {
    setAuthNotice('')
    window.history.replaceState({ auth: 'dashboard' }, '', authUrl('landing'))
    setPage('dashboard')
  }

  // Step 1 of sign in: check the password and profile, then email a code.
  // The password session is discarded right away; the real session is only
  // created when the correct code is verified.
  const handleSupabaseSignIn = async (email, password) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const invalid = authError.message
        ?.toLowerCase()
        .includes('invalid login credentials')
      throw new Error(
        invalid ? 'Incorrect email or password.' : authError.message,
      )
    }

    if (!authData.user) {
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Unable to retrieve authenticated user.')
    }

    try {
      // Needs the temporary session, so this runs before signing out.
      await getUserProfile(authData.user)
    } catch (profileError) {
      await supabase.auth.signOut({ scope: 'local' })
      throw profileError
    }

    // scope: 'local' only clears this browser. A plain signOut() would also
    // log the user out of their other devices.
    await supabase.auth.signOut({ scope: 'local' })

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (otpError) {
      throw new Error(friendlyOtpError(otpError))
    }

    const [name, domain] = email.split('@')
    return {
      challengeId: email,
      maskedEmail: `${name[0]}${'*'.repeat(Math.max(name.length - 1, 2))}@${domain}`,
    }
  }

  // Step 2: check the emailed code. This is what creates the real session.
  const handleVerifyOtp = async (email, code) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error || !data.user) {
      throw new Error('Incorrect or expired code. Try again.')
    }

    try {
      const userProfile = await getUserProfile(data.user)
      setCurrentUser(userProfile)
    } catch (profileError) {
      await supabase.auth.signOut({ scope: 'local' })
      throw profileError
    }
  }

  const handleResendOtp = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (error) {
      throw new Error(friendlyOtpError(error))
    }
  }

  // Forgot password, step 1: email a 6-digit code. Supabase doesn't say
  // whether the email is registered, which is intentional.
  const handleSendResetCode = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw new Error(friendlyOtpError(error))
  }

  // Step 2: check the code. This creates a temporary session.
  const handleVerifyResetCode = async (email, code) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery',
    })
    if (error || !data.session) {
      throw new Error('Incorrect or expired code. Try again.')
    }
  }

  // Step 3: save the new password.
  const handleUpdatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  // Done: clear the temporary session and go back to sign in.
  const handleResetComplete = async () => {
    await supabase.auth.signOut({ scope: 'local' })
    setAuthNotice('Your password was updated. Sign in with your new password.')
    navigateAuth('login')
  }

  const handleResetBackToSignIn = async () => {
    await supabase.auth.signOut({ scope: 'local' })
    navigateAuth('login')
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

  const handleNavigate = (label) => {
    const key = label.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')
    if (MODULES[key]) setPage(key)
  }

  const handleProfileUpdated = (updates) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const moduleProps = {
    currentUser,
  }

  const MODULES = {
    dashboard: <Dashboard />,
    'chart-of-accounts': (
      <ChartOfAccounts
        onViewLedger={(account) => {
          setLedgerAccount(account)
          handleNavigate('General Ledger')
        }}
      />
    ),
    'journal-entries': <JournalEntries />,
    'general-ledger': <GeneralLedger account={ledgerAccount} />,
    'invoices-receivables': <InvoicesReceivables />,
    'bills-payables': <BillsPayables />,
    'account-settings': (
      <AccountSettings {...moduleProps} onProfileUpdated={handleProfileUpdated} />
    ),
    'change-password': <ChangePassword {...moduleProps} />,
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
          notice={authNotice}
          onNavigate={navigateAuth}
          onSignIn={handleSupabaseSignIn}
          onSignInFailed={() => setPage('login')}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onLoadingComplete={handleLoadingComplete}
          onForgotPassword={() => setPage('forgot-password')}
          onSendResetCode={handleSendResetCode}
          onVerifyResetCode={handleVerifyResetCode}
          onResendResetCode={handleSendResetCode}
          onUpdatePassword={handleUpdatePassword}
          onResetComplete={handleResetComplete}
          onResetBackToSignIn={handleResetBackToSignIn}
        />

        {page === 'landing' && loading ? (
          <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
        ) : null}
      </>
    )
  }

  const content = MODULES[page] ?? null

  const shellUser = currentUser
    ? {
        name: currentUser.full_name,
        role: currentUser.role_name,
        email: currentUser.email,
        avatarUrl: currentUser.avatar_url,
      }
    : undefined

  return (
    <>
      <AppShell
        active={PAGE_LABELS[page]}
        user={shellUser}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      >
        <div key={page} className="content-enter">
          {content}
        </div>
      </AppShell>

      {/* On refresh, the loader sits on top of the dashboard. */}
      {page === 'dashboard' && loading ? (
        <InitialLoadingScreen onDone={() => setLoaderDone(true)} />
      ) : null}
    </>
  )
}

export default App