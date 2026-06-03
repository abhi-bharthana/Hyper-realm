'use client';

import React, { useState, useMemo } from 'react';
import { useOSStore } from '@/store/useOSStore'; 
import { useCanvasStore } from '@/store/useCanvasStore'; 
import { Play } from 'lucide-react';

// 🧠 NATIVE NUMERICAL CALCULUS ENGINE
// Ye function user ki string (jaise 2x^2 + sin(x)) ko ek real JS math function mein convert karta hai
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
      .replace(/(\d)x/g, '$1*x'); // Auto convert 2x -> 2*x

    const mathFunc = new Function('x', `return ${safeStr}`);
    return mathFunc(xVal);
  } catch (err) {
    return NaN;
  }
};

const CALC_MODULES: Record<string, { inputs: string[], isFunc?: boolean[], calculate: (vals: string[]) => { label: string, val: string }[] }> = {
  "Derivative Calculator": {
    inputs: ["Function f(x) (e.g. x^2 + 3*x)", "Evaluate at x = "],
    isFunc: [true, false],
    calculate: ([fStr, xStr]) => {
      const x = parseFloat(xStr);
      if (isNaN(x)) return [];
      
      // Numerical Derivative (Central Difference Method)
      const h = 1e-5;
      const d = (evaluateFx(fStr, x + h) - evaluateFx(fStr, x - h)) / (2 * h);
      
      if (isNaN(d)) return [{ label: "Error", val: "Invalid Function Format" }];
      
      return [
        { label: `f(${x})`, val: evaluateFx(fStr, x).toFixed(4) },
        { label: `f'(${x})`, val: d.toFixed(4) }
      ];
    }
  },
  "Integration Calculator": {
    inputs: ["Function f(x)", "Lower Limit (a)", "Upper Limit (b)"],
    isFunc: [true, false, false],
    calculate: ([fStr, aStr, bStr]) => {
      const a = parseFloat(aStr);
      const b = parseFloat(bStr);
      if (isNaN(a) || isNaN(b)) return [];

      // Definite Integral (Simpson's 1/3 Rule Approximation)
      const n = 1000;
      const h = (b - a) / n;
      let sum = evaluateFx(fStr, a) + evaluateFx(fStr, b);
      
      for(let i = 1; i < n; i++) {
         const val = evaluateFx(fStr, a + i * h);
         if (isNaN(val)) return [{ label: "Error", val: "Function undefined in range" }];
         sum += val * (i % 2 === 0 ? 2 : 4);
      }
      
      const result = (sum * h) / 3;
      return [{ label: `∫ f(x) dx [${a} to ${b}]`, val: result.toFixed(6) }];
    }
  },
  "Limit Calculator": {
    inputs: ["Function f(x)", "Approach value (x → c)"],
    isFunc: [true, false],
    calculate: ([fStr, cStr]) => {
      const c = parseFloat(cStr);
      if (isNaN(c)) return [];

      const h = 1e-7;
      const leftLimit = evaluateFx(fStr, c - h);
      const rightLimit = evaluateFx(fStr, c + h);
      const exact = evaluateFx(fStr, c);

      const isContinuous = Math.abs(leftLimit - rightLimit) < 1e-3;

      return [
        { label: `lim x→${c} (LHL)`, val: leftLimit.toFixed(4) },
        { label: `lim x→${c} (RHL)`, val: rightLimit.toFixed(4) },
        { label: "Result", val: isContinuous ? ((leftLimit + rightLimit) / 2).toFixed(4) : "Diverges / DNE" }
      ];
    }
  },
  "Taylor Series": {
    inputs: ["Function f(x)", "Center (a)"],
    isFunc: [true, false],
    calculate: ([fStr, aStr]) => {
      const a = parseFloat(aStr);
      if (isNaN(a)) return [];

      const h = 1e-4;
      const f_a = evaluateFx(fStr, a);
      const f_prime_a = (evaluateFx(fStr, a + h) - evaluateFx(fStr, a - h)) / (2 * h);
      const f_double_prime_a = (evaluateFx(fStr, a + h) - 2 * f_a + evaluateFx(fStr, a - h)) / (h * h);

      if (isNaN(f_a) || isNaN(f_prime_a)) return [{ label: "Error", val: "Evaluation failed" }];

      return [
        { label: "P₀(x)", val: `${f_a.toFixed(4)}` },
        { label: "P₁(x)", val: `+ ${f_prime_a.toFixed(4)}(x - ${a})` },
        { label: "P₂(x)", val: `+ ${(f_double_prime_a / 2).toFixed(4)}(x - ${a})²` },
        { label: "Note", val: "First 3 terms approximated" }
      ];
    }
  },
  "Function Analyzer": {
    inputs: ["Function f(x)", "Test Point (x)"],
    isFunc: [true, false],
    calculate: ([fStr, xStr]) => {
      const x = parseFloat(xStr);
      if (isNaN(x)) return [];

      const h = 1e-4;
      const val = evaluateFx(fStr, x);
      const firstDeriv = (evaluateFx(fStr, x + h) - evaluateFx(fStr, x - h)) / (2 * h);
      const secondDeriv = (evaluateFx(fStr, x + h) - 2 * val + evaluateFx(fStr, x - h)) / (h * h);

      let behavior = firstDeriv > 0.01 ? "Increasing ↗" : firstDeriv < -0.01 ? "Decreasing ↘" : "Stationary (Min/Max)";
      let concavity = secondDeriv > 0.01 ? "Concave Up ∪" : secondDeriv < -0.01 ? "Concave Down ∩" : "Inflection Point";

      return [
        { label: "f(x)", val: val.toFixed(4) },
        { label: "Behavior", val: behavior },
        { label: "Concavity", val: concavity },
        { label: "Gradient (m)", val: firstDeriv.toFixed(4) }
      ];
    }
  },
  "Graph Plotter": {
    inputs: ["Function f(x)"],
    isFunc: [true],
    calculate: ([fStr]) => {
      if (!fStr) return [];
      return [
        { label: "_PLOT_TRIGGER_", val: fStr }, // 🚀 MAGIC TRIGGER FOR NEURAL CANVAS
        { label: "Status", val: "Engine Ready" },
        { label: "f(0)", val: evaluateFx(fStr, 0).toFixed(4) },
        { label: "f(1)", val: evaluateFx(fStr, 1).toFixed(4) }
      ];
    }
  }
};

