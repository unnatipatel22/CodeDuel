import React from 'react';
import { LayoutDashboard, Code2, Users, DoorOpen, Trophy, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'problems',    label: 'Problems',     icon: Code2 },
  { id: 'users',       label: 'Users',        icon: Users },
  { id: 'rooms',       label: 'Rooms',        icon: DoorOpen },
  { id: 'leaderboard', label: 'Leaderboard',  icon: Trophy },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { admin, logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={17} color="#020617" fill="#020617" />
        </div>
        <div>
          <div className="sidebar-logo-text">CodeDuel</div>
          <div className="sidebar-logo-badge">ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-label">Navigation</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${currentPage === id ? ' active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Admin info pill */}
        <div style={{
          padding: '10px 10px',
          marginBottom: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800, color: '#020617',
              flexShrink: 0,
            }}>
              {admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text)', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {admin?.username || 'Admin'}
              </div>
              <div style={{
                fontSize: '0.68rem', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {admin?.email}
              </div>
            </div>
          </div>
        </div>

        <button
          className="nav-item"
          onClick={logout}
          style={{ color: 'var(--red)', width: '100%' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,82,82,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
