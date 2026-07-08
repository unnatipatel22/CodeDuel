import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Play, Send, Users, MessageSquare, AlertCircle, Zap,
  Activity, Award, Hourglass, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import DarkVeil from './DarkVeil/DarkVeil';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');

const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python 3', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' }
];

const getDefaultStarterCode = (lang, problem) => {
  const functionName = problem?.title
    ? problem.title.toLowerCase().replace(/[^a-z0-9]/g, '_')
    : 'solve';

  switch (lang) {
    case 'javascript':
    case 'typescript':
      return `function ${functionName}() {\n  // Write your code here\n}\n`;
    case 'python':
      return `class Solution:\n    def ${functionName}(self):\n        # Write your code here\n        pass\n`;
    case 'cpp':
      return `class Solution {\npublic:\n    int ${functionName}() {\n        // Write your code here\n        return 0;\n    }\n};\n`;
    case 'c':
      return `int ${functionName}() {\n    // Write your code here\n    return 0;\n}\n`;
    case 'java':
      return `class Solution {\n    public int ${functionName}() {\n        // Write your code here\n        return 0;\n    }\n}\n`;
    case 'go':
      return `package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}\n`;
    case 'rust':
      return `fn main() {\n    // Write your code here\n}\n`;
    case 'kotlin':
      return `fun main(args: Array<String>) {\n    // Write your code here\n}\n`;
    case 'csharp':
      return `using System;\n\npublic class Program {\n    public static void Main() {\n        // Write your code here\n    }\n}\n`;
    case 'php':
      return `<?php\n// Write your code here\n`;
    case 'ruby':
      return `# Write your code here\n`;
    case 'swift':
      return `// Write your code here\n`;
    default:
      return `// Write your code here\n`;
  }
};

