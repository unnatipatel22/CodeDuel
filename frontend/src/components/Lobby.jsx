import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LogOut, Trophy, Swords, Zap, Loader2, ArrowRight, Bell, Crown, TrendingUp, Flame, User, Users, Briefcase } from 'lucide-react';
import DarkVeil from './DarkVeil/DarkVeil';
import MagicBento, { ParticleCard, GlobalSpotlight, BentoCardGrid } from './MagicBento';
import PracticeStats from './PracticeStats';
import PracticeHistory from './PracticeHistory';
import { normalizeTopic } from '../../../src/utils/topic.utils.js';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');

export default function Lobby({ user, setUser, token, onLogout, onCreateRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalMatches: 0, winRate: 0, totalSubmissions: 0, acceptedSubmissions: 0 });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  const [profUsername, setProfUsername] = useState(user?.username || '');
  const [profAge, setProfAge] = useState(user?.age || '');
  const [profProfession, setProfProfession] = useState(user?.profession || 'student');
  const [profSubmitting, setProfSubmitting] = useState(false);
  const [profError, setProfError] = useState('');


  const [activeView, setActiveView] = useState('dashboard');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  const [showConfig, setShowConfig] = useState(false);
  const [mode, setMode] = useState('1v1');
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  
  const [showNameModal, setShowNameModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [modalActionType, setModalActionType] = useState('create');

  const statsGridRef = useRef(null);
  const configGridRef = useRef(null);
  const leaderboardGridRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leaderboard`);
      if (res.data.success) setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setProfError('');
    setProfSubmitting(true);
    try {
      const res = await axios.put(`${API_BASE}/users/me`, {
        username: profUsername,
        age: Number(profAge),
        profession: profProfession,
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.data.success) {
        if (setUser) setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      setProfError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfSubmitting(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreate = async (nameToUse) => {
    setError('');
    setLoadingAction(true);
    try {
      const maxPlayers = mode === 'practice' ? 1 : mode === 'squad' ? 4 : 2;
      const payload = { mode, difficulty, topic: normalizeTopic(topic), timeLimit: 1800, maxPlayers, displayName: nameToUse };
      const res = await axios.post(`${API_BASE}/rooms/create`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) onCreateRoom(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
      setLoadingAction(false);
    }
  };

  const handleJoin = async (nameToUse) => {
    setError('');
    setLoadingAction(true);
    try {
      const res = await axios.post(`${API_BASE}/rooms/join`, { roomCode, displayName: nameToUse }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) onJoinRoom(res.data.room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room.');
      setLoadingAction(false);
    }
  };

  const triggerCreateFlow = () => {
    setModalActionType('create');
    setDisplayName(user?.username || '');
    setShowNameModal(true);
  };

  const triggerJoinFlow = (e) => {
    if (e) e.preventDefault();
    if (!roomCode.trim()) return;
    setModalActionType('join');
    setDisplayName(user?.username || '');
    setShowNameModal(true);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setShowNameModal(false);
    if (modalActionType === 'create') handleCreate(displayName);
    else handleJoin(displayName);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#000000' }}>
      {/* Complete Profile Modal */}
      {(!user?.age || !user?.profession) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <ParticleCard className="magic-bento-card--border-glow" style={{ padding: '32px', backgroundColor: '#05070a', '--glow-color': '0, 242, 254', width: '90%', maxWidth: '400px', boxSizing: 'border-box' }} glowColor="0, 242, 254" particleCount={15} enableTilt={false} clickEffect={false} enableMagnetism={false}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <User size={48} color="var(--color-cyan)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>Complete Profile</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>We need a few details to get you started in the arena.</p>
            </div>
            {profError && (
              <div style={{ background: 'rgba(255,61,0,0.1)', color: '#ff8a80', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(255,61,0,0.2)' }}>
                {profError}
              </div>
            )}
            <form onSubmit={handleCompleteProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>USERNAME</label>
                <input
                  type="text"
                  value={profUsername}
                  onChange={(e) => setProfUsername(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>AGE</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={profAge}
                  onChange={(e) => setProfAge(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                  required
                  placeholder="e.g. 20"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>PROFESSION</label>
                <select
                  value={profProfession}
                  onChange={(e) => setProfProfession(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                  required
                >
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={profSubmitting}
                className="btn btn-cyan"
                style={{ padding: '14px', fontSize: '1.1rem', fontWeight: 800, marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                {profSubmitting ? <Loader2 className="spin" size={20} /> : 'Save Profile'}
              </button>
            </form>
          </ParticleCard>
        </div>
      )}

      {/* Background Animation */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <DarkVeil
          hueShift={-15}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1.2}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1.25}
        />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(5, 5, 8, 0.4) 0%, rgba(5, 5, 8, 0.85) 90%)', zIndex: 1, pointerEvents: 'none' }} />

      <div className="dashboard-root animate-fade-in" style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* GLOBAL NAVBAR */}
      <nav className="top-navbar">
        <div className="nav-links">
          <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginRight: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/logo.png" 
              alt="CodeDuel Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '4px' }} 
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextSibling.style.display = 'flex'; 
              }} 
            />
            <div style={{ display: 'none', background: 'var(--color-cyan)', padding: '6px', borderRadius: '8px', alignItems: 'center', justifyContent: 'center' }}>
              <Swords size={20} color="#000" />
            </div>
            CodeDuel
          </div>
          <span className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveView('dashboard'); setShowConfig(false); }} style={activeView === 'dashboard' ? { background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer' } : { cursor: 'pointer' }}>Dashboard</span>
          <span className={`nav-link ${activeView === 'leaderboard' ? 'active' : ''}`} onClick={() => { setActiveView('leaderboard'); setShowConfig(false); }} style={activeView === 'leaderboard' ? { background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer' } : { cursor: 'pointer' }}>Leaderboard</span>
          <span className={`nav-link ${activeView === 'problems' ? 'active' : ''}`} onClick={() => { setActiveView('problems'); setShowConfig(false); }} style={activeView === 'problems' ? { background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer' } : { cursor: 'pointer' }}>Problems</span>
          <span className={`nav-link ${activeView === 'practiceHistory' ? 'active' : ''}`} onClick={() => { setActiveView('practiceHistory'); setShowConfig(false); }} style={activeView === 'practiceHistory' ? { background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer' } : { cursor: 'pointer' }}>Practice History</span>
        </div>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Bell size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => alert('No new notifications')} />
          <div className="nav-user" onClick={onLogout} title="Logout" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
             <LogOut size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <img src={user.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`} alt="Profile" style={{ width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', border: '2px solid var(--color-cyan)', objectFit: 'cover' }} onClick={() => setShowEditProfile(true)} title="Edit Profile" />
        </div>
      </nav>

      <div className="dashboard-container">
        {!showConfig ? (
          <>
            {activeView === 'dashboard' && (
              <>
                <div className="dash-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h1 className="dash-title">Ready to duel, <span style={{ color: 'var(--color-cyan)' }}>{user.username}</span> <button onClick={() => setShowEditProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginLeft: '8px' }}>✏️ Edit</button></h1>
                      <p className="dash-subtitle">Your win rate this week is {stats.winRate}% — stay sharp!</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                      <button className="btn btn-cyan" onClick={() => setShowConfig(true)} style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: '24px' }}>
                        <Swords size={18}/> Quick Battle
                      </button>
                    </div>
                </div>

                {error && (
                  <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', borderRadius: '12px', marginTop: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                  </div>
                )}

                <PracticeStats token={token} />
                <div style={{ position: 'relative', marginTop: '24px' }}>
                  <GlobalSpotlight gridRef={statsGridRef} spotlightRadius={300} glowColor="0, 242, 254" />
                  <BentoCardGrid gridRef={statsGridRef}>
                    <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', minHeight: '120px' }} glowColor="0, 242, 254" particleCount={10} enableTilt={true} clickEffect={true} enableMagnetism={true}>
                      <div className="magic-bento-card__header" style={{ alignItems: 'center' }}>
                        <div className="magic-bento-card__label" style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>TOTAL WINS</div>
                        <Trophy size={20} color="var(--color-green)" />
                      </div>
                      <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title" style={{ fontSize: '2rem', margin: '4px 0' }}>{stats.wins || 0}</h2>
                      </div>
                    </ParticleCard>

                    <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', minHeight: '120px' }} glowColor="0, 242, 254" particleCount={10} enableTilt={true} clickEffect={true} enableMagnetism={true}>
                      <div className="magic-bento-card__header" style={{ alignItems: 'center' }}>
                        <div className="magic-bento-card__label" style={{ color: 'var(--color-cyan)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>MATCHES</div>
                        <Swords size={20} color="var(--color-cyan)" />
                      </div>
                      <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title" style={{ fontSize: '2rem', margin: '4px 0' }}>{stats.totalMatches || 0}</h2>
                      </div>
                    </ParticleCard>

                    <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', minHeight: '120px' }} glowColor="0, 242, 254" particleCount={10} enableTilt={true} clickEffect={true} enableMagnetism={true}>
                      <div className="magic-bento-card__header" style={{ alignItems: 'center' }}>
                        <div className="magic-bento-card__label" style={{ color: 'var(--color-amber)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>WIN RATE</div>
                        <TrendingUp size={20} color="var(--color-amber)" />
                      </div>
                      <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title" style={{ fontSize: '2rem', margin: '4px 0' }}>{stats.winRate || 0}%</h2>
                      </div>
                    </ParticleCard>

                    <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', minHeight: '120px' }} glowColor="0, 242, 254" particleCount={10} enableTilt={true} clickEffect={true} enableMagnetism={true}>
                      <div className="magic-bento-card__header" style={{ alignItems: 'center' }}>
                        <div className="magic-bento-card__label" style={{ color: 'var(--color-purple)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>SUBMISSIONS</div>
                        <Flame size={20} color="var(--color-purple)" />
                      </div>
                      <div className="magic-bento-card__content">
                        <h2 className="magic-bento-card__title" style={{ fontSize: '2rem', margin: '4px 0' }}>{stats.totalSubmissions || 0}</h2>
                      </div>
                    </ParticleCard>
                    <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '155, 81, 224', gridColumn: 'span 2', minHeight: '120px', padding: '0 32px', justifyContent: 'center', aspectRatio: 'auto' }} glowColor="155, 81, 224" particleCount={12} enableTilt={false} clickEffect={false} enableMagnetism={false}>
                      <div style={{ zIndex: 10, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', boxSizing: 'border-box', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ background: 'rgba(155, 81, 224, 0.2)', padding: '10px', borderRadius: '12px' }}>
                            <Users size={24} color="var(--color-purple)" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>JOIN ROOM</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Enter 6-char code</p>
                          </div>
                        </div>
                        <form onSubmit={triggerJoinFlow} style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                          <input 
                            type="text" 
                            placeholder="CODE" 
                            maxLength={6}
                            value={roomCode}
                            onChange={e => setRoomCode(e.target.value.toUpperCase())}
                            style={{ width: '130px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '1rem', textAlign: 'center', outline: 'none', letterSpacing: '4px', fontWeight: 'bold' }} 
                          />
                          <button type="submit" disabled={!roomCode} className="btn btn-purple" style={{ padding: '0 20px', fontSize: '1rem', letterSpacing: '1px', fontWeight: '800', borderRadius: '10px' }}>Join</button>
                        </form>
                      </div>
                    </ParticleCard>
                  </BentoCardGrid>
                  </div>
              </>
            )}

            {activeView === 'leaderboard' && (
              <div style={{ padding: '20px 0', position: 'relative' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>Global Leaderboard</h2>
                <GlobalSpotlight gridRef={leaderboardGridRef} spotlightRadius={500} glowColor="0, 242, 254" />
                <BentoCardGrid gridRef={leaderboardGridRef}>
                  <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', gridColumn: '1 / -1', padding: 0 }} glowColor="0, 242, 254" particleCount={30} enableTilt={false} clickEffect={false} enableMagnetism={false}>
                    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                      {loadingLeaderboard ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 className="spin" size={24} style={{ margin: '0 auto 12px' }}/> Loading ranks...</div>
                      ) : leaderboard.length > 0 ? (
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                              <th style={{ padding: '16px 16px', color: 'var(--color-cyan)', fontWeight: 700 }}>Rank</th>
                              <th style={{ padding: '16px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Coder</th>
                              <th style={{ padding: '16px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Wins</th>
                              <th style={{ padding: '16px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Win Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.map((u, idx) => (
                              <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '14px 16px', fontWeight: 800, color: idx < 3 ? 'var(--color-amber)' : 'var(--text-primary)' }}>#{idx + 1}</td>
                                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#fff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={u.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', flexShrink: 0 }} />
                                    <span>{u.username} {u._id === user.id && <span style={{ fontSize: '0.7rem', color: '#000', background: 'var(--color-cyan)', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px', fontWeight: 800 }}>YOU</span>}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px', color: 'var(--color-green)', fontWeight: 700 }}>{u.wins}</td>
                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.totalMatches > 0 ? Math.round((u.wins / u.totalMatches) * 100) : 0}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      ) : (
                         <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No ranked players yet. Be the first!</div>
                      )}
                    </div>
                  </ParticleCard>
                </BentoCardGrid>
              </div>
            )}

            {activeView === 'problems' && (
              <div style={{ padding: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Problem Database</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>Sharpen your algorithmic skills before entering the arena.</p>
                  </div>
                  <button className="btn btn-cyan" onClick={() => setActiveView('practiceHistory')} style={{ padding: '12px 20px', borderRadius: '16px', whiteSpace: 'nowrap' }}>View Practice History</button>
                </div>
                <MagicBento 
                  textAutoHide={true}
                  enableStars={true}
                  enableSpotlight={true}
                  enableBorderGlow={true}
                  enableTilt={true}
                  enableMagnetism={true}
                  clickEffect={true}
                  spotlightRadius={300}
                  particleCount={12}
                  glowColor="0, 242, 254"
                />
              </div>
            )}
          </>
        ) : (
          <div className="config-flow" style={{ maxWidth: '800px', margin: '20px auto 40px', width: '100%' }}>
            <button 
              onClick={() => setShowConfig(false)} 
              className="btn btn-outline" 
              style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
            >
              <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
            </button>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '12px' }}>BATTLE LOBBY</div>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800 }}>Configure your <span style={{ color: 'var(--color-cyan)' }}>match</span></h2>
            </div>
            
            {error && <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            <div style={{ position: 'relative' }}>
              <GlobalSpotlight gridRef={configGridRef} spotlightRadius={400} glowColor="0, 242, 254" />
              <BentoCardGrid gridRef={configGridRef}>
                <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', gridColumn: 'span 2', minHeight: 'auto', padding: '24px', justifyContent: 'flex-start', aspectRatio: 'auto' }} glowColor="0, 242, 254" particleCount={10} enableTilt={false} clickEffect={false} enableMagnetism={false}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600 }}>BATTLE MODE</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div onClick={() => setMode('practice')} style={{ padding: '16px', border: mode === 'practice' ? '1px solid var(--color-cyan)' : '1px solid var(--border-color)', background: mode === 'practice' ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-primary)', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                         <User size={24} style={{ color: mode === 'practice' ? 'var(--color-cyan)' : 'var(--text-secondary)', marginBottom: '8px', margin: '0 auto' }} />
                         <h3 style={{ fontSize: '1rem', marginBottom: '2px', color: mode === 'practice' ? 'var(--color-cyan)' : '#fff' }}>SOLO</h3>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Race clock</p>
                      </div>
                      <div onClick={() => setMode('1v1')} style={{ padding: '16px', border: mode === '1v1' ? '1px solid #3b82f6' : '1px solid var(--border-color)', background: mode === '1v1' ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-primary)', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                         <Swords size={24} style={{ color: mode === '1v1' ? '#3b82f6' : 'var(--text-secondary)', marginBottom: '8px', margin: '0 auto' }} />
                         <h3 style={{ fontSize: '1rem', marginBottom: '2px', color: mode === '1v1' ? '#3b82f6' : '#fff' }}>DUEL</h3>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>1v1 ranked</p>
                      </div>
                      <div onClick={() => setMode('squad')} style={{ padding: '16px', border: mode === 'squad' ? '1px solid var(--color-purple)' : '1px solid var(--border-color)', background: mode === 'squad' ? 'rgba(168, 85, 247, 0.05)' : 'var(--bg-primary)', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                         <Users size={24} style={{ color: mode === 'squad' ? 'var(--color-purple)' : 'var(--text-secondary)', marginBottom: '8px', margin: '0 auto' }} />
                         <h3 style={{ fontSize: '1rem', marginBottom: '2px', color: mode === 'squad' ? 'var(--color-purple)' : '#fff' }}>SQUAD</h3>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>Team vs team</p>
                      </div>
                    </div>
                  </div>
                </ParticleCard>

                <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', gridColumn: 'span 1', minHeight: 'auto', padding: '24px', justifyContent: 'flex-start', aspectRatio: 'auto' }} glowColor="0, 242, 254" particleCount={10} enableTilt={false} clickEffect={false} enableMagnetism={false}>
                  <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600 }}>DIFFICULTY</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', flex: 1 }}>
                      <div onClick={() => setDifficulty('all')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: difficulty === 'all' ? '1px solid #fff' : '1px solid var(--border-color)', background: difficulty === 'all' ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: difficulty === 'all' ? '#fff' : 'var(--text-secondary)' }}>Any</div>
                      <div onClick={() => setDifficulty('easy')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: difficulty === 'easy' ? '1px solid var(--color-green)' : '1px solid var(--border-color)', background: difficulty === 'easy' ? 'rgba(34, 197, 94, 0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: difficulty === 'easy' ? 'var(--color-green)' : 'var(--text-secondary)' }}>Easy</div>
                      <div onClick={() => setDifficulty('medium')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: difficulty === 'medium' ? '1px solid var(--color-amber)' : '1px solid var(--border-color)', background: difficulty === 'medium' ? 'rgba(245, 158, 11, 0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: difficulty === 'medium' ? 'var(--color-amber)' : 'var(--text-secondary)' }}>Medium</div>
                      <div onClick={() => setDifficulty('hard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: difficulty === 'hard' ? '1px solid var(--color-red)' : '1px solid var(--border-color)', background: difficulty === 'hard' ? 'rgba(239, 68, 68, 0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: difficulty === 'hard' ? 'var(--color-red)' : 'var(--text-secondary)' }}>Hard</div>
                    </div>
                  </div>
                </ParticleCard>

                <ParticleCard className="magic-bento-card magic-bento-card--border-glow" style={{ backgroundColor: '#05070a', '--glow-color': '0, 242, 254', gridColumn: 'span 3', minHeight: 'auto', padding: '24px', justifyContent: 'flex-start', aspectRatio: 'auto' }} glowColor="0, 242, 254" particleCount={10} enableTilt={false} clickEffect={false} enableMagnetism={false}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '16px', fontWeight: 600 }}>TOPIC (optional)</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['all', 'Arrays', 'Strings', 'DP', 'Trees', 'Graphs', 'Sorting', 'Greedy'].map(t => {
                        const normalizedValue = normalizeTopic(t);
                        return (
                          <div key={t} onClick={() => setTopic(normalizedValue)} style={{ padding: '6px 14px', border: topic === normalizedValue ? '1px solid #fff' : '1px solid var(--border-color)', background: topic === normalizedValue ? 'rgba(255,255,255,0.1)' : 'var(--bg-primary)', borderRadius: '24px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: topic === normalizedValue ? '#fff' : 'var(--text-secondary)' }}>
                             {t === 'all' ? '🎲 Random (All)' : `#${t}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ParticleCard>
              </BentoCardGrid>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button className="btn btn-outline" onClick={() => setShowConfig(false)} style={{ padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem' }}>Cancel</button>
                  <button className="btn btn-cyan" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 700 }} onClick={triggerCreateFlow} disabled={loadingAction}>
                    {loadingAction ? <Loader2 className="spin" size={18}/> : 'Launch Battle Arena'}
                  </button>
            </div>
          </div>
        )}

            {activeView === 'practiceHistory' && (
              <div style={{ padding: '20px 0' }}>
                <PracticeHistory token={token} onClose={() => setActiveView('dashboard')} />
              </div>
            )}
      </div>

      {/* Name Modal */}
      {showNameModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 700 }}>Enter the Arena</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Confirm your display name</p>
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                required
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowNameModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-cyan" style={{ flex: 1 }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 700 }}>Edit Profile</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose a new username</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!newUsername.trim()) return;
              const updatedUser = { ...user, username: newUsername };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Force reload to apply username change globally since backend route may not exist
              window.location.reload();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New Username"
                required
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowEditProfile(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-cyan" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
