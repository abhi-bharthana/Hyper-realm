'use client';

import React, { useState, useMemo } from 'react';

// 📊 STATISTICS MATH ENGINE
const STAT_MODULES: Record<string, { inputs: string[], isDataset?: boolean[], calculate: (vals: any[]) => { label: string, val: string }[] }> = {
  "Mean, Median & Mode": {
    inputs: ["Dataset (comma-separated)"],
    isDataset: [true],
    calculate: ([data]: [number[]]) => {
      if (data.length === 0) return [{ label: "Error", val: "Invalid Dataset" }];
      
      const sum = data.reduce((a, b) => a + b, 0);
      const mean = sum / data.length;
      
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      
      const counts: Record<number, number> = {};
      let maxCount = 0;
      data.forEach(v => { counts[v] = (counts[v] || 0) + 1; if (counts[v] > maxCount) maxCount = counts[v]; });
      const modes = Object.keys(counts).map(Number).filter(k => counts[k] === maxCount);
      const modeStr = modes.length === data.length ? "No Mode" : modes.join(', ');

      return [
        { label: "Count (n)", val: data.length.toString() },
        { label: "Mean (μ)", val: mean.toFixed(4) },
        { label: "Median", val: median.toFixed(4) },
        { label: "Mode", val: modeStr }
      ];
    }
  },
  "Variance & Standard Dev": {
    inputs: ["Dataset (comma-separated)"],
    isDataset: [true],
    calculate: ([data]: [number[]]) => {
      if (data.length < 2) return [{ label: "Error", val: "Need at least 2 values" }];
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const squareDiffs = data.map(v => Math.pow(v - mean, 2));
      const variancePop = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
      const varianceSamp = squareDiffs.reduce((a, b) => a + b, 0) / (data.length - 1);

      return [
        { label: "Pop. Variance (σ²)", val: variancePop.toFixed(4) },
        { label: "Pop. Std Dev (σ)", val: Math.sqrt(variancePop).toFixed(4) },
        { label: "Sample Variance (s²)", val: varianceSamp.toFixed(4) },
        { label: "Sample Std Dev (s)", val: Math.sqrt(varianceSamp).toFixed(4) }
      ];
    }
  },
  "Z-Score Calculator": {
    inputs: ["Raw Score (x)", "Population Mean (μ)", "Standard Dev (σ)"],
    calculate: ([x, mu, sigma]: number[]) => {
      if (sigma === 0) return [{ label: "Error", val: "Std Dev cannot be 0" }];
      const z = (x - mu) / sigma;
      return [{ label: "Z-Score (z)", val: z.toFixed(4) }];
    }
  },
  "Probability Calculator": {
    inputs: ["Successful Outcomes", "Total Outcomes"],
    calculate: ([success, total]: number[]) => {
      if (total <= 0) return [{ label: "Error", val: "Total must be > 0" }];
      if (success > total || success < 0) return [{ label: "Error", val: "Invalid successful outcomes" }];
      const p = success / total;
      return [
        { label: "Probability (P)", val: p.toFixed(4) },
        { label: "Percentage", val: (p * 100).toFixed(2) + "%" }
      ];
    }
  },
  "Binomial Distribution": {
    inputs: ["Trials (n)", "Prob. of Success (p)", "Exact Successes (x)"],
    calculate: ([n, p, x]: number[]) => {
      if (!Number.isInteger(n) || !Number.isInteger(x) || x < 0 || n < 0 || x > n) return [{ label: "Error", val: "Invalid n or x" }];
      if (p < 0 || p > 1) return [{ label: "Error", val: "p must be between 0 and 1" }];
      
      const factorial = (num: number): number => num <= 1 ? 1 : num * factorial(num - 1);
      const combinations = factorial(n) / (factorial(x) * factorial(n - x));
      const probability = combinations * Math.pow(p, x) * Math.pow(1 - p, n - x);
      
      return [{ label: `P(X = ${x})`, val: probability.toExponential(4) }];
    }
  },
  "Normal Distribution": {
    inputs: ["Value (x)", "Mean (μ)", "Standard Dev (σ)"],
    calculate: ([x, mu, sigma]: number[]) => {
      if (sigma <= 0) return [{ label: "Error", val: "Std Dev must be > 0" }];
      // PDF Calculation
      const exponent = Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * exponent;
      return [{ label: "Prob. Density f(x)", val: pdf.toExponential(4) }];
    }
  },
  "Correlation Calculator": {
    inputs: ["Dataset X (comma-separated)", "Dataset Y (comma-separated)"],
    isDataset: [true, true],
    calculate: ([dataX, dataY]: [number[], number[]]) => {
      if (dataX.length !== dataY.length) return [{ label: "Error", val: "Datasets must be equal length" }];
      if (dataX.length < 2) return [{ label: "Error", val: "Need ≥2 pairs" }];

      const n = dataX.length;
      const sumX = dataX.reduce((a, b) => a + b, 0);
      const sumY = dataY.reduce((a, b) => a + b, 0);
      const sumXY = dataX.reduce((sum, x, i) => sum + (x * dataY[i]), 0);
      const sumX2 = dataX.reduce((sum, x) => sum + (x * x), 0);
      const sumY2 = dataY.reduce((sum, y) => sum + (y * y), 0);

      const numerator = (n * sumXY) - (sumX * sumY);
      const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
      
      if (denominator === 0) return [{ label: "Correlation (r)", val: "Undefined" }];
      
      const r = numerator / denominator;
      return [{ label: "Pearson (r)", val: r.toFixed(4) }];
    }
  }
};

export const StatisticsCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = STAT_MODULES[category];
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
    
    try {
      const parsedInputs = inputs.map((val, i) => {
        if (engine.isDataset && engine.isDataset[i]) {
          // Parse CSV array
          const arr = val.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
          if (val.trim() !== '' && arr.length === 0) throw new Error("Invalid Data");
          return arr;
        }
        return val === '' ? NaN : parseFloat(val);
      });

      // Validations: Check if strings are empty or NaNs are present (except empty arrays which we handle inside engine)
      if (parsedInputs.some((v, i) => (!engine.isDataset?.[i] && Number.isNaN(v)) || (engine.isDataset?.[i] && (v as number[]).length === 0 && inputs[i] !== ''))) {
        return [];
      }
      
      // If datasets are required but empty
      if (engine.isDataset && inputs.some(v => v === '')) return [];

      return engine.calculate(parsedInputs);
    } catch (e) {
      return [{ label: "Format Error", val: "Check input values" }];
    }
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
               type={engine.isDataset?.[i] ? "text" : "number"} 
               value={inputs[i]}
               onChange={(e) => handleInputChange(i, e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-lime-500/50 backdrop-blur-md transition-all font-mono text-sm"
               placeholder={engine.isDataset?.[i] ? `e.g. 10, 25, 30.5...` : `Enter ${label}...`}
             />
           </div>
         ))}
      </div>

      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Fill fields to compute stats</div>
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