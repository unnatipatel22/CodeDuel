import React from 'react';
import { LayoutDashboard, Code2, Users, DoorOpen, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'problems',  label: 'Problems',  icon: Code2 },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'rooms',     label: 'Rooms',     icon: DoorOpen },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { admin, logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
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
        <div style={{ padding: '8px 10px', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
            {admin?.username}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{admin?.email}</div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: 'var(--red)', width: '100%' }}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
