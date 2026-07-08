import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '11px 14px 11px 42px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div className="login-root">
      <div className="login-card fade-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '54px', height: '54px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            marginBottom: '16px',
          }}>
            <Terminal size={26} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
          }}>CodeDuel Admin</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
            Restricted access — admins only
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <Shield size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="email" placeholder="Admin email" required
              style={inp} value={email} onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type={showPwd ? 'text' : 'password'} placeholder="Password" required
              style={{ ...inp, paddingRight: '42px' }} value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
              position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit" disabled={loading}
            className="btn btn-cyan"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '4px', fontSize: '0.9rem' }}
          >
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Enter Admin Panel'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Run <code style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '1px 6px', borderRadius: '4px' }}>node makeAdmin.js your@email.com</code> to promote a user
        </div>
      </div>
    </div>
  );
}
