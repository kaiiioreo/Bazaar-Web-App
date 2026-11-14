import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import LoadState from '../../components/common/LoadState';
import formatDate from '../../components/customer/formatDate';
import useApi from '../../hooks/useApi';
import { updateMe } from '../../api/auth';
import { getMyReviews } from '../../api/customer';
import { useAuth } from '../../context/AuthContext';

const field = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20';

// Account & profile (SRS 3.1.3.3) plus the customer's own reviews.
export default function Account() {
  const { user, setUser } = useAuth();
  const reviews = useApi(() => getMyReviews(), []);
  const [form, setForm] = useState({ name: user.name, email: user.email, current_password: '', new_password: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      const body = { name: form.name, email: form.email };
      if (form.new_password) Object.assign(body, { current_password: form.current_password, new_password: form.new_password });
      const data = await updateMe(body);
      setUser(data.user);
      setForm((f) => ({ ...f, current_password: '', new_password: '' }));
      setMsg({ type: 'ok', text: 'Your account was updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-10 py-8 lg:grid-cols-2">
      <section>
        <h1 className="text-3xl font-extrabold text-teal-950">My account</h1>
        <form onSubmit={save} className="mt-6 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <label className="block text-sm font-medium">Name
            <input required value={form.name} onChange={set('name')} className={field} />
          </label>
          <label className="block text-sm font-medium">Email
            <input required type="email" value={form.email} onChange={set('email')} className={field} />
          </label>
          <fieldset className="space-y-3 border-t border-stone-100 pt-4">
            <legend className="pt-4 text-sm font-semibold text-stone-800">Change password (optional)</legend>
            <label className="block text-sm font-medium">Current password
              <input type="password" autoComplete="current-password" value={form.current_password} onChange={set('current_password')} className={field} />
            </label>
            <label className="block text-sm font-medium">New password
              <input type="password" autoComplete="new-password" minLength={8} value={form.new_password} onChange={set('new_password')} placeholder="At least 8 characters with a number" className={field} />
            </label>
          </fieldset>
          {msg.text && (
            <p className={`text-sm ${msg.type === 'ok' ? 'text-green-700' : 'text-red-700'}`} role="status">{msg.text}</p>
          )}
          <button type="submit" disabled={busy} className="rounded-full bg-teal-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-teal-950">My reviews</h2>
        {reviews.loading || reviews.error ? (
          <LoadState loading={reviews.loading} error={reviews.error} onRetry={reviews.reload} />
        ) : reviews.data.length === 0 ? (
          <p className="mt-4 text-stone-600">You haven’t reviewed any vendors yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.data.map((r) => (
              <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/customer/vendors/${r.vendorId}`} className="font-semibold text-teal-900 hover:underline">{r.vendorName}</Link>
                  <span className="text-xs text-stone-500">{formatDate(r.date)}</span>
                </div>
                <StarRating rating={r.rating} />
                <p className="mt-1 text-sm text-stone-700">{r.comment}</p>
                <Link to={`/customer/vendors/${r.vendorId}`} className="mt-2 inline-block text-xs text-teal-800 underline">Edit or delete</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
