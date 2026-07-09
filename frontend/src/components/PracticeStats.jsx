import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ParticleCard, GlobalSpotlight } from './MagicBento';

const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');

const createSparklinePath = (points) => {
  if (!points.length) return '';
  const maxCount = Math.max(...points.map((p) => p.count), 1);
  const widthStep = 220 / (points.length - 1);
  return points
    .map((point, idx) => {
      const x = idx * widthStep + 10;
      const y = 100 - (point.count / maxCount) * 72 - 10;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const Sparkline = ({ points, mounted }) => {
  const pathData = createSparklinePath(points);
  return (
    <svg viewBox="0 0 240 120" style={{ width: '100%', height: '100%', flex: 1 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#9b51e0" />
        </linearGradient>
      </defs>
      <path d={pathData} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" opacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathData} fill="none" stroke="url(#sparkGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1000, strokeDashoffset: mounted ? 0 : 1000, transition: 'stroke-dashoffset 1.4s ease-out' }} />
    </svg>
  );
};

export default function PracticeStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const statsGridRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/practice/me/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch practice stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  useEffect(() => {
    if (!loading && stats) {
      const timer = window.setTimeout(() => setMounted(true), 120);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [loading, stats]);

  if (!token) return null;
  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading practice stats...</div>;
  if (!stats) return null;

  const topics = Object.entries(stats.byTopic || {}).sort((a, b) => b[1].total - a[1].total).slice(0, 6);
  const maxTopicCount = Math.max(1, ...topics.map(([, info]) => info.total));
  const recentRuns = stats.recent || [];

  const dayBuckets = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toDateString();
    dayBuckets.push({ key, label: date.toLocaleDateString('en-US', { weekday: 'short' }), count: 0 });
  }

  recentRuns.forEach((run) => {
    const runDate = new Date(run.createdAt).toDateString();
    const bucket = dayBuckets.find((day) => day.key === runDate);
    if (bucket) bucket.count += 1;
  });

  const activeDays = dayBuckets.filter((day) => day.count > 0).length;
  const activityTotal = dayBuckets.reduce((sum, day) => sum + day.count, 0);
  const activeScore = Math.min(100, Math.round((activityTotal / 14) * 100));
  const averageDaily = activeDays ? (activityTotal / activeDays).toFixed(1) : '0.0';
  const pathData = createSparklinePath(dayBuckets);

  return (
    <div className="glass-panel glass-panel-glow-cyan practice-stats-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(0, 242, 254, 0.18)' }}>
      <GlobalSpotlight gridRef={statsGridRef} spotlightRadius={320} glowColor="0, 242, 254" />
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Practice Stats</h3>
        <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>A clean overview of your recent activity, momentum, and engagement.</p>
      </div>

      <div ref={statsGridRef} className="bento-section practice-stats-grid" style={{ display: 'grid', gap: '18px', gridTemplateColumns: '2.2fr 1fr 1.2fr', alignItems: 'stretch', minHeight: '320px' }}>
        <ParticleCard
          className="magic-bento-card--border-glow"
          style={{ borderRadius: '24px', width: '100%', padding: 0, backgroundColor: 'transparent' }}
          glowColor="0, 242, 254"
          particleCount={14}
          enableTilt={false}
          clickEffect={false}
          enableMagnetism={false}
        >
          <div className="glass-panel glass-panel-glow-cyan practice-stat-card" style={{ padding: '20px', borderRadius: '22px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>PRACTICE MOMENTUM</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>Topic progress</div>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-cyan)' }}>{topics.length} topics</div>
            </div>
            <div style={{ display: 'grid', gap: '16px', flex: 1, overflow: 'hidden' }}>
              {topics.map(([topic, info]) => {
                const percent = Math.round((info.total / maxTopicCount) * 100);
                return (
                  <div key={topic} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 700 }}>{topic.toUpperCase()}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{info.total} runs</div>
                      </div>
                      <div style={{ color: 'var(--color-green)', fontWeight: 800 }}>{percent}%</div>
                    </div>
                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: mounted ? `${percent}%` : '0%', height: '100%', background: 'linear-gradient(90deg, rgba(0,242,254,0.95), rgba(155,81,224,0.95))', transition: 'width 1s ease-out', borderRadius: '999px', boxShadow: '0 0 16px rgba(0,242,254,0.18)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ParticleCard>

        <ParticleCard
          className="magic-bento-card--border-glow"
          style={{ borderRadius: '24px', width: '100%', padding: 0, backgroundColor: 'transparent' }}
          glowColor="0, 242, 254"
          particleCount={12}
          enableTilt={false}
          clickEffect={false}
          enableMagnetism={false}
        >
          <div className="glass-panel glass-panel-glow-cyan practice-stat-card practice-activity-card" style={{ padding: '22px', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>SITE ACTIVITY</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{activeScore}%</div>
              </div>
              <div style={{ width: '62px', height: '62px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#activityGradient)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={mounted ? 251.2 - (251.2 * activeScore) / 100 : 251.2}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="activityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#9b51e0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>7D</div>
              </div>
            </div>
            <div className="practice-chart-box" style={{ display: 'grid', flex: 1, minHeight: '180px', borderRadius: '18px', overflow: 'hidden' }}>
              <Sparkline points={dayBuckets} mounted={mounted} />
            </div>
            <div style={{ marginTop: '14px', display: 'grid', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Weekly runs</span>
                <span>{activityTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active days</span>
                <span>{activeDays}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Trend score</span>
                <span>{Math.round((activityTotal / 7) * 10) / 10}</span>
              </div>
            </div>
          </div>
        </ParticleCard>

        <ParticleCard
          className="magic-bento-card--border-glow"
          style={{ borderRadius: '22px', width: '100%', padding: 0, backgroundColor: 'transparent' }}
          glowColor="155, 81, 224"
          particleCount={10}
          enableTilt={false}
          clickEffect={false}
          enableMagnetism={false}
        >
          <div className="glass-panel glass-panel-glow-purple practice-stat-card practice-engagement-card" style={{ padding: '20px', borderRadius: '22px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>ENGAGEMENT GRAPH</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Weekly activity</div>
              </div>
              <span style={{ padding: '6px 12px', borderRadius: '999px', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' }}>Live</span>
            </div>

            <div className="practice-chart-box" style={{ position: 'relative', flex: 1, minHeight: '180px', display: 'flex', borderRadius: '16px', overflow: 'hidden' }}>
              <svg viewBox="0 0 240 120" style={{ width: '100%', height: '100%', flex: 1 }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#9b51e0" />
                  </linearGradient>
                </defs>
                <path d={pathData} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" opacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d={pathData} fill="none" stroke="url(#sparkGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1000, strokeDashoffset: mounted ? 0 : 1000, transition: 'stroke-dashoffset 1.4s ease-out' }} />
              </svg>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Weekly runs</span>
                <span>{activityTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Active days</span>
                <span>{activeDays}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Trend score</span>
                <span>{Math.round((activityTotal / 7) * 10) / 10}</span>
              </div>
            </div>
          </div>
        </ParticleCard>
      </div>
    </div>
  );
}
