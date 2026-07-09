import React from 'react';
import { Terminal, Swords, Zap, Trophy, Shield, ArrowRight } from 'lucide-react';
import Hyperspeed from './Hyperspeed/Hyperspeed';

export default function Landing({ onNavigateToAuth }) {
  return (
    <div className="landing-root" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: 'var(--text-primary)',
      backgroundColor: '#000000'
    }}>
      {/* Background Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <Hyperspeed
          effectOptions={{
            distortion: 'turbulentDistortion',
            length: 400,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 1.5,
            carLightsFade: 0.4,
            totalSideLightSticks: 20,
            lightPairsPerRoadWay: 40,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [12, 80],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.8, 0.8],
            carFloorSeparation: [0, 5],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0xffffff,
              brokenLines: 0xffffff,
              leftCars: [0x00f2fe, 0x4facfe, 0x00e676],
              rightCars: [0x9b51e0, 0x701aed, 0xff007f],
              sticks: 0x00f2fe
            }
          }}
        />
      </div>

      {/* Dark overlay for readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(5, 5, 8, 0.4) 0%, rgba(5, 5, 8, 0.85) 90%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Header Navigation */}
      <header className="header landing-header" style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(5, 5, 8, 0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div className="landing-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="CodeDuel Logo" className="landing-brand-logo" style={{ width: '40px', height: '40px', borderRadius: 0 }} />
          <span className="logo-text landing-brand-text" style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 800 }}>CodeDuel</span>
        </div>
        <div className="landing-header-actions" style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => onNavigateToAuth(true)}
            className="btn btn-outline"
            style={{ padding: '8px 20px', fontSize: '0.9rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}
          >
            Log In
          </button>
          <button
            onClick={() => onNavigateToAuth(false)}
            className="btn btn-cyan"
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Hero content */}
      <main className="landing-hero" style={{
        position: 'relative',
        zIndex: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        
        {/* Hero Title */}
        <div className="animate-fade-in landing-copy" style={{ maxWidth: '800px', marginBottom: '40px' }}>
          <div className="landing-eyebrow" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            color: 'var(--color-cyan)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '20px'
          }}>
            <Terminal size={14} />
            The Ultimate Coding Arena
          </div>
          <h1 className="landing-title" style={{
            fontSize: '3.6rem',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '20px',
            color: '#f8fbff',
            textShadow: '0 0 24px rgba(0, 242, 254, 0.18)'
          }}>
            Clash in Speed.<br />
            Conquer the Algorithms.
          </h1>
          <p className="landing-subtitle" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.25rem',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto'
          }}>
            Prove your coding supremacy. Host custom rooms, duel friends in real-time, see their live progress, and claim your place in the global Hall of Fame.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onNavigateToAuth(false)}
          className="btn btn-cyan glow-pulse animate-fade-in landing-cta"
          style={{
            padding: '16px 36px',
            fontSize: '1.1rem',
            borderRadius: '12px',
            marginBottom: '60px'
          }}
        >
          Enter the Arena Now
          <ArrowRight size={20} />
        </button>

        {/* Feature Cards Grid */}
        <div className="animate-fade-in landing-feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          width: '100%'
        }}>
          
          <div className="glass-panel landing-feature-card" style={{ padding: '24px', textAlign: 'left', background: 'rgba(10, 11, 16, 0.45)' }}>
            <div style={{
              color: 'var(--color-cyan)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: 'rgba(0, 242, 254, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 242, 254, 0.1)'
            }}>
              <Swords size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Real-time Duels</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Connect instantly via Room Codes and face off in head-to-head algorithm battles.
            </p>
          </div>

          <div className="glass-panel landing-feature-card" style={{ padding: '24px', textAlign: 'left', background: 'rgba(10, 11, 16, 0.45)' }}>
            <div style={{
              color: 'var(--color-purple)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: 'rgba(155, 81, 224, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(155, 81, 224, 0.1)'
            }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Live Progress</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Track your opponent's line counts in real time. Know exactly when they are editing code or close to submitting.
            </p>
          </div>

          <div className="glass-panel landing-feature-card" style={{ padding: '24px', textAlign: 'left', background: 'rgba(10, 11, 16, 0.45)' }}>
            <div style={{
              color: 'var(--color-green)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: 'rgba(0, 230, 118, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 230, 118, 0.1)'
            }}>
              <Trophy size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Hall of Fame</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Win matches to secure points, improve your stats, and climb to the top of the global coder ranks.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(5, 5, 8, 0.4)'
      }}>
        &copy; {new Date().getFullYear()} CodeDuel. All rights reserved.
      </footer>
    </div>
  );
}
