'use client';

import { useCallback, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
  brands: string[];
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState('');

  // Remember the admin secret between visits (only in the browser).
  useEffect(() => {
    const saved = localStorage.getItem('admin_secret');
    if (saved) setSecret(saved);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: secret ? { 'x-admin-secret': secret } : {},
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setUsers(data.users || []);
      if (secret) localStorage.setItem('admin_secret', secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, Arial, sans-serif',
        maxWidth: '960px',
        margin: '0 auto',
        color: '#1a1a1a',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>👥 Signups</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
            {users.length} registered {users.length === 1 ? 'user' : 'users'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '0.9rem',
            }}
          />
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              background: '#111',
              color: '#fff',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '0.9rem',
            }}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '0.75rem 1rem',
            background: '#fdecec',
            color: '#a11',
            border: '1px solid #f5c2c2',
            borderRadius: '6px',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '0.6rem 0.5rem' }}>Email</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Brand(s)</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Credits</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Signed up</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 0.5rem', textAlign: 'center', color: '#999' }}>
                  No users yet.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 500 }}>{u.email}</td>
                <td style={{ padding: '0.6rem 0.5rem', color: '#555' }}>
                  {u.brands.length ? u.brands.join(', ') : '—'}
                </td>
                <td style={{ padding: '0.6rem 0.5rem' }}>{u.credits}</td>
                <td style={{ padding: '0.6rem 0.5rem', color: '#555' }}>{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
