import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/common/Icon.jsx'
import { forgotPassword, resetPassword } from '../api/auth'
import { homeFor, useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const isReset = mode === 'reset'
  const isForgot = mode === 'forgot' || isReset
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [accountType, setAccountType] = useState(() => (
    searchParams.get('type') === 'vendor' ? 'vendor' : 'customer'
  ))
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [devLink, setDevLink] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (isReset) {
        if (form.password !== form.confirm) throw new Error('The two passwords do not match.')
        const res = await resetPassword(searchParams.get('token') || '', form.password)
        setNotice(res.message)
      } else if (isForgot) {
        const res = await forgotPassword(form.email)
        setNotice(res.message)
        setDevLink(res.dev_reset_link || '')
      } else {
        const user = isRegister
          ? await register({ name: form.name, email: form.email, password: form.password, role: accountType })
          : await login(form.email, form.password)
        const next = searchParams.get('next')
        navigate(next && next.startsWith('/') ? next : homeFor(user), { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-story">
        <Link className="brand auth-brand" to="/">
          <span className="brand-mark"><Icon name="leaf" size={21} /></span>
          <span>bazaar<span className="brand-period">.</span></span>
        </Link>
        <div className="auth-story-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> A LITTLE MORE LOCAL</span>
          <h1>{isRegister
            ? <>Come on in.<br /><span>There’s room.</span></>
            : isForgot
              ? <>Let’s get you<br /><span>back in.</span></>
              : <>Good to see<br /><span>you again.</span></>}
          </h1>
          <p>{isRegister
            ? 'Create a customer or vendor account to get started with Bazaar.'
            : isReset
              ? 'Choose a new password for your Bazaar account.'
              : isForgot
              ? 'Enter the email address linked to your Bazaar account.'
              : 'Sign in to your Bazaar account and continue where you left off.'}
          </p>
        </div>
        <div className="auth-story-foot">
          <span className="auth-quote-mark">“</span>
          <p>Small businesses make our communities feel like home.</p>
          <span>— The Bazaar community</span>
        </div>
        <span className="auth-decoration" aria-hidden="true">✳</span>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <Link className="back-link" to="/"><span aria-hidden="true">←</span> Back to exploring</Link>
          <span className="eyebrow">{isRegister
            ? 'CREATE A BAZAAR ACCOUNT'
            : isForgot
              ? 'PASSWORD RESET'
              : 'CUSTOMER, VENDOR, OR ADMIN'}
          </span>
          <h2>{isRegister
            ? 'Create your account.'
            : isReset
              ? 'Set a new password.'
              : isForgot
              ? 'Forgot your password?'
              : 'Welcome back.'}
          </h2>
          <p className="auth-intro">{isRegister
            ? 'Choose how you’ll use Bazaar. You can browse as a guest without creating an account.'
            : isReset
              ? 'Use at least 8 characters with a letter and a number.'
              : isForgot
              ? 'We’ll email you a link to reset your password.'
              : 'Use your Bazaar account email and password to sign in.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <fieldset className="account-type-field">
                  <legend>Account type</legend>
                  <div className="account-type-options">
                    {[
                      { value: 'customer', label: 'Customer' },
                      { value: 'vendor', label: 'Vendor' },
                    ].map((type) => (
                      <label className={`account-type-option${accountType === type.value ? ' is-selected' : ''}`} key={type.value}>
                        <input
                          checked={accountType === type.value}
                          name="accountType"
                          onChange={() => setAccountType(type.value)}
                          type="radio"
                          value={type.value}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label>
                  Your name
                  <input autoComplete="name" name="name" placeholder="How should we call you?" required />
                </label>
              </>
            )}
            {!isReset && (
              <label>
                Email address
                <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
              </label>
            )}
            {isReset && (
              <>
                <label>
                  New password
                  <input autoComplete="new-password" minLength="8" name="password" placeholder="At least 8 characters" required type="password" />
                </label>
                <label>
                  Confirm new password
                  <input autoComplete="new-password" minLength="8" name="confirm" placeholder="Type it again" required type="password" />
                </label>
              </>
            )}
            {!isForgot && (
              <label>
                Password
                <input
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength="8"
                  name="password"
                  placeholder="At least 8 characters"
                  required
                  type="password"
                />
              </label>
            )}
            {!isRegister && !isForgot && (
              <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>
            )}
            <button className="button button-dark auth-submit" type="submit" disabled={busy}>
              {busy
                ? 'Please wait…'
                : isRegister
                ? `Create ${accountType} account`
                : isReset
                  ? 'Save new password'
                  : isForgot
                  ? 'Send reset link'
                  : 'Log in to Bazaar'}
              <Icon name="arrow" size={18} />
            </button>
          </form>

          {error && <p className="auth-notice" role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
          {notice && <p className="auth-notice" role="status"><Icon name="check" size={17} /> {notice}</p>}
          {devLink && (
            <p className="auth-notice" style={{ fontSize: '0.85rem' }}>
              Email is not set up yet, so here is your reset link (development only):{' '}
              <Link to={devLink.replace(/^https?:\/\/[^/]+/, '')}>Open reset page</Link>
            </p>
          )}
          {isReset && notice && <p className="auth-switch"><Link to="/login">Go to log in</Link></p>}

          {isRegister && accountType === 'vendor' && (
            <p className="auth-admin-note">After signing up, you’ll fill in a short vendor application for the Admin to review.</p>
          )}
          {isRegister && (
            <p className="auth-admin-note">Admin accounts are provided by the Bazaar team and can’t be registered here.</p>
          )}
          <p className="auth-switch">
            {isForgot
              ? <>Remembered it? <Link to="/login">Back to log in</Link></>
              : isRegister
                ? <>Already have an account? <Link to="/login">Log in</Link></>
                : <>New to Bazaar? <Link to="/register">Create an account</Link></>}
          </p>
          {!isForgot && (
            <p className="auth-terms">Guests can browse products, vendors, and bazaar schedules without an account.</p>
          )}
        </div>
      </div>
    </section>
  )
}
