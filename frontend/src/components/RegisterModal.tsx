import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  // when registration succeeds, pass the username back to the parent
  onRegistered?: (username?: string) => void;
  // when user wants to go back to the login modal without closing everything
  onBackToLogin?: () => void;
}

export default function RegisterModal({ onClose, onRegistered, onBackToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&username=${encodeURIComponent(username)}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const apiError = await res.text();
        setError(apiError);
      } else {
        try {
          localStorage.setItem('protube_user_id', username);
          localStorage.setItem('protube_user', username);
        } catch {}
        setSuccess(true);
        setTimeout(() => {
          if (typeof onRegistered === 'function') onRegistered(username);
          else onClose();
        }, 800);
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
          minWidth: 320,
          minHeight: 340,
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#374151',
            padding: 4,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 8,
              fontFamily: "'DM Serif Text', serif",
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Sign up
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
            Create your account to access all features.
          </p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
            onFocus={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#2563eb';
              t.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#d1d5db';
              t.style.boxShadow = 'none';
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
            onFocus={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#2563eb';
              t.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#d1d5db';
              t.style.boxShadow = 'none';
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
            onFocus={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#2563eb';
              t.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={e => {
              const t = e.currentTarget;
              t.style.borderColor = '#d1d5db';
              t.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 400,
            }}
          >
            {loading ? 'Registering...' : 'Sign up'}
          </button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>
          )}
          {success && (
            <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8, textAlign: 'center' }}>User signed up successfully!</p>
          )}

          {/* Link to go back to Sign in */}
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, textAlign: 'center' }}>
            Already have an account?{' '}
            <a
              href="#"
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                // prefer a callback that returns to the login modal if provided
                if (typeof onBackToLogin === 'function') {
                  onBackToLogin();
                } else {
                  onClose();
                }
              }}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}