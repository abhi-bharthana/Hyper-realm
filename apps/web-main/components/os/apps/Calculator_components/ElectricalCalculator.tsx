'use client';

import React, { useState, useMemo } from 'react';

// ⚡ ELECTRICAL ENGINEERING MATH ENGINE
const ELEC_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "Ohm's Law": {
    inputs: ["Voltage (V)", "Current (A)", "Resistance (Ω)"],
    calculate: ([v, i, r]) => {
      // Smart Solver: Count valid inputs
      let count = 0;
      if (!isNaN(v)) count++;
      if (!isNaN(i)) count++;
      if (!isNaN(r)) count++;
      
      if (count !== 2) return [{ label: "Matrix Info", val: "Enter exactly 2 values" }];

      let calcV = v, calcI = i, calcR = r;
      if (isNaN(v)) calcV = i * r;
      if (isNaN(i)) calcI = v / r;
      if (isNaN(r)) calcR = v / i;

      const p = calcV * calcI;

      return [
        { label: "Voltage (V)", val: calcV.toFixed(2) + " V" },
        { label: "Current (I)", val: calcI.toFixed(2) + " A" },
        { label: "Resistance (R)", val: calcR.toFixed(2) + " Ω" },
        { label: "Power (P)", val: p.toFixed(2) + " W" }
      ];
    }
  },
  "Power Triangle": {
    inputs: ["Real Power (kW)", "Reactive Power (kVAR)"],
    calculate: ([p, q]) => {
      const s = Math.sqrt(p * p + q * q); // Apparent Power
      const pf = p / s; // Power Factor
      const theta = Math.acos(pf) * (180 / Math.PI); // Phase Angle in degrees
      return [
        { label: "Apparent Power (S)", val: s.toFixed(4) + " kVA" },
        { label: "Power Factor (PF)", val: pf.toFixed(4) },
        { label: "Phase Angle (θ)", val: theta.toFixed(2) + "°" }
      ];
    }
  },
  "Resistor Network": {
    inputs: ["Resistor 1 (Ω)", "Resistor 2 (Ω)"],
    calculate: ([r1, r2]) => {
      if (r1 === 0 && r2 === 0) return [{ label: "Error", val: "Resistors cannot be 0" }];
      const rSeries = r1 + r2;
      const rParallel = (r1 * r2) / (r1 + r2);
      return [
        { label: "Series (R_eq)", val: rSeries.toFixed(4) + " Ω" },
        { label: "Parallel (R_eq)", val: rParallel.toFixed(4) + " Ω" }
      ];
    }
  },
  "Capacitor Network": {
    inputs: ["Capacitor 1 (µF)", "Capacitor 2 (µF)"],
    calculate: ([c1, c2]) => {
      if (c1 === 0 && c2 === 0) return [{ label: "Error", val: "Capacitors cannot be 0" }];
      const cParallel = c1 + c2;
      const cSeries = (c1 * c2) / (c1 + c2);
      return [
        { label: "Parallel (C_eq)", val: cParallel.toFixed(4) + " µF" },
        { label: "Series (C_eq)", val: cSeries.toFixed(4) + " µF" }
      ];
    }
  },
  "Inductor Calculator": {
    inputs: ["Inductor 1 (mH)", "Inductor 2 (mH)"],
    calculate: ([l1, l2]) => {
      if (l1 === 0 && l2 === 0) return [{ label: "Error", val: "Inductors cannot be 0" }];
      const lSeries = l1 + l2;
      const lParallel = (l1 * l2) / (l1 + l2);
      return [
        { label: "Series (L_eq)", val: lSeries.toFixed(4) + " mH" },
        { label: "Parallel (L_eq)", val: lParallel.toFixed(4) + " mH" }
      ];
    }
  },
  "RC Circuit": {
    inputs: ["Resistance (Ω)", "Capacitance (µF)"],
    calculate: ([r, c_uF]) => {
      if (r <= 0 || c_uF <= 0) return [{ label: "Error", val: "Values must be > 0" }];
      const c = c_uF * 1e-6; // Convert to Farads
      const tau = r * c; // Time constant
      const fc = 1 / (2 * Math.PI * r * c); // Cutoff frequency
      return [
        { label: "Time Constant (τ)", val: (tau * 1000).toFixed(4) + " ms" },
        { label: "Cutoff Freq (f_c)", val: fc.toFixed(4) + " Hz" }
      ];
    }
  },
  "RL Circuit": {
    inputs: ["Resistance (Ω)", "Inductance (mH)"],
    calculate: ([r, l_mH]) => {
      if (r <= 0 || l_mH <= 0) return [{ label: "Error", val: "Values must be > 0" }];
      const l = l_mH * 1e-3; // Convert to Henrys
      const tau = l / r; // Time constant
      const fc = r / (2 * Math.PI * l); // Cutoff frequency
      return [
        { label: "Time Constant (τ)", val: (tau * 1000).toFixed(4) + " ms" },
        { label: "Cutoff Freq (f_c)", val: fc.toFixed(4) + " Hz" }
      ];
    }
  },
  "RLC Circuit": {
    inputs: ["Resistance (Ω)", "Inductance (mH)", "Capacitance (µF)"],
    calculate: ([r, l_mH, c_uF]) => {
      if (r <= 0 || l_mH <= 0 || c_uF <= 0) return [{ label: "Error", val: "Values must be > 0" }];
      const l = l_mH * 1e-3;
      const c = c_uF * 1e-6;
      
      const fr = 1 / (2 * Math.PI * Math.sqrt(l * c)); // Resonant frequency
      const q = (1 / r) * Math.sqrt(l / c); // Quality factor
      const damping = r / (2 * l); // Damping factor
      
      return [
        { label: "Resonant Freq (f_r)", val: fr.toFixed(4) + " Hz" },
        { label: "Quality Factor (Q)", val: q.toFixed(4) },
        { label: "Damping Factor (α)", val: damping.toFixed(4) }
      ];
    }
  },
  "Transformer Calculator": {
    inputs: ["Primary Turns (N₁)", "Secondary Turns (N₂)", "Primary Volts (V₁)"],
    calculate: ([n1, n2, v1]) => {
      if (n1 === 0) return [{ label: "Error", val: "Primary turns cannot be 0" }];
      const v2 = v1 * (n2 / n1);
      const ratio = n1 / n2;
      return [
        { label: "Secondary Volts (V₂)", val: v2.toFixed(4) + " V" },
        { label: "Turns Ratio (N₁:N₂)", val: ratio.toFixed(4) + " : 1" },
        { label: "Type", val: v2 > v1 ? "Step-Up ⬆" : "Step-Down ⬇" }
      ];
    }
  },
  "Three Phase Power": {
    inputs: ["Line Voltage (V_L)", "Line Current (I_L)", "Power Factor (PF 0-1)"],
    calculate: ([v, i, pf]) => {
      if (pf < 0 || pf > 1) return [{ label: "Error", val: "PF must be between 0 and 1" }];
      const p = Math.sqrt(3) * v * i * pf; // Real Power
      const s = Math.sqrt(3) * v * i;      // Apparent Power
      const theta = Math.acos(pf);
      const q = Math.sqrt(3) * v * i * Math.sin(theta); // Reactive Power
      
      return [
        { label: "Real Power (P)", val: (p / 1000).toFixed(4) + " kW" },
        { label: "Apparent Power (S)", val: (s / 1000).toFixed(4) + " kVA" },
        { label: "Reactive Power (Q)", val: (q / 1000).toFixed(4) + " kVAR" }
      ];
    }
  }
};

