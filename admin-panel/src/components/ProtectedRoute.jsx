import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { admin, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !admin) {
      navigate('/login', { replace: true });
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!admin) return null;

  return <Outlet />;
}
