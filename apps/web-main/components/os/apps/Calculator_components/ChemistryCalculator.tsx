'use client';

import React, { useState, useMemo } from 'react';

// ⚛️ ATOMIC MASS DATABASE (For Molecular Mass Parser)
const ATOMIC_MASSES: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998,
  Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45,
  K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.87, I: 126.90
};

// 🧪 CHEMISTRY MATH ENGINE
const CHEM_MODULES: Record<string, { inputs: string[], isText?: boolean[], calculate: (vals: any[]) => { label: string, val: string }[] }> = {
  "Molarity": {
    inputs: ["Moles of Solute (n)", "Volume of Solution (L)"],
    calculate: ([n, v]) => {
      if (v === 0) return [{ label: "Error", val: "Volume cannot be zero" }];
      const m = n / v;
      return [{ label: "Molarity (M)", val: m.toFixed(4) + " mol/L" }];
    }
  },
  "Molality": {
    inputs: ["Moles of Solute (n)", "Mass of Solvent (kg)"],
    calculate: ([n, m_kg]) => {
      if (m_kg === 0) return [{ label: "Error", val: "Mass cannot be zero" }];
      const m = n / m_kg;
      return [{ label: "Molality (m)", val: m.toFixed(4) + " mol/kg" }];
    }
  },
  "Normality": {
    inputs: ["Molarity (M)", "Equivalence Factor (n)"],
    calculate: ([m, eq]) => {
      return [{ label: "Normality (N)", val: (m * eq).toFixed(4) + " eq/L" }];
    }
  },
  "pH Calculator": {
    inputs: ["H⁺ Concentration (mol/L)"],
    calculate: ([h_plus]) => {
      if (h_plus <= 0) return [{ label: "Error", val: "[H⁺] must be > 0" }];
      const ph = -Math.log10(h_plus);
      const poh = 14 - ph;
      return [
        { label: "pH Level", val: ph.toFixed(4) },
        { label: "pOH Level", val: poh.toFixed(4) },
        { label: "Nature", val: ph < 7 ? "Acidic 🔴" : ph > 7 ? "Basic 🔵" : "Neutral 🟢" }
      ];
    }
  },
  "Ideal Gas Law": {
    inputs: ["Moles (n)", "Temperature (Kelvin)", "Volume (Liters)"],
    calculate: ([n, t, v]) => {
      if (v === 0) return [{ label: "Error", val: "Volume cannot be zero" }];
      const R = 0.08206; // L·atm/(mol·K)
      const p = (n * R * t) / v;
      return [{ label: "Pressure (P)", val: p.toFixed(4) + " atm" }];
    }
  },
  "Dilution Calculator": {
    inputs: ["Initial Molarity (M₁)", "Initial Volume (V₁)", "Final Molarity (M₂)"],
    calculate: ([m1, v1, m2]) => {
      if (m2 === 0) return [{ label: "Error", val: "M₂ cannot be zero" }];
      const v2 = (m1 * v1) / m2;
      return [
        { label: "Final Volume (V₂)", val: v2.toFixed(4) + " units" },
        { label: "Volume to Add", val: (v2 - v1).toFixed(4) + " units" }
      ];
    }
  },
  "Molecular Mass": {
    inputs: ["Chemical Formula (e.g., H2O, CO2)"],
    isText: [true], // This input takes text instead of numbers
    calculate: ([formula]: string[]) => {
      const regex = /([A-Z][a-z]*)(\d*)/g;
      let match;
      let totalMass = 0;
      let valid = false;

      while ((match = regex.exec(formula)) !== null) {
        valid = true;
        const element = match[1];
        const count = match[2] === '' ? 1 : parseInt(match[2], 10);
        
        if (ATOMIC_MASSES[element]) {
          totalMass += ATOMIC_MASSES[element] * count;
        } else {
          return [{ label: "Error", val: `Unknown element: ${element}` }];
        }
      }
      
      if (!valid) return [{ label: "Error", val: "Invalid Format" }];
      return [{ label: "Molar Mass", val: totalMass.toFixed(4) + " g/mol" }];
    }
  },
  "Stoichiometry Calculator": {
    inputs: ["Mass of Reactant A (g)", "Molar Mass of A (g/mol)", "Molar Mass of Product B", "Molar Ratio (B/A)"],
    calculate: ([massA, mmA, mmB, ratio]) => {
      if (mmA === 0) return [{ label: "Error", val: "Molar mass A cannot be 0" }];
      const molesA = massA / mmA;
      const molesB = molesA * ratio;
      const massB = molesB * mmB;
      return [
        { label: "Moles of A", val: molesA.toFixed(4) + " mol" },
        { label: "Mass of Product B", val: massB.toFixed(4) + " g" }
      ];
    }
  },
  "Reaction Yield": {
    inputs: ["Actual Yield", "Theoretical Yield"],
    calculate: ([actual, theo]) => {
      if (theo === 0) return [{ label: "Error", val: "Theoretical cannot be 0" }];
      const percent = (actual / theo) * 100;
      return [{ label: "Percentage Yield", val: percent.toFixed(2) + " %" }];
    }
  }
};

export const ChemistryCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = CHEM_MODULES[category];
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
    
    // Check for empty inputs
    if (inputs.some(val => val.trim() === '')) return [];

    const parsedInputs = inputs.map((val, i) => {
      if (engine.isText?.[i]) return val; // Keep as string for Molecular Mass
      return parseFloat(val);
    });

    if (parsedInputs.some((val, i) => !engine.isText?.[i] && isNaN(val as number))) return [];

    return engine.calculate(parsedInputs);
  }, [inputs, engine]);

  if (!engine) return null;

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full overflow-hidden">
      
      <div className="px-4 flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate ml-4">{category}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-4 pb-4">
         {category === "Molecular Mass" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Tip: Use correct cases. e.g. H2O, NaCl, C6H12O6</p>
           </div>
         )}

         {engine.inputs.map((label, i) => (
           <div key={i} className="space-y-1.5">
             <label className="text-[10px] uppercase tracking-wider text-white/50 pl-4 font-medium">{label}</label>
             <input 
               type={engine.isText?.[i] ? "text" : "number"} 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all font-mono text-sm"
               placeholder={engine.isText?.[i] ? `e.g. H2O` : `Enter ${label.split('(')[0]}...`}
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