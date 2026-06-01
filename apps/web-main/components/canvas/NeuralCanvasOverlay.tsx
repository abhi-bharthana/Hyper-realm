'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface CanvasOverlayRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

interface CanvasOverlayProps {
  isActive: boolean;
  tool: 'pen' | 'eraser' | 'none';
  color: string;
  brushSize: number;
}

export const NeuralCanvasOverlay = forwardRef<CanvasOverlayRef, CanvasOverlayProps>(({ isActive, tool, color, brushSize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // 🚀 HARDCORE MEMORY ENGINE
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  
  // 🚀 SMOOTHING ENGINE REF
  const pointsRef = useRef<{ x: number, y: number, pressure: number }[]>([]);

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyStep > 0) {
        setHistoryStep(prev => prev - 1);
        restoreState(history[historyStep - 1]);
      } else if (historyStep === 0) {
        setHistoryStep(-1);
        clearCanvas();
      }
    },
    redo: () => {
      if (historyStep < history.length - 1) {
        setHistoryStep(prev => prev + 1);
        restoreState(history[historyStep + 1]);
      }
    },
    clear: () => clearCanvas()
  }));

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const restoreState = (imageData: ImageData) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx && canvas) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(data);
      if (newHistory.length > 50) newHistory.shift(); 
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  // 🚀 RETINA DISPLAY / HIGH-DPI OPTIMIZATION
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
         const ctx = canvas.getContext('2d', { willReadFrequently: true });
         const data = ctx?.getImageData(0, 0, canvas.width, canvas.height);
         
         // Fix for blurry lines on Mac/iPad
         const dpr = window.devicePixelRatio || 1;
         const rect = parent.getBoundingClientRect();
         
         canvas.width = rect.width * dpr;
         canvas.height = rect.height * dpr;
         
         // Scale context to match physical CSS pixels
         ctx?.scale(dpr, dpr);
         canvas.style.width = `${rect.width}px`;
         canvas.style.height = `${rect.height}px`;

         if (data) ctx?.putImageData(data, 0, 0); // putImageData is not affected by scale
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 🚀 UPGRADED TO POINTER EVENTS (Apple Pencil & Mouse Uniformity)
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive || tool === 'none') return;
    
    // Lock canvas element to prevent scrolling while drawing on iPad
    const canvas = canvasRef.current;
    canvas?.setPointerCapture(e.pointerId);
    
    setIsDrawing(true);
    
    const rect = canvas!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Start tracking points for smooth curves
    pointsRef.current = [{ x, y, pressure: e.pressure || 0.5 }];
    
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    canvas?.releasePointerCapture(e.pointerId);
    
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    ctx?.beginPath(); // Close the path
    pointsRef.current = []; // Clear current stroke points
    
    saveState(); 
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive || tool === 'none') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pointerType === 'pen' ? e.pressure : 1; // Apple Pencil pressure tracking

    pointsRef.current.push({ x, y, pressure });
    const points = pointsRef.current;

    // 🚀 QUADRATIC BEZIER CURVE SMOOTHING
    // Minimum 3 points required to calculate a smooth curve through midpoints
    if (points.length >= 3) {
      const lastTwoPoints = points.slice(-2);
      const controlPoint = lastTwoPoints[0];
      const endPoint = {
        x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
        y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
      };

      // Dynamic Brush size based on Pencil Pressure (Min 20% thickness)
      const dynamicWidth = brushSize * (0.2 + (pressure * 0.8));
      
      ctx.lineWidth = dynamicWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 3; // Eraser is naturally thicker
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }

      ctx.beginPath();
      // Start from the last midpoint
      const previousEndPoint = points.length > 3 
        ? {
            x: (points[points.length - 3].x + points[points.length - 2].x) / 2,
            y: (points[points.length - 3].y + points[points.length - 2].y) / 2
          }
        : points[0];
        
      ctx.moveTo(previousEndPoint.x, previousEndPoint.y);
      ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-20 touch-none ${
        isActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      }`}
      // Used PointerEvents for unified Mouse + Touch + Stylus handling
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerOut={stopDrawing}
      onPointerCancel={stopDrawing}
    />
  );
});