'use client';

import React, { useState, useMemo } from 'react';

// 🏗️ CIVIL & MECHANICAL MATH ENGINE
const CIVIL_MECH_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "Beam Load Calculator": {
    inputs: ["Point Load (P in N)", "Length of Beam (L in m)"],
    // Assumes simply supported beam with point load at center
    calculate: ([p, l]) => {
      if (l <= 0) return [{ label: "Error", val: "Length must be > 0" }];
      const maxMoment = (p * l) / 4;
      const reactions = p / 2;
      return [
        { label: "Max Bending Moment", val: maxMoment.toFixed(2) + " N·m" },
        { label: "Support Reactions (R₁, R₂)", val: reactions.toFixed(2) + " N" },
        { label: "Note", val: "Simple Supported, Center Load" }
      ];
    }
  },
  "Stress Calculator": {
    inputs: ["Force/Load (N)", "Cross-Sectional Area (m²)"],
    calculate: ([f, a]) => {
      if (a === 0) return [{ label: "Error", val: "Area cannot be 0" }];
      const stress = f / a;
      return [
        { label: "Stress (σ)", val: stress.toExponential(4) + " Pa" },
        { label: "In MPa", val: (stress / 1e6).toFixed(4) + " MPa" }
      ];
    }
  },
  "Strain Calculator": {
    inputs: ["Change in Length (ΔL)", "Original Length (L₀)"],
    calculate: ([deltaL, l0]) => {
      if (l0 === 0) return [{ label: "Error", val: "Original length cannot be 0" }];
      const strain = deltaL / l0;
      return [
        { label: "Strain (ε)", val: strain.toExponential(4) },
        { label: "Percentage", val: (strain * 100).toFixed(4) + " %" }
      ];
    }
  },
  "Young's Modulus": {
    inputs: ["Stress (σ in Pa)", "Strain (ε)"],
    calculate: ([stress, strain]) => {
      if (strain === 0) return [{ label: "Error", val: "Strain cannot be 0" }];
      const e = stress / strain;
      return [
        { label: "Young's Modulus (E)", val: e.toExponential(4) + " Pa" },
        { label: "In GPa", val: (e / 1e9).toFixed(4) + " GPa" }
      ];
    }
  },
  "Gear Ratio": {
    inputs: ["Driven Gear Teeth (T_out)", "Drive Gear Teeth (T_in)", "Drive Speed (RPM, optional)"],
    calculate: ([t_out, t_in, rpm]) => {
      if (t_in === 0) return [{ label: "Error", val: "Drive gear teeth cannot be 0" }];
      const ratio = t_out / t_in;
      const res = [
        { label: "Gear Ratio", val: ratio.toFixed(4) + " : 1" },
        { label: "Type", val: ratio > 1 ? "Torque Multiplier ⬆" : "Speed Multiplier ⚡" }
      ];
      if (!isNaN(rpm) && rpm > 0) {
        res.push({ label: "Output Speed", val: (rpm / ratio).toFixed(2) + " RPM" });
      }
      return res;
    }
  },
  "Torque Calculator": {
    inputs: ["Force (F in N)", "Lever Arm Distance (r in m)", "Angle (θ degrees)"],
    calculate: ([f, r, theta]) => {
      const rad = theta * (Math.PI / 180);
      const torque = r * f * Math.sin(rad);
      return [{ label: "Torque (τ)", val: torque.toFixed(4) + " N·m" }];
    }
  },
  "Material Weight Calculator": {
    inputs: ["Volume (m³)", "Material Density (kg/m³)"],
    calculate: ([v, d]) => {
      const weight = v * d;
      return [
        { label: "Weight", val: weight.toFixed(2) + " kg" },
        { label: "In Tonnes", val: (weight / 1000).toFixed(4) + " t" }
      ];
    }
  },
  "Concrete Mix Calculator": {
    inputs: ["Wet Concrete Vol (m³)", "Cement Ratio", "Sand Ratio", "Aggregate Ratio"],
    // Uses standard dry volume conversion factor of 1.54
    calculate: ([wetVol, c, s, a]) => {
      if (c === 0 && s === 0 && a === 0) return [{ label: "Error", val: "Ratios cannot all be 0" }];
      const totalRatio = c + s + a;
      const dryVol = wetVol * 1.54; // Convert wet volume to dry volume
      
      const cementVol = (c / totalRatio) * dryVol;
      const sandVol = (s / totalRatio) * dryVol;
      const aggVol = (a / totalRatio) * dryVol;

      // Cement density ~ 1440 kg/m3. 1 bag = 50 kg => 1 bag = 0.0347 m3
      const cementBags = cementVol / 0.0347;

      return [
        { label: "Dry Volume Required", val: dryVol.toFixed(3) + " m³" },
        { label: "Cement", val: cementBags.toFixed(2) + " Bags (50kg)" },
        { label: "Sand", val: sandVol.toFixed(3) + " m³" },
        { label: "Aggregate", val: aggVol.toFixed(3) + " m³" }
      ];
    }
  }
};

export const CivilMechanicalCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = CIVIL_MECH_MODULES[category];
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
    
    // Check for empty required inputs (allow optional like RPM to be NaN)
    const parsedInputs = inputs.map((val) => val.trim() === '' ? NaN : parseFloat(val));
    
    // Require core inputs depending on category
    if (category === "Gear Ratio") {
      if (isNaN(parsedInputs[0]) || isNaN(parsedInputs[1])) return [];
    } else {
      if (parsedInputs.some(isNaN)) return [];
    }

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
         {category === "Concrete Mix Calculator" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Uses standard 1.54 dry volume factor. Cement bag = 50kg.</p>
           </div>
         )}
         
         {category === "Gear Ratio" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">RPM is optional. Enter teeth counts to find ratio.</p>
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