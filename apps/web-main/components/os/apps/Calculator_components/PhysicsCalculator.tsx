'use client';

import React, { useState, useMemo } from 'react';

const G_CONST = 6.6743e-11; // Universal Gravitational Constant
const g_earth = 9.80665; // Gravity on Earth
const c_speed = 299792458; // Speed of light

// ⚛️ PHYSICS MATH ENGINE
const PHYSICS_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "Kinetic Energy": {
    inputs: ["Mass (kg)", "Velocity (m/s)"],
    calculate: ([m, v]) => {
      const ke = 0.5 * m * v * v;
      return [{ label: "Kinetic Energy (K)", val: ke.toExponential(4) + " J" }];
    }
  },
  "Potential Energy": {
    inputs: ["Mass (kg)", "Height (m)", "Gravity (default 9.81 m/s²)"],
    calculate: ([m, h, g]) => {
      const grav = isNaN(g) ? g_earth : g; // Fallback to Earth's gravity
      const pe = m * grav * h;
      return [{ label: "Potential Energy (U)", val: pe.toExponential(4) + " J" }];
    }
  },
  "Momentum": {
    inputs: ["Mass (kg)", "Velocity (m/s)"],
    calculate: ([m, v]) => {
      return [{ label: "Momentum (p)", val: (m * v).toExponential(4) + " kg·m/s" }];
    }
  },
  "Work Done": {
    inputs: ["Force (N)", "Displacement (m)", "Angle (θ degrees)"],
    calculate: ([f, d, theta]) => {
      const rad = theta * (Math.PI / 180);
      const w = f * d * Math.cos(rad);
      return [{ label: "Work Done (W)", val: w.toFixed(4) + " J" }];
    }
  },
  "Projectile Motion": {
    inputs: ["Initial Velocity (u m/s)", "Angle of Projection (θ degrees)"],
    calculate: ([u, theta]) => {
      if (theta < 0 || theta > 90) return [{ label: "Error", val: "Angle must be 0-90°" }];
      const rad = theta * (Math.PI / 180);
      const t = (2 * u * Math.sin(rad)) / g_earth;
      const hMax = (u * u * Math.pow(Math.sin(rad), 2)) / (2 * g_earth);
      const r = (u * u * Math.sin(2 * rad)) / g_earth;
      return [
        { label: "Time of Flight", val: t.toFixed(4) + " s" },
        { label: "Max Height", val: hMax.toFixed(4) + " m" },
        { label: "Range", val: r.toFixed(4) + " m" }
      ];
    }
  },
  "Free Fall": {
    inputs: ["Time elapsed (t seconds)"],
    calculate: ([t]) => {
      const v = g_earth * t;
      const d = 0.5 * g_earth * t * t;
      return [
        { label: "Final Velocity (v)", val: v.toFixed(4) + " m/s" },
        { label: "Distance Fallen (d)", val: d.toFixed(4) + " m" }
      ];
    }
  },
  "Circular Motion": {
    inputs: ["Radius (m)", "Velocity (m/s)", "Mass (kg, optional)"],
    calculate: ([r, v, m]) => {
      if (r === 0) return [{ label: "Error", val: "Radius cannot be zero" }];
      const ac = (v * v) / r;
      const omega = v / r;
      const res = [
        { label: "Centripetal Accel (a_c)", val: ac.toFixed(4) + " m/s²" },
        { label: "Angular Vel (ω)", val: omega.toFixed(4) + " rad/s" }
      ];
      if (!isNaN(m)) res.push({ label: "Centripetal Force", val: (m * ac).toFixed(4) + " N" });
      return res;
    }
  },
  "Gravitation": {
    inputs: ["Mass 1 (kg)", "Mass 2 (kg)", "Distance (r meters)"],
    calculate: ([m1, m2, r]) => {
      if (r === 0) return [{ label: "Error", val: "Distance cannot be 0" }];
      const f = G_CONST * ((m1 * m2) / (r * r));
      return [{ label: "Gravitational Force (F)", val: f.toExponential(4) + " N" }];
    }
  },
  "Wave Equations": {
    inputs: ["Frequency (Hz)", "Wavelength (λ meters)"],
    calculate: ([f, l]) => {
      return [
        { label: "Wave Speed (v)", val: (f * l).toExponential(4) + " m/s" },
        { label: "Time Period (T)", val: (1 / f).toExponential(6) + " s" }
      ];
    }
  },
  "Lens Formula": {
    inputs: ["Focal Length (f)", "Object Distance (u)"],
    calculate: ([f, u]) => {
      // 1/f = 1/v - 1/u => 1/v = 1/f + 1/u => v = (f*u)/(f+u)
      if (f + u === 0) return [{ label: "Image (v)", val: "Infinity" }];
      const v = (f * u) / (u + f); // Sign convention standard output
      const m = v / u;
      return [
        { label: "Image Dist (v)", val: v.toFixed(4) },
        { label: "Magnification (m)", val: m.toFixed(4) }
      ];
    }
  },
  "Mirror Formula": {
    inputs: ["Focal Length (f)", "Object Distance (u)"],
    calculate: ([f, u]) => {
      // 1/f = 1/v + 1/u => 1/v = 1/f - 1/u => v = (f*u)/(u-f)
      if (u - f === 0) return [{ label: "Image (v)", val: "Infinity" }];
      const v = (f * u) / (u - f);
      const m = -v / u;
      return [
        { label: "Image Dist (v)", val: v.toFixed(4) },
        { label: "Magnification (m)", val: m.toFixed(4) }
      ];
    }
  },
  "Relativity Calculator": {
    inputs: ["Proper Time (Δt)", "Velocity as fraction of c (e.g. 0.8)"],
    calculate: ([t, v_frac]) => {
      if (v_frac >= 1) return [{ label: "Error", val: "v must be < 1c" }];
      const gamma = 1 / Math.sqrt(1 - (v_frac * v_frac));
      const dilatedT = t * gamma;
      const lengthContraction = t / gamma; // Reusing 't' as Length L₀ for a quick dual-calc
      return [
        { label: "Lorentz Factor (γ)", val: gamma.toFixed(4) },
        { label: "Dilated Time (Δt')", val: dilatedT.toFixed(4) },
        { label: "Length Contract. (L')", val: lengthContraction.toFixed(4) }
      ];
    }
  }
};

