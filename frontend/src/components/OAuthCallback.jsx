import React, { useEffect, useState } from 'react';

const ERROR_MESSAGES = {
  google_not_configured: {
    title: 'Google OAuth Not Set Up',
    icon: '🔧',
    msg: 'Google sign-in credentials are not configured on the server yet.',
    steps: [
      'Go to console.cloud.google.com',
      'Create a project → Enable "Google+ API"',
      'OAuth 2.0 → Create credentials → Web application',
      'Redirect URI: http://localhost:5000/api/auth/google/callback',
      'Copy Client ID & Secret → add to your .env file',
    ],
    env: 'GOOGLE_CLIENT_ID=your_client_id\nGOOGLE_CLIENT_SECRET=your_client_secret',
  },
  github_not_configured: {
    title: 'GitHub OAuth Not Set Up',
    icon: '🔧',
    msg: 'GitHub sign-in credentials are not configured on the server yet.',
    steps: [
      'Go to github.com/settings/developers',
      'Click "New OAuth App"',
      'Homepage URL: http://localhost:5173',
      'Callback URL: http://localhost:5000/api/auth/github/callback',
      'Copy Client ID & Secret → add to your .env file',
    ],
    env: 'GITHUB_CLIENT_ID=your_client_id\nGITHUB_CLIENT_SECRET=your_client_secret',
  },
  google_failed: { title: 'Google Sign-In Failed', icon: '❌', msg: 'Google authentication was rejected. Please try again.' },
  github_failed: { title: 'GitHub Sign-In Failed', icon: '❌', msg: 'GitHub authentication was rejected. Please try again.' },
};

export default function OAuthCallback({ onAuthSuccess }) {
  const [status, setStatus] = useState('loading');
  const [errorKey, setErrorKey] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    const error = params.get('error');

    if (error) {
      setErrorKey(error);
      setStatus('error');
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user, token);
        window.history.replaceState({}, document.title, '/');
        setStatus('success');
      } catch {
        setErrorKey('parse_failed');
        setStatus('error');
      }
    } else {
      setErrorKey('no_data');
      setStatus('error');
    }
  }, []);

  const errInfo = ERROR_MESSAGES[errorKey] || {
    title: 'Login Failed',
    icon: '⚠️',
    msg: 'Something went wrong during sign-in. Please try again.',
  };
  const isSetupError = errorKey?.includes('not_configured');

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '20px', overflow: 'auto',
    }}>
      {status === 'loading' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '3px solid rgba(0,242,254,0.15)',
            borderTop: '3px solid var(--color-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>Completing sign-in...</div>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          background: 'var(--bg-card, #131721)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '36px 32px', width: '100%',
          maxWidth: isSetupError ? '520px' : '400px',
          display: 'flex', flexDirection: 'column', gap: '18px',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', display: 'none' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{errInfo.icon}</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{errInfo.title}</h2>
            <p style={{ color: 'var(--text-secondary, #a0a8b8)', fontSize: '0.9rem', lineHeight: 1.5 }}>{errInfo.msg}</p>
          </div>

          {/* Setup steps for not_configured errors */}
          {isSetupError && errInfo.steps && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted, #5a6380)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                How to fix:
              </div>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
                {errInfo.steps.map((s, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary, #a0a8b8)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s}</li>
                ))}
              </ol>
              <div style={{
                marginTop: '14px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #5a6380)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Add to your .env file:
                </div>
                <pre style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem',
                  color: '#00f2fe',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>{errInfo.env}</pre>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted, #5a6380)' }}>
                ↺ Restart the backend after adding credentials, then try again.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '4px' }}>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '10px 24px',
                background: 'rgba(0,242,254,0.1)',
                border: '1px solid rgba(0,242,254,0.25)',
                borderRadius: '8px',
                color: '#00f2fe',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