export default function GameArena({ user, token, initialRoom, socket, onLeave }) {
  const [room] = useState(initialRoom);
  const [players, setPlayers] = useState(initialRoom.players || []);
  const [gameState, setGameState] = useState(initialRoom.status);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [codesByLanguage, setCodesByLanguage] = useState({});
  const [timer, setTimer] = useState(1800);
  const [opponentLines, setOpponentLines] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [opponentSubmittedAlert, setOpponentSubmittedAlert] = useState(null);
  const [readyCountdown, setReadyCountdown] = useState(null);
  const [systemAlert, setSystemAlert] = useState('');
  const [socketError, setSocketError] = useState('');

  // States for Dry Runs and Emote Reactions
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [activeEmotes, setActiveEmotes] = useState([]);
  const [playerLines, setPlayerLines] = useState({});
  const [activeTab, setActiveTab] = useState('problem');

  const [roomSettings, setRoomSettings] = useState({
    mode: initialRoom.mode || '1v1',
    difficulty: initialRoom.difficulty || 'all',
    timeLimit: initialRoom.timeLimit || 1800,
    maxPlayers: initialRoom.maxPlayers || 2,
    creatorId: initialRoom.creatorId || null,
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    console.log('GameArena socket init', {
      roomCode: room.roomCode,
      socketConnected: socket.connected,
      userId: user.id,
      username: user.username,
      mode: room.mode,
    });

    const emitJoin = () => {
      console.log('GameArena emitting join-room', { roomCode: room.roomCode, userId: user.id, username: user.username });
      socket.emit('join-room', {
        roomCode: room.roomCode,
        userId: user.id,
        username: user.username,
      });
    };

    if (socket.connected) {
      emitJoin();
    }

    socket.on('connect', () => {
      console.log('GameArena socket connected, now joining room');
      emitJoin();
    });

    socket.on('room-update', ({ players: updated, creatorId, mode, difficulty, topic, timeLimit, maxPlayers }) => {
      setPlayers(updated || []);
      setRoomSettings({
        mode: mode || initialRoom.mode || '1v1',
        difficulty: difficulty || initialRoom.difficulty || 'all',
        topic: topic || initialRoom.topic || 'all',
        timeLimit: timeLimit || initialRoom.timeLimit || 1800,
        maxPlayers: maxPlayers || initialRoom.maxPlayers || 2,
        creatorId: creatorId || initialRoom.creatorId || null,
      });
    });

    socket.on('room-ready', (data) => {
      setSystemAlert(data?.message || 'Match starting...');
      setTimeout(() => setSystemAlert(''), 3000);
      setReadyCountdown(3);
      let c = 3;
      const i = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(i);
          setReadyCountdown(null);
        } else setReadyCountdown(c);
      }, 1000);
    });

    socket.on('game-start', ({ problem: p, timeLimit }) => {
      setGameState('live');
      setProblem(p);
      setTimer(timeLimit);
      const initialCode = p?.starterCode?.[language] || getDefaultStarterCode(language, p);
      setCode(initialCode);
      setCodesByLanguage({
        [language]: initialCode
      });
    });

    socket.on('timer-tick', ({ remaining }) => setTimer(remaining));

    socket.on('opponent-coding', ({ username, linesWritten }) => {
      if (username) {
        setPlayerLines((prev) => ({
          ...prev,
          [username]: linesWritten,
        }));
      } else {
        setOpponentLines(linesWritten);
      }
    });

    socket.on('new-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('new-emote', ({ username, emote }) => {
      const id = Math.random();
      setActiveEmotes((prev) => [...prev, { username, emote, id }]);
      setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.id !== id));
      }, 3000);
    });

    socket.on('game-over', (data) => {
      setGameState('finished');
      setGameOverData(data);
    });

    socket.on('opponent-left', ({ message }) => {
      setSystemAlert(message);
      setTimeout(() => setSystemAlert(''), 4000);
    });

    socket.on('error', ({ message }) => {
      setSocketError(message || 'Something went wrong. Please leave and try again.');
    });

    return () => {
      socket.off('room-update');
      socket.off('room-ready');
      socket.off('game-start');
      socket.off('timer-tick');
      socket.off('opponent-coding');
      socket.off('new-message');
      socket.off('new-emote');
      socket.off('game-over');
      socket.off('opponent-left');
      socket.off('error');
    };
  }, [socket, room.roomCode, user.id, language]);

  // Local timer for Practice Mode
  useEffect(() => {
    let interval;
    if (gameState === 'live' && roomSettings.mode === 'practice') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, roomSettings.mode]);

  const handleToggleReady = () => {
    socket?.emit('toggle-ready', {
      roomCode: room.roomCode,
      userId: user.id,
    });
  };

  const handleLanguageChange = (newLang) => {
    setCodesByLanguage((prev) => ({
      ...prev,
      [language]: code,
    }));
    setLanguage(newLang);
    if (codesByLanguage[newLang]) {
      setCode(codesByLanguage[newLang]);
    } else if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    } else {
      setCode(getDefaultStarterCode(newLang, problem));
    }
  };

  const handleStartMatch = () => {
    socket?.emit('host-start-match', {
      roomCode: room.roomCode,
      userId: user.id,
    });
  };

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await axios.post(
        `${API_BASE}/submissions/run`,
        { code, language, problemId: problem.id || problem._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRunResult(res.data.result);
    } catch (err) {
      setRunResult({
        error: err.response?.data?.message || 'Run execution failed'
      });
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const newValue =
        value.substring(0, selectionStart) +
        '  ' +
        value.substring(selectionEnd);

      setCode(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const handleCodeEdit = (e) => {
    const value = e.target.value;
    setCode(value);

    socket?.emit('code-update', {
      roomCode: room.roomCode,
      username: user.username,
      linesWritten: value.split('\n').length
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await axios.post(
        `${API_BASE}/submissions`,
        { code, language, roomId: room.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmissionResult(res.data.result);
      socket?.emit('player-submitted', {
        roomCode: room.roomCode,
        username: user.username
      });
    } catch (err) {
      setSubmissionResult({
        error: err.response?.data?.message || 'Submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#000000' }}>
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

      <div className="layout-container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {systemAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 242, 254, 0.1)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          color: 'var(--color-cyan)',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="animate-fade-in">
          <AlertCircle size={16} />
          <span style={{ fontWeight: '600' }}>{systemAlert}</span>
        </div>
      )}

      {readyCountdown !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 11, 16, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)' }}>Duel Starting In</div>
          <h1 style={{ fontSize: '8rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-purple) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{readyCountdown}</h1>
        </div>
      )}

      <header className="header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left Timer */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          padding: '8px 16px',
          borderRadius: '24px',
          fontFamily: 'var(--font-mono)',
          fontWeight: '700',
          fontSize: '1.2rem',
          color: '#fff'
        }}>
          {formatTime(timer)}
        </div>

        {/* Center VS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', color: 'var(--color-cyan)', fontSize: '1.1rem' }}>{user.username}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1847 rating</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-cyan)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {roomSettings.mode !== 'practice' && (
            <>
              <div style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.9rem' }}>VS</div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                {players.find(p => p.username !== user.username)?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', color: 'var(--color-purple)', fontSize: '1.1rem' }}>{players.find(p => p.username !== user.username)?.username || 'Opponent'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1923 rating</div>
              </div>
            </>
          )}
        </div>

        {/* Right Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-red)', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>
            <div style={{ width: '10px', height: '10px', background: 'var(--color-red)', borderRadius: '50%' }}></div>
            DUEL LIVE
          </div>
          <button onClick={onLeave} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Leave
          </button>
        </div>
      </header>

      {gameState === 'live' && (
        <div style={{ display: 'flex', width: '100%', padding: '12px 32px', background: 'var(--bg-primary)' }}>
          <div style={{ flex: 1, paddingRight: roomSettings.mode === 'practice' ? '0' : '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
              <span style={{ color: 'var(--color-cyan)' }}>YOU</span>
              <span style={{ color: 'var(--text-secondary)' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-cyan)', borderRadius: '2px' }}></div>
            </div>
          </div>
          {roomSettings.mode !== 'practice' && (
            <div style={{ flex: 1, paddingLeft: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--color-purple)' }}>OPPONENT</span>
                <span style={{ color: 'var(--text-secondary)' }}>40%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: '40%', height: '100%', background: 'var(--color-purple)', borderRadius: '2px' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'waiting' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '32px',
          padding: '40px 24px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          flex: 1
        }}>
          {/* Left Column: Match Details & Lobby Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Match info card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-cyan)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} /> Match Parameters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GAME MODE</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {roomSettings.mode === 'practice' ? 'solo practice' : roomSettings.mode === 'multiplayer' ? 'group battle' : '1v1 speed duel'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DIFFICULTY</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
                    {roomSettings.difficulty}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOPIC</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-purple)', textTransform: 'uppercase' }}>
                    {roomSettings.topic || 'ALL'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TIME LIMIT</div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {roomSettings.timeLimit >= 86400 ? 'No Limit' : `${roomSettings.timeLimit / 60} minutes`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ROOM CODE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-purple)', fontFamily: 'var(--font-mono)' }}>
                    {room.roomCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Lobby Chat Panel */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px', maxHeight: '450px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} style={{ color: 'var(--color-cyan)' }} />
                <span>LOBBY CHAT</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '40px' }}>
                    Chat with your opponents before the duel begins!
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isMe = msg.username === user.username;
                    return (
                      <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                          {msg.username}
                        </div>
                        <div style={{
                          padding: '8px 14px',
                          borderRadius: '12px',
                          borderTopRightRadius: isMe ? '2px' : '12px',
                          borderTopLeftRadius: !isMe ? '2px' : '12px',
                          background: isMe ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'rgba(255,255,255,0.06)',
                          color: isMe ? '#020617' : 'var(--text-primary)',
                          fontSize: '0.88rem',
                          fontWeight: isMe ? '600' : 'normal'
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                socket?.emit('send-message', {
                  roomCode: room.roomCode,
                  username: user.username,
                  message: newMessage
                });
                setNewMessage('');
              }} style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-input"
                  style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn btn-purple" style={{ padding: '10px 16px' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Joined Competitors & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel glass-panel-glow-cyan" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} style={{ color: 'var(--color-cyan)' }} />
                  Joined Competitors
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {players.length} / {roomSettings.maxPlayers}
                </span>
              </div>

              {/* Player list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                {players.map((p, idx) => {
                  const isHost = roomSettings.creatorId === p.userId || idx === 0;
                  const isSelf = p.userId === user.id || p.username === user.username;
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="status-dot" style={{ width: '8px', height: '8px', background: p.isReady ? 'var(--color-green)' : 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.username}</span>
                        {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(You)</span>}
                        {isHost && <span style={{ fontSize: '0.65rem', background: 'rgba(155, 81, 224, 0.2)', color: 'var(--color-purple)', border: '1px solid var(--color-purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>HOST</span>}
                      </div>
                      <div>
                        {p.isReady ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-green)', fontWeight: '700' }}>READY</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>NOT READY</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {players.length < roomSettings.maxPlayers && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', padding: '12px' }}>
                    <Loader2 className="spin" size={14} />
                    <span style={{ fontSize: '0.88rem' }}>Waiting for competitors to join...</span>
                  </div>
                )}
              </div>

              {/* Ready / Start Actions */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Host Controls */}
                {roomSettings.creatorId === user.id ? (
                  <>
                    <button
                      onClick={handleStartMatch}
                      disabled={players.length < 2 || !players.every(p => p.isReady)}
                      className="btn btn-cyan"
                      style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    >
                      <Zap size={18} />
                      Start Match 🚀
                    </button>
                    {(!players.every(p => p.isReady) || players.length < 2) && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {players.length < 2 ? 'Need at least 2 players to start.' : 'Waiting for all competitors to get ready.'}
                      </div>
                    )}
                  </>
                ) : (
                  // Guest Controls
                  <button
                    onClick={handleToggleReady}
                    className={`btn ${players.find(p => p.username === user.username)?.isReady ? 'btn-outline' : 'btn-purple'}`}
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                  >
                    <CheckCircle2 size={18} />
                    {players.find(p => p.username === user.username)?.isReady ? 'Unready' : 'Ready Up'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finished / Game-over State */}
      {gameState === 'finished' && gameOverData && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '20px'
        }}>
          <div className="glass-panel glass-panel-glow-purple animate-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '40px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div className="float-slow" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(155, 81, 224, 0.08)',
              border: '1px solid rgba(155, 81, 224, 0.25)',
              margin: '0 auto',
              color: 'var(--color-purple)',
              boxShadow: '0 0 15px rgba(155, 81, 224, 0.1)'
            }}>
              <Award size={32} />
            </div>

            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-purple) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                Duel Concluded
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Winner: <span style={{ color: 'var(--color-cyan)', fontWeight: '700' }}>{gameOverData.winnerUsername}</span>
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: '700' }}>
                Submission Performance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Test Cases Passed:</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-green)' }}>
                    {gameOverData.submission?.testCasesPassed} / {gameOverData.submission?.totalTestCases}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span style={{ fontWeight: '700', color: gameOverData.winnerUsername === user.username ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {gameOverData.winnerUsername === user.username ? '🏆 VICTORY' : '💀 DEFEAT'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={onLeave} className="btn btn-purple" style={{ width: '100%', padding: '12px' }}>
              Return to Lobby
            </button>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE}/rooms/rematch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ roomId: room.id })
                  });
                  const data = await res.json();
                  if (data.success) {
                    // Copy code to clipboard and alert
                    const url = `${window.location.origin}?room=${data.room.roomCode}`;
                    await navigator.clipboard.writeText(url);
                    alert('Rematch created. Shareable link copied to clipboard: ' + url);
                  } else {
                    alert(data.message || 'Rematch failed');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Rematch failed');
                }
              }} className="btn btn-outline" style={{ flex: 1 }}>
                Rematch
              </button>
              <button onClick={() => {
                // Show replay modal using gameOverData.submission
                const code = gameOverData?.submission?.code || gameOverData?.submission?.codeText || '';
                const w = window.open('', '_blank', 'width=900,height=700');
                if (w) {
                  w.document.body.style.background = '#0b0e14';
                  w.document.body.style.color = '#fff';
                  w.document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
                  w.document.title = 'Replay - CodeDuel';
                  w.document.body.innerHTML = `<pre style="white-space:pre-wrap;font-family:monospace;font-size:13px;padding:20px">${(code || '').replace(/</g,'&lt;')}</pre>`;
                }
              }} className="btn btn-cyan" style={{ flex: 1 }}>
                View Replay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Socket error overlay */}
      {socketError && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: 1, padding: '40px'
        }}>
          <div className="glass-panel glass-panel-glow-purple animate-fade-in" style={{
            maxWidth: '460px', width: '100%', padding: '40px 32px',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Arena Error</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{socketError}</p>
            <button onClick={onLeave} className="btn btn-purple" style={{ width: '100%', padding: '12px' }}>
              Return to Lobby
            </button>
          </div>
        </div>
      )}

      {/* Loading — waiting for problem after game starts */}
      {gameState === 'live' && !problem && !socketError && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flex: 1, gap: '20px'
        }}>
          <div style={{
            width: '56px', height: '56px', border: '3px solid rgba(0,242,254,0.2)',
            borderTop: '3px solid var(--color-cyan)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
            Loading Problem...
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Fetching your challenge from the arena
          </div>
        </div>
      )}

      {/* Live Coding Arena */}
      {gameState === 'live' && problem && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2px', background: 'var(--border-color)', height: 'calc(100vh - 120px)' }}>

          {/* Left Column: Problem & Chat Tabs */}
          <div style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div 
                onClick={() => setActiveTab('problem')}
                style={{ padding: '16px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', borderBottom: activeTab === 'problem' ? '2px solid var(--color-cyan)' : '2px solid transparent', color: activeTab === 'problem' ? 'var(--color-cyan)' : 'var(--text-secondary)' }}
              >
                📝 Problem
              </div>
              <div 
                onClick={() => setActiveTab('chat')}
                style={{ padding: '16px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', borderBottom: activeTab === 'chat' ? '2px solid var(--color-cyan)' : '2px solid transparent', color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                💬 Chat
              </div>
              <div style={{ marginLeft: 'auto', padding: '16px 24px' }}>
                 <span style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-red)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '700' }}>
                   {problem.difficulty?.toUpperCase() || 'HARD'}
                 </span>
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
              {activeTab === 'problem' ? (
                <>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', color: '#fff' }}>{problem.title}</h2>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '32px' }}>
                    {problem.description}
                  </div>
                  
                  {problem.sampleTestCases?.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Example 1</div>
                      {problem.sampleTestCases.slice(0,1).map((tc, idx) => (
                        <div key={idx} style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          <div><strong style={{ color: 'var(--text-primary)' }}>Input:</strong> {tc.input}</div>
                          <div><strong style={{ color: 'var(--text-primary)' }}>Output:</strong> {tc.expectedOutput}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Constraints</div>
                    <ul style={{ paddingLeft: '24px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li>1 &le; n &le; 2 &times; 10<sup>4</sup></li>
                      <li>0 &le; height[i] &le; 10<sup>5</sup></li>
                    </ul>
                  </div>

                  <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-amber)', fontWeight: '700', marginBottom: '12px' }}>
                       <AlertCircle size={18} /> AI HINT
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      Two-pointer approach achieves O(n) time. Track leftMax and rightMax as you close in from both ends.
                    </p>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
                    {chatMessages.map((msg, idx) => {
                      const isMe = msg.username === user.username;
                      return (
                        <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: isMe ? 'right' : 'left' }}>
                            {msg.username}
                          </div>
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            borderTopRightRadius: isMe ? '4px' : '12px',
                            borderTopLeftRadius: !isMe ? '4px' : '12px',
                            background: isMe ? 'var(--color-cyan)' : 'var(--bg-secondary)',
                            color: isMe ? '#020617' : 'var(--text-primary)',
                            fontSize: '0.95rem',
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMessage.trim()) return;
                    socket?.emit('send-message', { roomCode: room.roomCode, username: user.username, message: newMessage });
                    setNewMessage('');
                  }} style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-purple">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Terminal */}
          <div style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} style={{ background: '#0f172a', color: '#f8fafc' }}>{lang.label}</option>
                ))}
              </select>
              {runResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: runResult.allPassed ? 'var(--color-green)' : 'var(--color-red)', fontWeight: '700', fontSize: '0.9rem' }}>
                  {runResult.allPassed ? (
                    <><CheckCircle2 size={16} /> ACCEPTED</>
                  ) : (
                    <><AlertCircle size={16} /> FAILED</>
                  )}
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={code}
                onChange={handleCodeEdit}
                onKeyDown={handleKeyDown}
                className="code-editor-textarea"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  padding: '24px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none'
                }}
                spellCheck={false}
                placeholder={`// Write your ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language} code here...`}
              />
            </div>

            {/* Terminal Output */}
            {runResult && (
              <div style={{
                height: '200px',
                background: '#0a0a0a',
                borderTop: '1px solid var(--border-color)',
                padding: '16px 24px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ marginBottom: '8px' }}>stdout</div>
                <div style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>[0, 1]</div>
                {runResult.results?.map((res, idx) => (
                  <div key={idx} style={{ color: res.passed ? 'var(--color-green)' : 'var(--color-red)', marginBottom: '4px' }}>
                    {res.passed ? '✓' : '✗'} Test {idx + 1} {res.passed ? 'passed' : 'failed'}
                  </div>
                ))}
              </div>
            )}

            {/* Success Banner */}
            {submissionResult && submissionResult.allPassed && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                borderTop: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '16px 24px',
                color: 'var(--color-green)',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={20} /> You won the duel! +24 rating 🏆
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)'
            }}>
              <div></div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="btn"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  {running ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
                  <span>Run</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || running}
                  className="btn btn-green"
                >
                  {submitting ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
                  <span>Submit</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Floating Emote Reactions Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {activeEmotes.map((e) => (
          <div key={e.id} className="glass-panel animate-fade-in" style={{
            background: 'rgba(15, 17, 26, 0.85)',
            border: '1px solid var(--color-cyan)',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-glow-cyan)',
            pointerEvents: 'auto'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{e.username}:</span>
            <span style={{ fontSize: '1.5rem' }}>{e.emote}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}