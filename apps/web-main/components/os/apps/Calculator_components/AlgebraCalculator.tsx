'use client';

import React, { useState, useMemo } from 'react';

// 🧮 ALGEBRA MATH ENGINE CONFIGURATION
const ALG_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "Linear Equation Solver": {
    inputs: ["Coefficient (a)", "Constant (b)", "Result (c)"], // ax + b = c
    calculate: ([a, b, c]) => {
      if (a === 0) return [{ label: "Error", val: "'a' cannot be zero" }];
      return [{ label: "x", val: ((c - b) / a).toFixed(4) }];
    }
  },
  "System of Equations": {
    inputs: ["x₁ coeff (a₁)", "y₁ coeff (b₁)", "Result 1 (c₁)", "x₂ coeff (a₂)", "y₂ coeff (b₂)", "Result 2 (c₂)"], // a1x + b1y = c1
    calculate: ([a1, b1, c1, a2, b2, c2]) => {
      const determinant = (a1 * b2) - (a2 * b1);
      if (determinant === 0) return [{ label: "Result", val: "No Unique Solution (Parallel/Dependent)" }];
      const x = ((c1 * b2) - (c2 * b1)) / determinant;
      const y = ((a1 * c2) - (a2 * c1)) / determinant;
      return [
        { label: "x", val: x.toFixed(4) },
        { label: "y", val: y.toFixed(4) }
      ];
    }
  },
  "Quadratic Solver": {
    inputs: ["a (for x²)", "b (for x)", "c (constant)"], // ax^2 + bx + c = 0
    calculate: ([a, b, c]) => {
      if (a === 0) return [{ label: "Error", val: "Not a quadratic equation (a=0)" }];
      const d = (b * b) - (4 * a * c); // Discriminant
      if (d > 0) {
        const x1 = (-b + Math.sqrt(d)) / (2 * a);
        const x2 = (-b - Math.sqrt(d)) / (2 * a);
        return [{ label: "Root 1 (x₁)", val: x1.toFixed(4) }, { label: "Root 2 (x₂)", val: x2.toFixed(4) }, { label: "Type", val: "Real & Distinct" }];
      } else if (d === 0) {
        const x = -b / (2 * a);
        return [{ label: "Root (x)", val: x.toFixed(4) }, { label: "Type", val: "Real & Equal" }];
      } else {
        const real = (-b / (2 * a)).toFixed(4);
        const img = (Math.sqrt(-d) / (2 * a)).toFixed(4);
        return [
          { label: "Root 1", val: `${real} + ${img}i` },
          { label: "Root 2", val: `${real} - ${img}i` },
          { label: "Type", val: "Complex Conjugates" }
        ];
      }
    }
  },
  "Polynomial Evaluator": {
    inputs: ["a (x³)", "b (x²)", "c (x)", "d (const)", "Value of x"], // ax^3 + bx^2 + cx + d
    calculate: ([a, b, c, d, x]) => {
      const result = (a * Math.pow(x, 3)) + (b * Math.pow(x, 2)) + (c * x) + d;
      return [{ label: "f(x)", val: result.toLocaleString(undefined, { maximumFractionDigits: 6 }) }];
    }
  },
  "Factorization Tool": {
    inputs: ["Integer Number (n)"],
    calculate: ([n]) => {
      if (!Number.isInteger(n) || n < 1 || n > 100000000) return [{ label: "Error", val: "Enter integer (1 to 100M)" }];
      const factors = [];
      for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
          factors.push(i);
          if (i !== n / i) factors.push(n / i);
        }
      }
      factors.sort((a, b) => a - b);
      // Format factors cleanly
      const factorsStr = factors.length > 15 ? factors.slice(0, 15).join(', ') + ' ...' : factors.join(', ');
      return [
        { label: "Total Factors", val: factors.length.toString() },
        { label: "Factors", val: factorsStr }
      ];
    }
  },
  "Roots Calculator": {
    inputs: ["Value (x)", "Degree of Root (n)"], // nth root of x
    calculate: ([x, n]) => {
      if (n === 0) return [{ label: "Error", val: "Degree cannot be 0" }];
      if (x < 0 && n % 2 === 0) return [{ label: "Error", val: "Complex Root" }];
      const result = x < 0 ? -Math.pow(Math.abs(x), 1 / n) : Math.pow(x, 1 / n);
      return [{ label: `R(${n})`, val: result.toLocaleString(undefined, { maximumFractionDigits: 6 }) }];
    }
  },
  "Logarithm Calculator": {
    inputs: ["Base (b)", "Value (x)"], // log_b(x)
    calculate: ([b, x]) => {
      if (b <= 0 || b === 1) return [{ label: "Error", val: "Invalid Base (b>0, b≠1)" }];
      if (x <= 0) return [{ label: "Error", val: "Value must be > 0" }];
      const result = Math.log(x) / Math.log(b);
      return [{ label: `log_${b}(${x})`, val: result.toLocaleString(undefined, { maximumFractionDigits: 6 }) }];
    }
  },
  "Exponential Calculator": {
    inputs: ["Base (a)", "Exponent (x)"], // a^x
    calculate: ([a, x]) => {
      const result = Math.pow(a, x);
      // Formatting handles massive numbers cleanly using Exponential notation
      return [{ label: "Result", val: result > 1e10 ? result.toExponential(4) : result.toLocaleString(undefined, { maximumFractionDigits: 6 }) }];
    }
  }
};

export const AlgebraCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = ALG_MODULES[category];
  
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
    
    // Convert strings to numbers, keeping NaN for empty/invalid inputs
    const numVals = inputs.map(v => v === '' ? NaN : parseFloat(v));
    
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
             <label className="text-[10px] uppercase tracking-wider text-white/50 pl-4 font-medium">{label}</label>
             <input 
               type="number" 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all font-mono"
               placeholder={`Enter ${label}...`}
             />
           </div>
         ))}
      </div>

      {/* RESULTS PANEL */}
      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Fill all fields to compute matrix</div>
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