import { useState } from 'react'
import Icon from './Icon.jsx'

// Password box with a Show/Hide button so people can check what they typed.
// Takes the same props as a normal <input> (name, placeholder, autoComplete, ...).
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false)
  return (
    <span className="password-field">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={17} />
        <span>{visible ? 'Hide' : 'Show'}</span>
      </button>
    </span>
  )
}
