import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
  const { admin } = useAuth();

  return (
    <div className="admin-layout">
      <Sidebar currentPage="dashboard" onNavigate={() => {}} />
      <div className="admin-main-area">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
