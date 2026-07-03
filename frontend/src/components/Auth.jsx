import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Mail, User, Lock, ArrowRight, Eye, EyeOff, Terminal } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Auth({ onAuthSuccess, initialIsLogin = true, onBack }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password };

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

  return (
    <div style={{
      position: 'fixed', /* Fixed use kiya taaki poori screen ke context me center ho sake */
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center', /* Vertical centering */
      justifyContent: 'center', /* Horizontal centering */
      padding: '20px',
      overflow: 'hidden',
      background: 'transparent',
      zIndex: 9999 /* Ensure ye baki contents ke upar center me dikhe */
    }}>
      <div className="glass-panel glass-panel-glow-cyan animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              outline: 'none',
              fontWeight: '600',
              zIndex: 10
            }}
          >
            &larr; Back
          </button>
        )}
        {/* Decorative Grid Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-cyan), var(--color-purple), transparent)'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="float-slow" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            marginBottom: '16px',
            color: 'var(--color-cyan)',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)'
          }}>
            <Terminal size={32} />
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px'
          }}>
            CODEDUEL
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Prove your coding dominance in real-time duels' : 'Create an account to join the arena'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 61, 0, 0.08)',
            border: '1px solid rgba(255, 61, 0, 0.25)',
            color: '#ff8a80',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                placeholder="Username"
                className="form-input"
                required
                minLength={3}
                maxLength={20}
                style={{ paddingLeft: '44px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="email"
              placeholder="Email address"
              className="form-input"
              required
              style={{ paddingLeft: '44px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="form-input"
              required
              minLength={6}
              style={{ paddingLeft: '44px', paddingRight: '44px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cyan"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Enter Arena' : 'Register Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-cyan)',
              fontWeight: '600',
              marginLeft: '6px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}