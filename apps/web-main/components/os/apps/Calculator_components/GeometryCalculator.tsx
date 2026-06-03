'use client';

import React, { useState, useMemo } from 'react';

// 📐 GEOMETRY MATH ENGINE CONFIGURATION
const GEO_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "Right Triangle Solver": {
    inputs: ["Base (a)", "Height (b)"],
    calculate: ([a, b]) => {
      if (!a || !b) return [];
      const hyp = Math.sqrt(a*a + b*b);
      return [
        { label: "Hypotenuse (c)", val: hyp.toFixed(4) },
        { label: "Area", val: (0.5 * a * b).toFixed(4) },
        { label: "Perimeter", val: (a + b + hyp).toFixed(4) }
      ];
    }
  },
  "Circle Calculator": {
    inputs: ["Radius (r)"],
    calculate: ([r]) => {
      if (!r) return [];
      return [
        { label: "Area", val: (Math.PI * r * r).toFixed(4) },
        { label: "Circumference", val: (2 * Math.PI * r).toFixed(4) },
        { label: "Diameter", val: (2 * r).toFixed(4) }
      ];
    }
  },
  "Sector Calculator": {
    inputs: ["Radius (r)", "Angle (θ degrees)"],
    calculate: ([r, theta]) => {
      if (!r || !theta) return [];
      return [{ label: "Sector Area", val: (Math.PI * r * r * (theta / 360)).toFixed(4) }];
    }
  },
  "Arc Length Calculator": {
    inputs: ["Radius (r)", "Angle (θ degrees)"],
    calculate: ([r, theta]) => {
      if (!r || !theta) return [];
      return [{ label: "Arc Length", val: (2 * Math.PI * r * (theta / 360)).toFixed(4) }];
    }
  },
  "Polygon Calculator": {
    inputs: ["Number of Sides (n)", "Side Length (s)"],
    calculate: ([n, s]) => {
      if (!n || !s || n < 3) return [{ label: "Error", val: "n must be ≥ 3" }];
      const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
      return [
        { label: "Area", val: area.toFixed(4) },
        { label: "Perimeter", val: (n * s).toFixed(4) },
        { label: "Interior Angle", val: (((n - 2) * 180) / n).toFixed(2) + "°" }
      ];
    }
  },
  "Distance Calculator": {
    inputs: ["X₁", "Y₁", "X₂", "Y₂"],
    calculate: ([x1, y1, x2, y2]) => {
      if (x1===undefined || y1===undefined || x2===undefined || y2===undefined) return [];
      const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      return [{ label: "Distance (d)", val: dist.toFixed(4) }];
    }
  },
  "Midpoint Calculator": {
    inputs: ["X₁", "Y₁", "X₂", "Y₂"],
    calculate: ([x1, y1, x2, y2]) => {
      if (x1===undefined || y1===undefined || x2===undefined || y2===undefined) return [];
      return [
        { label: "Midpoint X", val: ((x1 + x2) / 2).toFixed(4) },
        { label: "Midpoint Y", val: ((y1 + y2) / 2).toFixed(4) }
      ];
    }
  },
  "Slope Calculator": {
    inputs: ["X₁", "Y₁", "X₂", "Y₂"],
    calculate: ([x1, y1, x2, y2]) => {
      if (x1===undefined || y1===undefined || x2===undefined || y2===undefined) return [];
      if (x2 - x1 === 0) return [{ label: "Slope (m)", val: "Undefined (Vertical)" }];
      const m = (y2 - y1) / (x2 - x1);
      return [{ label: "Slope (m)", val: m.toFixed(4) }];
    }
  }
};

export const GeometryCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = GEO_MODULES[category];
  
  // Dynamic input state array based on required inputs
  const [inputs, setInputs] = useState<string[]>(Array(engine?.inputs.length || 0).fill(''));

  // Reset inputs when category changes
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
    const numVals = inputs.map(v => parseFloat(v));
    // Check if all required fields are filled with valid numbers
    if (numVals.some(isNaN)) return [];
    return engine.calculate(numVals);
  }, [inputs, engine]);

  if (!engine) return null;

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="px-4 flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate ml-4">{category}</h2>
      </div>
      
      {/* DYNAMIC INPUT FIELDS */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-4 pb-4">
         {engine.inputs.map((label, i) => (
           <div key={i} className="space-y-1.5">
             <label className="text-[10px] uppercase tracking-wider text-white/50 pl-4">{label}</label>
             <input 
               type="number" 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all"
               placeholder={`Enter ${label}...`}
             />
           </div>
         ))}
      </div>

      {/* RESULTS PANEL */}
      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Fill all fields to compute</div>
          ) : (
            <div className="space-y-2">
              {results.map((res, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-lime-500/10 pb-1 last:border-0 last:pb-0">
                  <span className="text-white/50 text-xs">{res.label}</span>
                  <span className="text-xl font-medium text-lime-400">{res.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};