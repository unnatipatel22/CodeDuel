import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import GameArena from './components/GameArena';
import Landing from './components/Landing';
import OAuthCallback from './components/OAuthCallback';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [room, setRoom] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedOutView, setLoggedOutView] = useState('landing');
  const [initialIsLogin, setInitialIsLogin] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (room && token) {
      const socketUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      const newSocket = io(socketUrl, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });
      newSocket.on('connect_error', (err) => {
        console.error('Socket connect_error:', err.message || err);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [room, token]);

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setRoom(null);
    setLoggedOutView('landing');
    if (socket) {
      socket.disconnect();
    }
  };

  const handleCreateRoom = (newRoom) => {
    setRoom(newRoom);
  };

  const handleJoinRoom = (joinedRoom) => {
    setRoom(joinedRoom);
  };

  const handleLeaveRoom = () => {
    setRoom(null);
    if (socket) {
      socket.disconnect();
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Loading CodeDuel...
      </div>
    );
  }

  let content;

  if (!token) {
    if (loggedOutView === 'landing') {
      content = (
        <Landing
          onNavigateToAuth={(isLoginMode) => {
            setInitialIsLogin(isLoginMode);
            setLoggedOutView('auth');
          }}
        />
      );
    } else {
      content = (
        <Auth
          initialIsLogin={initialIsLogin}
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setLoggedOutView('landing')}
        />
      );
    }
  } else if (room) {
    content = (
      <GameArena
        user={user}
        token={token}
        initialRoom={room}
        socket={socket}
        onLeave={handleLeaveRoom}
      />
    );
  } else {
    content = (
      <Lobby
        user={user}
        setUser={setUser}
        token={token}
        onLogout={handleLogout}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // OAuth callback route
  if (window.location.pathname === '/oauth-callback' && !token) {
    return <OAuthCallback onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      {content}
    </>
  );
}
