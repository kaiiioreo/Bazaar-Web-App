import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/common/Icon.jsx'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  const [searchParams] = useSearchParams()
  const [accountType, setAccountType] = useState(() => (
    searchParams.get('type') === 'vendor' ? 'vendor' : 'customer'
  ))
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice(isForgot
      ? 'Password reset is part of the account service and will be available when the backend is connected.'
      : 'This account preview is not connected to an account service yet.')
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
            : isForgot
              ? 'Forgot your password?'
              : 'Welcome back.'}
          </h2>
          <p className="auth-intro">{isRegister
            ? 'Choose how you’ll use Bazaar. You can browse as a guest without creating an account.'
            : isForgot
              ? 'We’ll send a reset link if the account service is available.'
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
            <label>
              Email address
              <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
            </label>
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
            <button className="button button-dark auth-submit" type="submit">
              {isRegister
                ? `Create ${accountType} account`
                : isForgot
                  ? 'Send reset link'
                  : 'Log in to Bazaar'}
              <Icon name="arrow" size={18} />
            </button>
          </form>

          {notice && <p className="auth-notice" role="status"><Icon name="check" size={17} /> {notice}</p>}

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
