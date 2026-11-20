import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line bg-white text-ink hover:border-muted',
  danger: 'bg-danger text-white hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
  ghost: 'text-muted hover:bg-cream hover:text-ink',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
}

// One button style for the whole app.
//   <Button>Save</Button>  <Button variant="secondary" size="sm">Edit</Button>
//   <Button to="/register">Sign up</Button>  (renders a link that looks like a button)
export default function Button({ variant = 'primary', size = 'md', to, className = '', type = 'button', ...props }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  if (to) return <Link to={to} className={cls} {...props} />
  return <button type={type} className={cls} {...props} />
}
