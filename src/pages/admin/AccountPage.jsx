import { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useContent } from '../../context/ContentContext.jsx';
import { backend, resetLocalPreview } from '../../lib/api.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

export default function AccountPage() {
  useDocumentTitle('Account');
  const { user, signOut } = useAuth();
  const { reload } = useContent();
  const [confirmReset, setConfirmReset] = useState(false);
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : null;

  return (
    <>
      <AdminPageHeader title="Account" description="Your administrator session." />
      <section className="admin-panel">
        <dl className="detail-list">
          <div>
            <dt>Signed in as</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{backend === 'supabase' ? 'Supabase (published)' : 'Local preview (this browser only)'}</dd>
          </div>
          {lastSignIn ? (
            <div>
              <dt>Last sign-in</dt>
              <dd>{lastSignIn}</dd>
            </div>
          ) : null}
        </dl>
        <div className="admin-panel__actions">
          <button type="button" className="btn" onClick={signOut}>
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </div>
      </section>

      <section className="admin-panel">
        <h2 className="admin-panel__title">Access</h2>
        <p className="muted">
          There is no public registration. New administrators are created in Supabase Authentication and added to the{' '}
          <code>admins</code> table. Every change is checked by the database, not only by this page.
        </p>
      </section>

      {backend === 'local' ? (
        <section className="admin-panel">
          <h2 className="admin-panel__title">Local preview data</h2>
          <p className="muted">Clears everything saved in this browser’s preview and restores the starting content.</p>
          <div className="admin-panel__actions">
            <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
              Reset preview data
            </button>
          </div>
          <ConfirmDialog
            open={confirmReset}
            title="Reset local preview?"
            message="All members, officers, photos, and settings saved in this browser’s preview will be erased."
            confirmLabel="Reset"
            onCancel={() => setConfirmReset(false)}
            onConfirm={async () => {
              resetLocalPreview();
              await reload();
              setConfirmReset(false);
            }}
          />
        </section>
      ) : null}
    </>
  );
}