export const PhysicsCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = PHYSICS_MODULES[category];
  const [inputs, setInputs] = useState<string[]>(Array(engine?.inputs.length || 0).fill(''));

  React.useEffect(() => {
    setInputs(Array(engine?.inputs.length || 0).fill(''));
  }, [category, engine]);

  const handleInputChange = (index: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);
  };

  const results = useMemo(() => {
    if (!engine) return [];
    
    const numVals = inputs.map(v => v === '' ? NaN : parseFloat(v));
    // Require at least the first input to be valid (some modules like circular motion have optional mass)
    if (isNaN(numVals[0])) return [];
    
    return engine.calculate(numVals);
  }, [inputs, engine]);

  if (!engine) return null;

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full overflow-hidden">
      
      <div className="px-4 flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate ml-4">{category}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-4 pb-4">
         {engine.inputs.map((label, i) => (
           <div key={i} className="space-y-1.5">
             <label className="text-[10px] uppercase tracking-wider text-white/50 pl-4 font-medium">{label}</label>
             <input 
               type="number" 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all font-mono text-sm"
               placeholder={`Enter ${label.split('(')[0]}...`}
             />
           </div>
         ))}
      </div>

      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Fill parameters to compute</div>
          ) : (
            <div className="space-y-2">
              {results.map((res, idx) => (
                <div key={idx} className={`flex justify-between items-end pb-1 ${idx !== results.length - 1 ? 'border-b border-lime-500/10' : ''}`}>
                  <span className="text-white/50 text-xs uppercase tracking-widest">{res.label}</span>
                  <span className={`text-xl font-medium ${res.val.includes('Error') ? 'text-red-400' : 'text-lime-400'} font-mono max-w-[65%] text-right break-words`}>
                    {res.val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};