export const ElectricalCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = ELEC_MODULES[category];
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
    
    const parsedInputs = inputs.map((val) => val.trim() === '' ? NaN : parseFloat(val));
    
    // For Ohm's law we allow one empty input, others need all valid inputs
    if (category !== "Ohm's Law" && parsedInputs.some(isNaN)) return [];

    return engine.calculate(parsedInputs);
  }, [inputs, engine, category]);

  if (!engine) return null;

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full overflow-hidden">
      
      <div className="px-4 flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate ml-4">{category}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-4 pb-4">
         {category === "Ohm's Law" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Smart Matrix: Enter any 2 values, leave the 3rd blank.</p>
           </div>
         )}

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
            <div className="text-center text-white/30 text-sm">Enter parameters to compute</div>
          ) : (
            <div className="space-y-2">
              {results.map((res, idx) => (
                <div key={idx} className={`flex justify-between items-end pb-1 ${idx !== results.length - 1 ? 'border-b border-lime-500/10' : ''}`}>
                  <span className="text-white/50 text-xs uppercase tracking-widest">{res.label}</span>
                  <span className={`text-xl font-medium ${res.val.includes('Enter exactly') || res.val.includes('Error') ? 'text-red-400 text-sm' : 'text-lime-400'} font-mono max-w-[65%] text-right break-words`}>
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