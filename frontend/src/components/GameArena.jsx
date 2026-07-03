import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Play, Send, Users, MessageSquare, AlertCircle,
  Award, Hourglass, CheckCircle2, XCircle, Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python 3' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' }
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
      return `def ${functionName}():\n    # Write your code here\n    pass\n`;
    case 'cpp':
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  // Write your code here\n  return 0;\n}\n`;
    case 'c':
      return `#include <stdio.h>\n\nint main() {\n  // Write your code here\n  return 0;\n}\n`;
    case 'java':
      return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n`;
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

    socket.emit('join-room', {
      roomCode: room.roomCode,
      userId: user.id,
      username: user.username
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
    <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

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

      <header className="header">
        <div className="logo-container">
          <span className="logo-text">⚡ ROOM: {room.roomCode}</span>
        </div>

        {gameState === 'live' && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: '1.1rem',
            color: 'var(--color-cyan)',
            fontWeight: '700',
            background: 'rgba(0, 242, 254, 0.08)',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(0, 242, 254, 0.15)'
          }}>
            ⏳ {formatTime(timer)}
          </div>
        )}

        <button onClick={onLeave} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Leave Arena
        </button>
      </header>

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
                    {roomSettings.mode === '1v1' ? '1v1 speed duel' : roomSettings.mode === 'practice' ? 'solo practice' : 'multiplayer brawl'}
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
        <div className="ide-grid" style={{ flex: 1 }}>

          {/* Column 1: Problem Description */}
          <div className="panel animate-fade-in" style={{ borderRadius: '12px' }}>
            <div className="panel-header">
              <span>Problem Description</span>
              <span style={{ color: 'var(--color-cyan)', fontWeight: '600' }}>{problem.difficulty || 'Medium'}</span>
            </div>
            <div className="panel-body" style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>{problem.title}</h2>
              <pre style={{
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem',
                color: 'var(--text-secondary)'
              }}>{problem.description}</pre>
            </div>
          </div>

          {/* Column 2: Code Editor */}
          <div className="panel animate-fade-in" style={{ borderRadius: '12px' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Code Editor</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-cyan)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <textarea
                value={code}
                onChange={handleCodeEdit}
                onKeyDown={handleKeyDown}
                className="code-editor-textarea"
                placeholder={`// Write your ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language} code here...`}
              />
            </div>
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Dry Run Output Panel */}
              {runResult && (
                <div style={{
                  fontSize: '0.88rem',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: '700', color: runResult.allPassed ? 'var(--color-green)' : 'var(--color-amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {runResult.allPassed ? '🚀 Dry Run: All Sample Test Cases Passed!' : `⚠️ Dry Run: ${runResult.testCasesPassed}/${runResult.totalTestCases} Test Cases Passed`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                    {runResult.results?.map((res, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '6px' }}>
                        <span style={{ color: res.passed ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 'bold' }}>
                          {res.passed ? '✓ Pass' : '✗ Fail'}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>Test Case #{idx + 1}</span>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingLeft: '14px', marginTop: '2px', wordBreak: 'break-all' }}>
                          Input: {res.input?.substring(0, 50)} <br/>
                          Expected: {res.expectedOutput} | Actual: {res.actualOutput || 'none'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                width: '100%'
              }}>
                <div>
                  {submissionResult && (
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: submissionResult.error ? 'var(--color-red)' : submissionResult.allPassed ? 'var(--color-green)' : 'var(--color-amber)'
                    }}>
                      {submissionResult.error ? (
                        <span>❌ {submissionResult.error}</span>
                      ) : submissionResult.allPassed ? (
                        <span>🏆 Victory! Code Accepted!</span>
                      ) : (
                        <span>⚠️ {submissionResult.testCasesPassed}/{submissionResult.totalTestCases} Passed (Wrong Answer)</span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleRun}
                    disabled={running || submitting}
                    className="btn btn-outline"
                    style={{ padding: '10px 18px', fontSize: '0.95rem' }}
                  >
                    {running ? <Loader2 className="spin" size={16} /> : null}
                    <span>Run Code</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || running}
                    className="btn btn-cyan"
                    style={{ padding: '10px 24px', fontSize: '0.95rem' }}
                  >
                    {submitting ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
                    <span>Submit Code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Live Stats & Activity */}
          <div className="panel animate-fade-in" style={{ borderRadius: '12px' }}>
            <div className="panel-header">
              <span>Arena Statistics</span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
              
              {/* Competitors List */}
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {roomSettings.mode === 'practice' ? 'Solo Practice' : 'Competitors'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-cyan)' }}>You ({user.username})</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {code.split('\n').length} lines
                    </span>
                  </div>

                  {/* Render Opponents if not practice mode */}
                  {roomSettings.mode !== 'practice' && (
                    <>
                      {roomSettings.mode === '1v1' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-purple)' }}>Opponent</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {opponentLines} lines
                          </span>
                        </div>
                      ) : (
                        // Multiplayer
                        players.filter(p => p.username !== user.username).map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', color: 'var(--color-purple)' }}>{p.username}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {playerLines[p.username] || 0} lines
                            </span>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Emotes Reaction Bar (Only for non-practice modes) */}
              {roomSettings.mode !== 'practice' && (
                <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>
                    Reactions
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['🤯', '🚀', '🔥', '👍', '😢', '😂', 'GG'].map((em) => (
                      <button
                        key={em}
                        onClick={() => {
                          socket?.emit('send-emote', {
                            roomCode: room.roomCode,
                            username: user.username,
                            emote: em
                          });
                        }}
                        className="btn btn-outline"
                        style={{ padding: '4px', fontSize: '1.2rem', minWidth: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Panel (Only for non-practice modes) */}
              {roomSettings.mode !== 'practice' && (
                <div className="glass-panel" style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.01)',
                  minHeight: '200px'
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-color)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <MessageSquare size={14} />
                    <span>Arena Chat</span>
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {chatMessages.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                        marginTop: '20px'
                      }}>
                        Send a message to competitors!
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isMe = msg.username === user.username;
                        return (
                          <div key={idx} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%'
                          }}>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-secondary)',
                              marginBottom: '2px',
                              textAlign: isMe ? 'right' : 'left'
                            }}>
                              {msg.username}
                            </div>
                            <div style={{
                              padding: '8px 12px',
                              borderRadius: '12px',
                              borderTopRightRadius: isMe ? '2px' : '12px',
                              borderTopLeftRadius: !isMe ? '2px' : '12px',
                              background: isMe ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'rgba(255,255,255,0.06)',
                              color: isMe ? '#020617' : 'var(--text-primary)',
                              fontSize: '0.85rem',
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
                  }} style={{
                    padding: '10px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="form-input"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    />
                    <button type="submit" className="btn btn-purple" style={{ padding: '8px 12px' }}>
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              )}

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
  );
}