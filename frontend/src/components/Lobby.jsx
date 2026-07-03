import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Trophy, Swords, Zap, Loader2, ArrowRight, Activity, Target, Star, TrendingUp, Shield, Code2, Flame } from 'lucide-react';
import BorderGlow from './BorderGlow';

const API_BASE = 'http://localhost:5000/api';

export default function Lobby({ user, token, onLogout, onCreateRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalMatches: 0, winRate: 0, totalSubmissions: 0, acceptedSubmissions: 0 });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  const [showConfig, setShowConfig] = useState(false);
  const [mode, setMode] = useState('1v1');
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  const [timeLimit, setTimeLimit] = useState(1800);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [showNameModal, setShowNameModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [modalActionType, setModalActionType] = useState('create');

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
      const payload = { mode, difficulty, topic, timeLimit: Number(timeLimit), maxPlayers: mode === 'practice' ? 1 : Number(maxPlayers), displayName: nameToUse };
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
    e.preventDefault();
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

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.winRate / 100) * circumference;

  const getRankLabel = () => {
    if (stats.wins >= 50) return { label: 'Legend', color: '#ffd700', icon: '👑' };
    if (stats.wins >= 20) return { label: 'Master', color: '#c084fc', icon: '💎' };
    if (stats.wins >= 10) return { label: 'Expert', color: '#00f2fe', icon: '⚡' };
    if (stats.wins >= 3) return { label: 'Coder', color: '#00e676', icon: '🔥' };
    return { label: 'Rookie', color: '#a8b3cf', icon: '🌱' };
  };

  const rank = getRankLabel();

  return (
    <div className="lobby-root animate-fade-in">
      {/* Ambient BG orbs */}
      <div className="lobby-orb lobby-orb-1" />
      <div className="lobby-orb lobby-orb-2" />
      <div className="lobby-orb lobby-orb-3" />

      {/* Header */}
      <header className="lobby-header">
        <div className="logo-container">
          <span className="logo-text">⚡ CODEDUEL</span>
          <span className="lobby-header-badge">ARENA</span>
        </div>
        <div className="lobby-header-right">
          <div className="lobby-user-pill">
            <div className="lobby-user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div>
              <div className="lobby-user-name">{user.username}</div>
              <div className="lobby-user-rank" style={{ color: rank.color }}>{rank.icon} {rank.label}</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn btn-outline lobby-logout-btn" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="lobby-main">

        {/* ── Left Column ── */}
        <div className="lobby-left">

          {/* Quick Stats Strip */}
          <div className="stats-strip">
            <div className="stat-chip">
              <Flame size={14} style={{ color: '#ff9100' }} />
              <span className="stat-chip-num">{stats.wins}</span>
              <span className="stat-chip-label">Wins</span>
            </div>
            <div className="stat-chip-divider" />
            <div className="stat-chip">
              <Target size={14} style={{ color: '#00f2fe' }} />
              <span className="stat-chip-num">{stats.totalMatches}</span>
              <span className="stat-chip-label">Matches</span>
            </div>
            <div className="stat-chip-divider" />
            <div className="stat-chip">
              <TrendingUp size={14} style={{ color: '#00e676' }} />
              <span className="stat-chip-num">{stats.winRate}%</span>
              <span className="stat-chip-label">Win Rate</span>
            </div>
          </div>

          {/* Win Rate Ring Card */}
          <BorderGlow
            glowColor="195 100 50"
            backgroundColor="rgba(15, 17, 26, 0.9)"
            borderRadius={20}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={30}
            colors={['#00f2fe', '#9b51e0', '#f472b6']}
            animated={true}
            style={{ width: '100%' }}
          >
            <div className="winrate-card">
              <div className="winrate-ring-wrap">
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                  <circle
                    cx="50" cy="50" r={radius} fill="transparent"
                    stroke="url(#winGrad)" strokeWidth="7"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                  <defs>
                    <linearGradient id="winGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#9b51e0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="winrate-ring-label">
                  <div className="winrate-pct">{stats.winRate}%</div>
                  <div className="winrate-sub">Win Rate</div>
                </div>
              </div>
              <div className="winrate-stats">
                <div className="winrate-stat-row">
                  <span style={{ color: 'var(--color-green)' }}>W</span>
                  <span className="winrate-stat-num" style={{ color: 'var(--color-green)' }}>{stats.wins}</span>
                </div>
                <div className="winrate-stat-row">
                  <span style={{ color: 'var(--color-red)' }}>L</span>
                  <span className="winrate-stat-num" style={{ color: 'var(--color-red)' }}>{stats.losses}</span>
                </div>
                <div className="winrate-stat-row">
                  <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                  <span className="winrate-stat-num">{stats.totalMatches}</span>
                </div>
              </div>
            </div>
          </BorderGlow>

          {/* Duel Actions Card */}
          <BorderGlow
            glowColor="175 100 50"
            backgroundColor="rgba(15, 17, 26, 0.9)"
            borderRadius={20}
            glowRadius={36}
            glowIntensity={1.2}
            coneSpread={28}
            colors={['#00f2fe', '#38bdf8', '#9b51e0']}
            style={{ width: '100%' }}
          >
            <div className="duel-actions-card">
              <h2 className="card-title">
                <Swords size={18} style={{ color: 'var(--color-cyan)' }} />
                Duel Actions
              </h2>

              {error && (
                <div className="error-banner">{error}</div>
              )}

              {!showConfig ? (
                <button
                  onClick={() => setShowConfig(true)}
                  className="btn btn-cyan"
                  style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
                >
                  <Zap size={18} /> Create Match / Practice
                </button>
              ) : (
                <div className="config-box">
                  <div className="config-title">Room Configuration</div>

                  <div className="config-field">
                    <label>Game Mode</label>
                    <select className="form-input" value={mode} onChange={(e) => {
                      setMode(e.target.value);
                      if (e.target.value === 'practice') setMaxPlayers(1);
                      else if (e.target.value === '1v1') setMaxPlayers(2);
                    }} style={{ background: 'var(--bg-tertiary)' }}>
                      <option value="1v1">1v1 Duel (2 Players)</option>
                      <option value="multiplayer">Multiplayer Brawl (Up to 4)</option>
                      <option value="practice">Practice Arena (Solo)</option>
                    </select>
                  </div>

                  <div className="config-field">
                    <label>Difficulty</label>
                    <select className="form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
                      <option value="all">Any Difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="config-field">
                    <label>Topic</label>
                    <select className="form-input" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
                      <option value="all">Any Topic</option>
                      <option value="arrays">Arrays</option>
                      <option value="strings">Strings</option>
                      <option value="binary search">Binary Search</option>
                      <option value="linked list">Linked List</option>
                      <option value="trees">Trees</option>
                      <option value="graphs">Graphs</option>
                      <option value="dynamic programming">Dynamic Programming</option>
                    </select>
                  </div>

                  <div className="config-field">
                    <label>Duration</label>
                    <select className="form-input" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} style={{ background: 'var(--bg-tertiary)' }}>
                      <option value={300}>5 Minutes</option>
                      <option value={600}>10 Minutes</option>
                      <option value={1200}>20 Minutes</option>
                      <option value={1800}>30 Minutes</option>
                      <option value={86400}>No Limit</option>
                    </select>
                  </div>

                  {mode === 'multiplayer' && (
                    <div className="config-field">
                      <label>Max Competitors</label>
                      <select className="form-input" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} style={{ background: 'var(--bg-tertiary)' }}>
                        {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Players</option>)}
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button onClick={() => setShowConfig(false)} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                    <button onClick={triggerCreateFlow} disabled={loadingAction} className="btn btn-cyan" style={{ flex: 1.5, padding: '10px' }}>
                      {loadingAction ? <Loader2 size={16} className="spin" /> : 'Launch'}
                    </button>
                  </div>
                </div>
              )}

              <div className="divider-or"><span>OR JOIN ROOM</span></div>

              <form onSubmit={triggerJoinFlow} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="6-CHAR CODE"
                  maxLength={6}
                  className="form-input"
                  style={{ textTransform: 'uppercase', textAlign: 'center', fontWeight: '800', letterSpacing: '3px', fontFamily: 'var(--font-mono)' }}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
                <button type="submit" disabled={loadingAction || !roomCode} className="btn btn-purple" style={{ padding: '12px 16px' }}>
                  {loadingAction ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
                </button>
              </form>
            </div>
          </BorderGlow>
        </div>

        {/* ── Right Column: Leaderboard ── */}
        <BorderGlow
          glowColor="270 70 60"
          backgroundColor="rgba(15, 17, 26, 0.9)"
          borderRadius={20}
          glowRadius={36}
          glowIntensity={1.1}
          coneSpread={28}
          colors={['#9b51e0', '#c084fc', '#f472b6']}
          className="lobby-leaderboard-wrap"
        >
          <div className="leaderboard-card">
            <h2 className="card-title">
              <Trophy size={18} style={{ color: '#ffd700' }} />
              Global Hall of Fame
            </h2>

            <div className="leaderboard-scroll">
              {loadingLeaderboard ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <Loader2 size={32} className="spin" style={{ color: 'var(--color-cyan)' }} />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="leaderboard-empty">
                  <Star size={40} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '12px' }} />
                  <div>No records yet.</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Be the first to win a duel!</div>
                </div>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((player) => {
                    const isTop3 = player.rank <= 3;
                    const badgeClass = isTop3 ? `rank-${player.rank}` : 'rank-other';
                    const medal = player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : null;
                    return (
                      <div key={player.username} className={`lb-row ${isTop3 ? 'lb-row-top' : ''}`}>
                        <div className="lb-rank">
                          {medal
                            ? <span className="lb-medal">{medal}</span>
                            : <span className={`rank-badge ${badgeClass}`}>{player.rank}</span>
                          }
                        </div>
                        <div className="lb-player">
                          <div className="lb-avatar">{player.username.charAt(0).toUpperCase()}</div>
                          <span className="lb-username">{player.username}</span>
                        </div>
                        <div className="lb-stats">
                          <span className="lb-wins">{player.wins}W</span>
                          <span className="lb-matches">{player.totalMatches} games</span>
                          <span className="lb-rate" style={{ color: player.winRate >= 60 ? 'var(--color-cyan)' : 'var(--text-secondary)' }}>
                            {player.winRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </BorderGlow>

      </main>

      {/* Display Name Modal */}
      {showNameModal && (
        <div className="modal-overlay">
          <BorderGlow
            glowColor="195 100 50"
            backgroundColor="rgba(12, 14, 22, 0.98)"
            borderRadius={20}
            glowRadius={40}
            glowIntensity={1.4}
            coneSpread={30}
            colors={['#00f2fe', '#9b51e0', '#f472b6']}
            animated={true}
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <div className="modal-card">
              <div className="modal-icon">⚔️</div>
              <h3 className="modal-title">Enter the Arena</h3>
              <p className="modal-sub">Choose your combat display name for this session.</p>
              <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  minLength={2}
                  maxLength={20}
                  required
                  style={{ textAlign: 'center', fontWeight: '700', fontSize: '1rem' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowNameModal(false)} className="btn btn-outline" style={{ flex: 1, padding: '11px' }}>Cancel</button>
                  <button type="submit" className="btn btn-cyan" style={{ flex: 1.5, padding: '11px' }}>Confirm & Enter</button>
                </div>
              </form>
            </div>
          </BorderGlow>
        </div>
      )}
    </div>
  );
}
