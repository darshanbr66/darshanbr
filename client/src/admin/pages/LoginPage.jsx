import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AdminContext'
import { TextInput } from '../components/fields'

export default function LoginPage() {
  const { session, login, expiredNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to={location.state?.from || '/admin'} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={handleSubmit} noValidate>
        <span className="adm-logo adm-logo--lg">D</span>
        <h1>Sign in to your CMS</h1>
        <p className="adm-muted">Manage your portfolio content.</p>

        {expiredNotice && !error && (
          <p className="adm-alert adm-alert--info">Your session ended. Please sign in again.</p>
        )}
        {error && (
          <p className="adm-alert adm-alert--error" role="alert">
            {error}
          </p>
        )}

        <TextInput label="Email" type="email" autoComplete="username" value={email} onChange={setEmail} autoFocus />
        <TextInput
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <Link to="/" className="adm-login__back">
          ← Back to portfolio
        </Link>
      </form>
    </div>
  )
}
