'use client';

import React, { useState, useMemo } from 'react';

// 💻 COMPUTER SCIENCE MATH ENGINE
const CS_MODULES: Record<string, { inputs: string[], isText?: boolean[], calculate: (vals: any[]) => { label: string, val: string }[] }> = {
  "Binary Arithmetic": {
    inputs: ["Binary 1", "Binary 2"],
    isText: [true, true],
    calculate: ([b1, b2]) => {
      const isBin = (s: string) => /^[01]+$/.test(s);
      if (!b1 || !b2 || !isBin(b1) || !isBin(b2)) return [{ label: "Error", val: "Enter valid binary (0/1)" }];
      
      const n1 = parseInt(b1, 2);
      const n2 = parseInt(b2, 2);
      
      return [
        { label: "Addition (+)", val: (n1 + n2).toString(2) },
        { label: "Subtraction (-)", val: Math.max(0, n1 - n2).toString(2) },
        { label: "Multiplication (×)", val: (n1 * n2).toString(2) },
        { label: "Division (÷)", val: n2 === 0 ? "Div by 0" : Math.floor(n1 / n2).toString(2) }
      ];
    }
  },
  "Logic Gate Simulator": {
    inputs: ["Input A (0 or 1)", "Input B (0 or 1)"],
    calculate: ([a, b]) => {
      if ((a !== 0 && a !== 1) || (b !== 0 && b !== 1)) return [{ label: "Error", val: "Inputs must be 0 or 1" }];
      return [
        { label: "A AND B", val: (a & b).toString() },
        { label: "A OR B", val: (a | b).toString() },
        { label: "A XOR B", val: (a ^ b).toString() },
        { label: "A NAND B", val: (!(a & b) ? 1 : 0).toString() },
        { label: "A NOR B", val: (!(a | b) ? 1 : 0).toString() }
      ];
    }
  },
  "Truth Table Generator": {
    inputs: ["Variables count (1-3)"],
    calculate: ([vars]) => {
      if (vars < 1 || vars > 3) return [{ label: "Error", val: "Only 1 to 3 variables supported" }];
      const rows = Math.pow(2, vars);
      return [
        { label: "Total Rows", val: rows.toString() },
        { label: "Combinations", val: `0 to ${rows - 1} in binary` },
        { label: "Complexity", val: `O(2^n) = ${rows} ops` }
      ];
    }
  },
  "Big-O Complexity Helper": {
    inputs: ["Data Size (N)", "Operations/sec (e.g., 1000000)"],
    calculate: ([n, ops]) => {
      if (n <= 0 || ops <= 0) return [{ label: "Error", val: "Must be > 0" }];
      
      const formatTime = (secs: number) => {
        if (!isFinite(secs) || secs > 1e12) return "Very Long (> centuries)";
        if (secs < 1e-6) return (secs * 1e9).toFixed(2) + " ns";
        if (secs < 1e-3) return (secs * 1e6).toFixed(2) + " µs";
        if (secs < 1) return (secs * 1000).toFixed(2) + " ms";
        if (secs < 60) return secs.toFixed(2) + " s";
        if (secs < 3600) return (secs / 60).toFixed(2) + " mins";
        return (secs / 3600).toFixed(2) + " hrs";
      };

      return [
        { label: "O(1) Constant", val: formatTime(1 / ops) },
        { label: "O(log N) Logarithmic", val: formatTime(Math.log2(n) / ops) },
        { label: "O(N) Linear", val: formatTime(n / ops) },
        { label: "O(N log N) Linearithmic", val: formatTime((n * Math.log2(n)) / ops) },
        { label: "O(N²) Quadratic", val: formatTime((n * n) / ops) }
      ];
    }
  },
  "CIDR Calculator": {
    inputs: ["IP Address (e.g., 192.168.1.1)", "CIDR Block (e.g., 24)"],
    isText: [true, false],
    calculate: ([ipStr, cidr]) => {
      if (!ipStr || isNaN(cidr) || cidr < 0 || cidr > 32) return [{ label: "Error", val: "Invalid IP or CIDR (0-32)" }];
      
      const ipParts = ipStr.split('.').map(Number);
      if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
        return [{ label: "Error", val: "Invalid IPv4 format" }];
      }

      const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
      const mask = cidr === 0 ? 0 : (~0 << (32 - cidr));
      const network = ipNum & mask;
      const broadcast = network | ~mask;
      const totalHosts = cidr >= 31 ? 0 : Math.pow(2, 32 - cidr) - 2;

      const toIP = (num: number) => `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;

      return [
        { label: "Subnet Mask", val: toIP(mask) },
        { label: "Network Address", val: toIP(network) },
        { label: "Broadcast Address", val: toIP(broadcast) },
        { label: "Usable Hosts", val: totalHosts.toLocaleString() }
      ];
    }
  },
  "Storage Requirement Calculator": {
    inputs: ["Item Size (MB)", "Quantity", "Redundancy (e.g., 2 for RAID 1)"],
    calculate: ([size, qty, redundancy]) => {
      if (size <= 0 || qty < 0 || redundancy < 1) return [{ label: "Error", val: "Invalid parameters" }];
      const totalMB = size * qty * redundancy;
      
      let valStr = "";
      if (totalMB < 1024) valStr = totalMB.toFixed(2) + " MB";
      else if (totalMB < 1048576) valStr = (totalMB / 1024).toFixed(2) + " GB";
      else valStr = (totalMB / 1048576).toFixed(2) + " TB";

      return [
        { label: "Raw Size", val: (size * qty).toFixed(2) + " MB" },
        { label: "Total Required", val: valStr }
      ];
    }
  }
};

export const ComputerScienceCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = CS_MODULES[category] || CS_MODULES["Binary Arithmetic"]; // Fallback if missing
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
      if (engine.isText?.[i]) return val; 
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
         {category === "CIDR Calculator" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Format: IP = 192.168.1.1, CIDR = 24</p>
           </div>
         )}
         
         {category === "Big-O Complexity Helper" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Evaluates algorithmic execution time based on operations per sec.</p>
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
               placeholder={engine.isText?.[i] ? `e.g. ${label.includes('IP') ? '10.0.0.1' : '101010'}` : `Enter ${label.split('(')[0]}...`}
             />
           </div>
         ))}
      </div>

      <div className="p-4 bg-gradient-to-b from-transparent to-black/60 border-t border-white/5">
        <div className="bg-lime-500/10 p-5 rounded-3xl border border-lime-500/20 shadow-[0_0_20px_rgba(132,204,22,0.1)] backdrop-blur-md min-h-[120px] flex flex-col justify-center">
          {results.length === 0 ? (
            <div className="text-center text-white/30 text-sm">Enter parameters to compile</div>
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