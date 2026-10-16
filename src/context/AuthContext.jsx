import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured, isLocalPreviewAllowed } from '../lib/supabase.js';

const AuthContext = createContext(null);
const PREVIEW_KEY = 'tjkt:local-preview-session';

async function checkAdmin(userId) {
  // RLS lets a signed-in user read only their own row in admins.
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, isAdmin: false, error: '' });

  const resolveSession = useCallback(async (session) => {
    if (!session) {
      setState({ status: 'signed-out', user: null, isAdmin: false, error: '' });
      return;
    }
    try {
      const isAdmin = await checkAdmin(session.user.id);
      setState({ status: 'signed-in', user: session.user, isAdmin, error: '' });
    } catch (err) {
      setState({ status: 'signed-in', user: session.user, isAdmin: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const preview = isLocalPreviewAllowed && sessionStorage.getItem(PREVIEW_KEY) === '1';
      setState({
        status: preview ? 'signed-in' : 'signed-out',
        user: preview ? { email: 'Local preview' } : null,
        isAdmin: preview,
        error: '',
      });
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => resolveSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer to avoid calling Supabase inside its own auth callback.
      window.setTimeout(() => resolveSession(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [resolveSession]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message);
  }, []);

  const startLocalPreview = useCallback(() => {
    if (!isLocalPreviewAllowed) return;
    sessionStorage.setItem(PREVIEW_KEY, '1');
    setState({ status: 'signed-in', user: { email: 'Local preview' }, isAdmin: true, error: '' });
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    sessionStorage.removeItem(PREVIEW_KEY);
    setState({ status: 'signed-out', user: null, isAdmin: false, error: '' });
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signOut, startLocalPreview }),
    [state, signIn, signOut, startLocalPreview],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
