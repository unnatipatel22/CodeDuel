import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Mail, User, Lock, ArrowRight, Eye, EyeOff, Terminal, GraduationCap, Briefcase, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');
const BACKEND_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+', 'Postgraduate'];

// Google SVG icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// GitHub SVG icon
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function Auth({ onAuthSuccess, initialIsLogin = true, onBack }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New profile fields
  const [profession, setProfession] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [age, setAge] = useState('');

  // OAuth providers configured on the backend
  const [providers, setProviders] = useState({ google: false, github: false });

  useEffect(() => {
    // Check which OAuth providers are actually available
    axios.get(`${API_BASE}/auth/providers`)
      .then(r => setProviders(r.data))
      .catch(() => setProviders({ google: false, github: false }));
  }, []);

  const hasOAuth = providers.google || providers.github;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email, password }
        : {
          username, email, password,
          profession: profession || undefined,
          yearOfStudy: profession === 'student' ? yearOfStudy : undefined,
          age: age ? Number(age) : undefined,
        };

      const response = await axios.post(`${API_BASE}${endpoint}`, payload);

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user, token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px 11px 44px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.92rem',
    outline: 'none',
    fontFamily: 'var(--font-primary)',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const selectStyle = {
    ...inputStyle,
    paddingLeft: '44px',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  };

  return (
    <div className="auth-screen" style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      overflow: 'auto',
      background: 'transparent',
      zIndex: 9999,
    }}>
      <div className="glass-panel glass-panel-glow-cyan animate-fade-in auth-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 1,
        margin: 'auto',
      }}>
        {/* Back button */}
        {onBack && (
          <button onClick={onBack} style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'none', border: 'none',
            color: 'var(--text-secondary)', fontSize: '0.85rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '4px', fontWeight: '600', zIndex: 10,
          }}>
            ← Back
          </button>
        )}

        {/* Header */}
        <div className="auth-header-copy" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="float-slow" style={{ marginBottom: '14px' }}>
            <img src="/logo.png" alt="CodeDuel Logo" className="auth-logo" style={{ width: '56px', height: '56px', borderRadius: 0 }} />
          </div>
          <h1 className="auth-title" style={{
            fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>CodeDuel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isLogin ? 'Prove your coding dominance in real-time duels' : 'Create an account to join the arena'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,61,0,0.08)', border: '1px solid rgba(255,61,0,0.25)',
            color: '#ff8a80', padding: '10px 14px', borderRadius: '8px',
            fontSize: '0.84rem', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Shield size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* OAuth Buttons — always visible */}
        <div className="auth-oauth-stack" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            title={providers.google ? '' : 'Requires Google credentials in .env'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '11px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${providers.google ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '10px', cursor: 'pointer',
              color: providers.google ? '#e8eaed' : '#6b7280',
              fontSize: '0.9rem', fontWeight: '600',
              fontFamily: 'var(--font-primary)',
              opacity: providers.google ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.opacity = providers.google ? '1' : '0.6'; }}
          >
            <GoogleIcon />
            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
            {!providers.google && <span style={{ fontSize: '0.7rem', marginLeft: 'auto', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: '20px', fontWeight: 700 }}>Setup needed</span>}
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            title={providers.github ? '' : 'Requires GitHub credentials in .env'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '11px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${providers.github ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '10px', cursor: 'pointer',
              color: providers.github ? '#e8eaed' : '#6b7280',
              fontSize: '0.9rem', fontWeight: '600',
              fontFamily: 'var(--font-primary)',
              opacity: providers.github ? 1 : 0.6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.opacity = providers.github ? '1' : '0.6'; }}
          >
            <GitHubIcon />
            <span>{isLogin ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
            {!providers.github && <span style={{ fontSize: '0.7rem', marginLeft: 'auto', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: '20px', fontWeight: 700 }}>Setup needed</span>}
          </button>
        </div>

        {/* Divider */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            position: 'relative',
            padding: '0', color: 'var(--text-muted)', fontSize: '0.75rem',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>or with email</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username (signup only) */}
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={17} style={iconStyle} />
              <input
                type="text" placeholder="Username"
                style={inputStyle} required minLength={3} maxLength={20}
                value={username} onChange={e => setUsername(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={17} style={iconStyle} />
            <input
              type="email" placeholder="Email address"
              style={inputStyle} required
              value={email} onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} style={iconStyle} />
            <input
              type={showPassword ? 'text' : 'password'} placeholder="Password"
              style={{ ...inputStyle, paddingRight: '44px' }} required minLength={6}
              value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* ── Signup extra fields ── */}
          {!isLogin && (
            <>
              {/* Profession */}
              <div style={{ position: 'relative' }}>
                <Briefcase size={17} style={iconStyle} />
                <select
                  style={selectStyle}
                  value={profession}
                  onChange={e => { setProfession(e.target.value); setYearOfStudy(''); }}
                >
                  <option value="" style={{ background: '#0f111a' }}>Select Profession</option>
                  <option value="student" style={{ background: '#0f111a' }}>🎓 Student</option>
                  <option value="other" style={{ background: '#0f111a' }}>💼 Working Professional / Other</option>
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>▾</div>
              </div>

              {/* If student: year of study */}
              {profession === 'student' && (
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={17} style={iconStyle} />
                  <select
                    style={selectStyle}
                    value={yearOfStudy}
                    onChange={e => setYearOfStudy(e.target.value)}
                    required
                  >
                    <option value="" style={{ background: '#0f111a' }}>Select Year of Study</option>
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y} style={{ background: '#0f111a' }}>{y}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>▾</div>
                </div>
              )}

              {/* Age (always shown on signup) */}
              <div style={{ position: 'relative' }}>
                <Calendar size={17} style={iconStyle} />
                <input
                  type="number" placeholder="Age (optional)"
                  style={inputStyle} min={10} max={100}
                  value={age} onChange={e => setAge(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,242,254,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="btn btn-cyan"
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '4px' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Enter Arena' : 'Create Account'}
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Switch login/signup */}
        <div style={{
          textAlign: 'center', marginTop: '24px', paddingTop: '18px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          fontSize: '0.88rem', color: 'var(--text-secondary)',
        }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setProfession(''); setYearOfStudy(''); setAge(''); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-cyan)', fontWeight: '700',
              marginLeft: '6px', cursor: 'pointer',
              fontFamily: 'var(--font-primary)', fontSize: '0.88rem',
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
