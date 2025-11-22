import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import RegisterModal from './RegisterModal';

interface LoginModalProps {
  onClose: () => void;
  // optional callback receives username when login succeeds
  onLoggedIn?: (username?: string) => void;
}

export default function LoginModal({ onClose, onLoggedIn }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const apiError = await res.text();
        setError(apiError);
      } else {
        // show success message briefly before closing
        // Persist a basic user identity locally (using email as id until backend provides one)
        try {
          localStorage.setItem('protube_user_id', email);
          localStorage.setItem('protube_user', email);
        } catch {}
        setSuccess(true);
        setTimeout(() => {
          if (typeof onLoggedIn === 'function') onLoggedIn(email || undefined);
          else onClose();
        }, 800);
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  if (showRegister) {
    return (
      <RegisterModal
        // Close should hide the register modal AND close the parent login modal
        onClose={() => {
          setShowRegister(false);
          onClose();
        }}
        onRegistered={(registeredUsername?: string) => {
          setShowRegister(false);
          if (typeof onLoggedIn === 'function') onLoggedIn(registeredUsername);
          else onClose();
        }}
      />
    );
  }

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
          minHeight: 320,
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
            Sign in
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
            Sign in to access your videos and manage your account.
          </p>

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
            onFocus={(e) => {
              const t = e.currentTarget;
              t.style.borderColor = '#2563eb';
              t.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={(e) => {
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
            onFocus={(e) => {
              const t = e.currentTarget;
              t.style.borderColor = '#2563eb';
              t.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={(e) => {
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>
          )}
          {success && (
            <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8, textAlign: 'center' }}>User signed in successfully!</p>
          )}
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, textAlign: 'center' }}>
            Don't have an account yet?{' '}
            <span
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setShowRegister(true)}
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}
