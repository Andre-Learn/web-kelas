import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { isSupabaseConfigured, isLocalPreviewAllowed } from '../../lib/supabase.js';
import { TextInput } from '../../components/FormControls.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import Icon from '../../components/Icon.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import BrandMark from '../../components/BrandMark.jsx';

export default function LoginPage() {
  useDocumentTitle('Administrator sign in');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const target = location.state?.from || '/admin';

  if (auth.status === 'signed-in' && auth.isAdmin) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await auth.signIn(email.trim(), password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login__top">
        <Link to="/" className="text-link">
          <Icon name="chevronLeft" size={16} />
          Back to site
        </Link>
        <ThemeToggle />
      </div>
      <main className="login__card">
        <span className="navbar__mark" aria-hidden="true">
          <BrandMark />
        </span>
        <h1 className="login__title">Administrator sign in</h1>
        <p className="login__desc">For class administrators only. Accounts are created by an existing administrator.</p>

        {isSupabaseConfigured ? (
          <form className="form" onSubmit={submit} noValidate>
            <TextInput label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextInput
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? (
              <p className="form__error" role="alert">
                <Icon name="alert" size={16} />
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <div className="login__notice">
            <p>
              <strong>Sign-in is not available yet.</strong> The site is not connected to Supabase. Set{' '}
              <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then run <code>supabase/schema.sql</code>.
            </p>
            {isLocalPreviewAllowed ? (
              <>
                <p>You can explore the dashboard in local preview. Changes stay in this browser and are never published.</p>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={() => {
                    auth.startLocalPreview();
                    navigate(target, { replace: true });
                  }}
                >
                  Open local preview
                </button>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
