'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  "Initializing Hyper Kernel",
  "Loading Realm Engine",
  "Neural Context Ready",
  "Secure Gateway Enabled",
  "Booting Identity Layer",
  "Syncing Intelligence Matrix",
  "Launching Hyper Realm"
];

interface BootScreenProps {
  onBootComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Energy Sync...");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; dur: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: 5 + Math.random() * 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    BOOT_LOGS.forEach((log, i) => {
      setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log]);
      }, 1700 + i * 500);
    });
  }, []);

  useEffect(() => {
    const bootInterval = setInterval(() => {
      setProgress((p) => {
        const nextProgress = p + 1;
        
        if (nextProgress < 30) setStatus("Energy Sync...");
        else if (nextProgress < 70) setStatus("Initializing Neural Core...");
        else setStatus("Launching Hyper Realm...");

        if (nextProgress >= 100) {
          clearInterval(bootInterval);
          setShowFlash(true);
          setTimeout(() => {
            onBootComplete();
          }, 800); 
        }

        return nextProgress > 100 ? 100 : nextProgress;
      });
    }, 65);

    return () => clearInterval(bootInterval);
  }, [onBootComplete]);

  return (
    <>
      <style>{`
        .boot-screen-container {
          --bg: #030305;
          --primary: #8d6bff;
          --cyan: #52d9ff;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          background: radial-gradient(circle at center, rgba(141,107,255,.09), rgba(82,217,255,.04), transparent 55%), #020204;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
        }

        .center-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(141,107,255,.16), rgba(82,217,255,.06), transparent 70%);
          filter: blur(60px);
          animation: pulseGlow 4s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }

        .particles span {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(255,255,255,.6);
          animation: float linear infinite;
        }

        @keyframes float {
          from { transform: translateY(0); opacity: 0; }
          15% { opacity: .7; }
          to { transform: translateY(-120vh); opacity: 0; }
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 18px;
          z-index: 10;
        }

        .word { display: flex; }

        .char {
          font-size: 84px;
          font-weight: 900;
          letter-spacing: 8px;
          opacity: 0;
          transform: translateY(40px) scale(.92);
          filter: blur(12px);
          animation: charIn .9s forwards;
          text-shadow: 0 0 30px rgba(141,107,255,.15);
        }

        @keyframes charIn {
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .char:nth-child(1) { animation-delay: .1s; }
        .char:nth-child(2) { animation-delay: .2s; }
        .char:nth-child(3) { animation-delay: .3s; }
        .char:nth-child(4) { animation-delay: .4s; }
        .char:nth-child(5) { animation-delay: .5s; }
        .os-char:nth-child(1) { animation-delay: 1.2s; }
        .os-char:nth-child(2) { animation-delay: 1.3s; }

        .lightning-wrap {
          position: relative;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(.3);
          animation: lightningReveal .9s cubic-bezier(.2,.9,.2,1) forwards;
          animation-delay: .8s;
        }

        @keyframes lightningReveal {
          0% { opacity: 0; transform: scale(.3); }
          70% { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .energy-ring {
          position: absolute;
          width: 135px;
          height: 135px;
          border-radius: 50%;
          border: 1px solid rgba(141,107,255,.15);
          animation: ringRotate 10s linear infinite;
        }

        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .energy-ring::before {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8d6bff;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 15px #8d6bff, 0 0 45px #8d6bff;
        }

        .lightning {
          width: 92px;
          z-index: 5;
          filter: drop-shadow(0 0 14px rgba(141,107,255,.8)) drop-shadow(0 0 40px rgba(82,217,255,.5));
          animation: electricPulse 2.3s infinite ease-in-out;
        }

        @keyframes electricPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .ripple {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          border: 2px solid rgba(141,107,255,.5);
          animation: ripple 1.4s ease-out infinite;
          animation-delay: 1s;
        }

        @keyframes ripple {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 220px; height: 220px; opacity: 0; }
        }

        .tagline {
          margin-top: 25px;
          color: rgba(255,255,255,.65);
          letter-spacing: 5px;
          font-size: 14px;
          opacity: 0;
          transform: translateY(20px);
          animation: taglineIn .8s forwards;
          animation-delay: 1.6s;
        }

        @keyframes taglineIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .flash-overlay {
          position: fixed;
          inset: 0;
          background: white;
          opacity: 0;
          pointer-events: none;
          z-index: 9999;
        }

        .flash-overlay.active {
          animation: launchFlash 0.8s ease forwards;
        }

        @keyframes launchFlash {
          0% { opacity: 0 }
          20% { opacity: 0.85 }
          100% { opacity: 0 }
        }
      `}</style>

      <div className="boot-screen-container">
        <div className="center-glow"></div>

        <div className="particles">
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                left: `${p.left}vw`,
                top: `${p.top}vh`,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`
              }}
            />
          ))}
        </div>

        <div className="logo-row">
          <div className="word">
            <span className="char">H</span>
            <span className="char">Y</span>
            <span className="char">P</span>
            <span className="char">E</span>
            <span className="char">R</span>
          </div>

          <div className="lightning-wrap">
            <div className="energy-ring"></div>
            <div className="ripple"></div>
            
            <svg className="lightning" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#8d6bff"/>
                  <stop offset="100%" stopColor="#52d9ff"/>
                </linearGradient>
              </defs>
              <path fill="url(#g)" d="M72 5 L30 58 H57 L42 115 L92 48 H66 Z" />
            </svg>
          </div>

          <div className="word">
            <span className="char os-char">O</span>
            <span className="char os-char">S</span>
          </div>
        </div>

        <div className="tagline">
          INITIALIZING HYPER REALM
        </div>

        <div style={{ marginTop: '45px', width: '520px', minHeight: '140px', fontSize: '14px', color: '#aaa' }}>
          <AnimatePresence>
            {visibleLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3"
              >
                <span style={{ color: '#66ffb4' }}>✓</span> {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={{ width: '420px', marginTop: '10px' }}>
          <div style={{ height: '4px', background: 'rgba(255,255,255,.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8d6bff, #52d9ff)',
              boxShadow: '0 0 20px rgba(141,107,255,.7)',
              transition: 'width 0.1s linear'
            }} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,.55)', fontSize: '13px' }}>
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      <div className={`flash-overlay ${showFlash ? 'active' : ''}`} />
    </>
  );
};