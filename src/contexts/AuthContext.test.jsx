import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock firebase before any component imports
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}))

import AuthContext from './AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'].includes(key)
        )
      )
      return <div {...filteredProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

/**
 * Helper to render components with a controlled AuthContext value.
 */
function renderWithAuth(ui, { authValue, initialEntries = ['/'] } = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  )
}

function buildAuthValue(overrides = {}) {
  return {
    user: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    verifyPin: vi.fn(),
    setPin: vi.fn(),
    ...overrides,
  }
}

describe('ProtectedRoute — unauthenticated redirect', () => {
  it('redirects to /login when user is null', () => {
    const authValue = buildAuthValue({ user: null, loading: false })

    renderWithAuth(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { authValue, initialEntries: ['/'] }
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('renders child route when user is authenticated', () => {
    const authValue = buildAuthValue({
      user: { uid: 'u1', email: 'test@test.com' },
      loading: false,
    })

    renderWithAuth(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { authValue, initialEntries: ['/'] }
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('shows loading spinner while auth state is resolving', () => {
    const authValue = buildAuthValue({ user: null, loading: true })

    renderWithAuth(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { authValue, initialEntries: ['/'] }
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

describe('LoginPage — error message display on auth failure', () => {
  it('displays error when Google sign-in fails', async () => {
    const user = userEvent.setup()
    const signInWithGoogle = vi.fn().mockRejectedValue(new Error('Popup closed by user'))
    const authValue = buildAuthValue({ signInWithGoogle })

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { authValue, initialEntries: ['/login'] }
    )

    await user.click(screen.getByRole('button', { name: /sign in with google/i }))

    await waitFor(() => {
      expect(screen.getByText('Popup closed by user')).toBeInTheDocument()
    })
  })

  it('displays error when email sign-in fails', async () => {
    const user = userEvent.setup()
    const signInWithEmail = vi.fn().mockRejectedValue(new Error('Incorrect email or password'))
    const authValue = buildAuthValue({ signInWithEmail })

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { authValue, initialEntries: ['/login'] }
    )

    await user.type(screen.getByPlaceholderText('Email'), 'bad@test.com')
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password')).toBeInTheDocument()
    })
  })

  it('keeps user on login page after auth failure', async () => {
    const user = userEvent.setup()
    const signInWithEmail = vi.fn().mockRejectedValue(new Error('Auth failed'))
    const authValue = buildAuthValue({ signInWithEmail })

    renderWithAuth(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { authValue, initialEntries: ['/login'] }
    )

    await user.type(screen.getByPlaceholderText('Email'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('Password'), 'pass123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Auth failed')).toBeInTheDocument()
    })

    // Still on login page — dashboard not rendered
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.getByText('DearMe ✨')).toBeInTheDocument()
  })
})