export const CalculusCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = CALC_MODULES[category];
  const [inputs, setInputs] = useState<string[]>(Array(engine?.inputs.length || 0).fill(''));

  // OS INTER-APP ACTIONS
  const { openApp } = useOSStore();
  const { triggerPlot } = useCanvasStore();

  React.useEffect(() => {
    setInputs(Array(engine?.inputs.length || 0).fill(''));
  }, [category, engine]);

  const handleInputChange = (index: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[index] = val;
    setInputs(newInputs);
  };

  const handleLaunchCanvas = (equation: string) => {
    triggerPlot(equation); 
    openApp('canvas', 'Neural Canvas'); // Launches your canvas app
  };

  const results = useMemo(() => {
    if (!engine) return [];
    // Calculus needs string processing, not just floats
    if (inputs.some(val => val === '')) return [];
    return engine.calculate(inputs);
  }, [inputs, engine]);

  if (!engine) return null;

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full overflow-hidden">
      
      <div className="px-4 flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest truncate ml-4">{category}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-4 pb-4">
         <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
            <p className="text-[10px] text-lime-400/80">Format: Use *, /, ^, sin(x), exp(x), sqrt(x).</p>
         </div>

         {engine.inputs.map((label, i) => (
           <div key={i} className="space-y-1.5">
             <label className="text-[10px] uppercase tracking-wider text-white/50 pl-4 font-medium">{label}</label>
             <input 
               type={engine.isFunc?.[i] ? "text" : "number"} 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all font-mono text-sm"
               placeholder={engine.isFunc?.[i] ? `e.g. x^2 + sin(x)` : `Enter value...`}
             />
           </div>
         ))}
      </div>

      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Enter expression to compute</div>
          ) : (
            <div className="space-y-2">
              {results.map((res, idx) => {
                // 🚀 RENDER CUSTOM LAUNCH BUTTON FOR GRAPH PLOTTER
                if (res.label === "_PLOT_TRIGGER_") {
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleLaunchCanvas(res.val)}
                      className="w-full py-3 bg-[#8d6bff] hover:bg-[#7a5ce6] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(141,107,255,0.4)] mb-2 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Plot in Neural Canvas
                    </button>
                  );
                }

                // Normal output lines
                return (
                  <div key={idx} className={`flex justify-between items-end pb-1 ${idx !== results.length - 1 ? 'border-b border-lime-500/10' : ''}`}>
                    <span className="text-white/50 text-xs uppercase tracking-widest">{res.label}</span>
                    <span className={`text-lg font-medium ${res.val.includes('Error') ? 'text-red-400' : 'text-lime-400'} font-mono max-w-[65%] text-right break-words`}>
                      {res.val}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};