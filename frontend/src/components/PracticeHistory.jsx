import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ParticleCard, GlobalSpotlight } from './MagicBento';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export default function PracticeHistory({ token, onClose }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/practice/me/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  if (!token) return null;

  const historyGridRef = useRef(null);

  return (
    <div style={{ padding: '28px', minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(0,242,254,0.08), transparent 45%), rgba(5,5,8,0.98)' }}>
      <GlobalSpotlight gridRef={historyGridRef} spotlightRadius={340} glowColor="0, 242, 254" />
      <div style={{ width: '100%', maxWidth: '1120px', margin: '0 auto', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>PRACTICE HISTORY</div>
            <h1 style={{ fontSize: '2.7rem', margin: 0, lineHeight: 1.05 }}>Your recent runs and topic streaks</h1>
          </div>
          <button onClick={onClose} className="btn btn-cyan glow-pulse" style={{ padding: '14px 24px', borderRadius: '18px' }}>Back to Dashboard</button>
        </div>

        <div ref={historyGridRef} className="bento-section" style={{ display: 'grid', gap: '18px', gridTemplateColumns: '1fr 320px', marginBottom: '24px' }}>
          <ParticleCard className="magic-bento-card--border-glow" style={{ width: '100%', padding: 0, backgroundColor: 'transparent', borderRadius: '24px' }} glowColor="0, 242, 254" particleCount={14} enableTilt={false} clickEffect={false} enableMagnetism={false}>
            <div className="glass-panel glass-panel-glow-cyan" style={{ padding: '24px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>FILTER</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Recent practice</div>
                </div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '14px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', minWidth: '160px' }}>
                  <option value="all" style={{ color: 'var(--text-secondary)', background: 'transparent' }}>All Topics</option>
                  {stats && Object.keys(stats.byTopic || {}).map((t) => (<option key={t} value={t} style={{ color: 'var(--text-secondary)', background: 'transparent' }}>{t}</option>))}
                </select>
              </div>

              {loading && <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>}

              {!loading && (!stats || (stats.recent || []).length === 0) && (
                <div style={{ color: 'var(--text-muted)' }}>No practice runs yet.</div>
              )}

              {!loading && stats && (
                <div style={{ display: 'grid', gap: '12px', maxHeight: 'calc(100vh - 420px)', overflow: 'auto', paddingRight: '4px' }}>
                  {(stats.recent || []).filter((r) => filter === 'all' || (r.topic || 'all') === filter).map((r, idx) => (
                    <div key={r._id || idx} style={{ padding: '18px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{r.problemId?.title || r.problemTitle || 'Problem'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{(r.topic || 'all').toUpperCase()} • {new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{Math.round(r.timeTaken)}s</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>{r.linesWritten} lines • {r.language || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ParticleCard>

          <div style={{ display: 'grid', gap: '18px' }}>
            <ParticleCard className="magic-bento-card--border-glow" style={{ width: '100%', padding: 0, backgroundColor: 'transparent', borderRadius: '24px' }} glowColor="0, 242, 254" particleCount={10} enableTilt={false} clickEffect={false} enableMagnetism={false}>
              <div className="glass-panel glass-panel-glow-cyan" style={{ padding: '24px', borderRadius: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>OVERVIEW</div>
                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600 }}><span>Total runs</span><span>{stats?.totalRuns || 0}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600 }}><span>Topic count</span><span>{Object.keys(stats?.byTopic || {}).length}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600 }}><span>Best streak</span><span>{Math.max(0, ...(Object.values(stats?.byTopic || {}).map((topic) => topic.total || 0)))} runs</span></div>
                </div>
              </div>
            </ParticleCard>

            <ParticleCard className="magic-bento-card--border-glow" style={{ width: '100%', padding: 0, backgroundColor: 'transparent', borderRadius: '24px' }} glowColor="155, 81, 224" particleCount={10} enableTilt={false} clickEffect={false} enableMagnetism={false}>
              <div className="glass-panel glass-panel-glow-purple" style={{ padding: '24px', borderRadius: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>TOP TOPICS</div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {stats?.byTopic && Object.entries(stats.byTopic).slice(0, 5).map(([topic, info]) => (
                    <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <span>{topic.toUpperCase()}</span>
                      <span>{info.total} runs</span>
                    </div>
                  ))}
                </div>
              </div>
            </ParticleCard>
          </div>
        </div>
      </div>
    </div>
  );
}
