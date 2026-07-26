import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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

  const inputStyle = {
    width: '100%',
    padding: '11px 14px 11px 42px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontFamily: 'var(--font)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="login-root">
      {/* Ambient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            marginBottom: '18px',
            boxShadow: '0 0 24px rgba(0,242,254,0.25)',
          }}>
            <Terminal size={26} color="#020617" />
          </div>

          <h1 style={{
            fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>
            CodeDuel Admin
          </h1>
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
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{
              position: 'absolute', left: '13px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="email"
              placeholder="Admin email"
              required
              style={inputStyle}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,242,254,0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,242,254,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{
              position: 'absolute', left: '13px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Password"
              required
              style={{ ...inputStyle, paddingRight: '42px' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(0,242,254,0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,242,254,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute', right: '13px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cyan"
            style={{
              width: '100%', padding: '12px',
              justifyContent: 'center',
              marginTop: '6px', fontSize: '0.92rem',
              borderRadius: '12px',
            }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
              : 'Enter Admin Panel'
            }
          </button>
        </form>

        <div style={{
          marginTop: '24px', textAlign: 'center',
          fontSize: '0.74rem', color: 'var(--text-muted)',
        }}>
          Run{' '}
          <code style={{
            fontFamily: 'var(--mono)', color: 'var(--cyan)',
            background: 'var(--cyan-dim)', padding: '1px 7px', borderRadius: '5px',
            border: '1px solid rgba(0,242,254,0.15)',
          }}>
            node makeAdmin.js your@email.com
          </code>
          {' '}to promote a user
        </div>
      </div>
    </div>
  );
}
