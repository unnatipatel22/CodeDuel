import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.isAdmin) {
          setAdmin(parsed);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    const { token, user } = res.data;
    if (!user.isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdmin(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
