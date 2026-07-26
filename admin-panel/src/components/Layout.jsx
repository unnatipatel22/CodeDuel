import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="admin-layout">
      {/* Ambient glow orbs — matches CodeDuel frontend */}
      <div className="admin-orb admin-orb-1" />
      <div className="admin-orb admin-orb-2" />
      <div className="admin-orb admin-orb-3" />

      <Sidebar currentPage="dashboard" onNavigate={() => {}} />

      <div className="admin-main-area">
        <main className="admin-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
