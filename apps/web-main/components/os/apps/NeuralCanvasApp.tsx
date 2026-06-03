'use client';

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Network, Activity } from 'lucide-react';

// 🧠 Math string parser for the canvas engine
const evaluateFx = (funcStr: string, xVal: number): number => {
  try {
    let safeStr = funcStr.toLowerCase()
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/\^/g, '**')
      .replace(/(\d)x/g, '$1*x');

    const mathFunc = new Function('x', `return ${safeStr}`);
    return mathFunc(xVal);
  } catch (err) {
    return NaN;
  }
};

export const NeuralCanvasApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeEquation, clearCanvas } = useCanvasStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Drawing Logic abstracted so it handles Window Resizes
    const drawGraph = () => {
        // Handle High-DPI Displays (Retina/MacBooks)
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 40; // Pixels per unit (Zoom level)

        // Clear Canvas & draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(1, '#13131c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw Grid Network
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= width; x += scale) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (let y = 0; y <= height; y += scale) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();

        // Draw X and Y Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); // X Axis
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); // Y Axis
        ctx.stroke();

        // If an equation is passed from Calculator, plot it!
        if (activeEquation) {
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#8d6bff'; // Neural Canvas signature neon purple
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#8d6bff';
          ctx.lineJoin = 'round';

          let firstPoint = true;

          for (let px = 0; px < width; px++) {
            // Convert screen pixel X to graph math X
            const graphX = (px - centerX) / scale;
            
            // Calculate Y using our mathematical engine
            const graphY = evaluateFx(activeEquation, graphX);
            
            if (!isNaN(graphY) && isFinite(graphY)) {
              // Convert graph math Y back to screen pixel Y
              const py = centerY - (graphY * scale);

              if (firstPoint) {
                ctx.moveTo(px, py);
                firstPoint = false;
              } else {
                ctx.lineTo(px, py);
              }
            }
          }
          ctx.stroke();
        }
    };

    drawGraph();

    // Re-draw on window resize
    const resizeObserver = new ResizeObserver(() => drawGraph());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [activeEquation]); // Re-render when calculator sends new equation

  return (
    <div className="w-full h-full flex flex-col bg-black/40 backdrop-blur-3xl overflow-hidden rounded-b-xl">
      
      {/* Sleek Neural Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#8d6bff]" />
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Neural Canvas</h2>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
             <Activity className="w-3 h-3 text-lime-400 animate-pulse" />
             {activeEquation ? `Intercepting: f(x) = ${activeEquation}` : 'Standby Mode'}
          </span>
          {activeEquation && (
             <button onClick={clearCanvas} className="ml-4 text-[10px] uppercase tracking-wider px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/40 transition-colors">
               Clear
             </button>
          )}
        </div>
      </div>

      {/* The HTML5 Rendering Engine */}
      <div ref={containerRef} className="flex-1 w-full h-full relative cursor-crosshair">
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>
      
    </div>
  );
};