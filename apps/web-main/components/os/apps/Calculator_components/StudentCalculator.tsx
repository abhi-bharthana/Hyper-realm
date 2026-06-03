'use client';

import React, { useState, useMemo } from 'react';

// 🎓 STUDENT TOOLS MATH ENGINE
const STUDENT_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "CGPA": {
    inputs: ["Total Grade Points (Sum of SGPA × Credits)", "Total Credits"],
    calculate: ([points, credits]) => {
      if (credits <= 0) return [{ label: "Error", val: "Credits must be > 0" }];
      const cgpa = points / credits;
      return [
        { label: "Current CGPA", val: cgpa.toFixed(2) },
        { label: "Percentage %", val: (cgpa * 9.5).toFixed(2) + " %" } // Standard AICTE/CBSE 9.5 multiplier
      ];
    }
  },
  "SGPA": {
    inputs: ["Points Earned in Semester", "Total Credits in Semester"],
    calculate: ([points, credits]) => {
      if (credits <= 0) return [{ label: "Error", val: "Credits must be > 0" }];
      return [{ label: "Semester GPA", val: (points / credits).toFixed(2) }];
    }
  },
  "Attendance %": {
    inputs: ["Classes Attended", "Total Classes Conducted"],
    calculate: ([attended, total]) => {
      if (total <= 0) return [{ label: "Error", val: "Total must be > 0" }];
      if (attended > total) return [{ label: "Error", val: "Attended cannot exceed Total" }];
      const percentage = (attended / total) * 100;
      return [{ label: "Attendance", val: percentage.toFixed(2) + " %" }];
    }
  },
  "Bunk Calculator": {
    inputs: ["Classes Attended", "Total Classes Conducted", "Target Attendance % (e.g., 75)"],
    calculate: ([attended, total, target]) => {
      if (total <= 0 || target <= 0 || target > 100 || attended > total) 
        return [{ label: "Error", val: "Invalid inputs" }];
      
      const current = (attended / total) * 100;
      
      if (current >= target) {
        // Can bunk
        const bunkable = Math.floor(((100 * attended) / target) - total);
        return [
          { label: "Current Status", val: current.toFixed(2) + " % (Safe 🟢)" },
          { label: "Classes You Can Bunk", val: `${bunkable} classes` },
          { label: "Advice", val: "Chill, you have margin!" }
        ];
      } else {
        // Must attend
        const needed = Math.ceil(((target * total) - (100 * attended)) / (100 - target));
        return [
          { label: "Current Status", val: current.toFixed(2) + " % (Danger 🔴)" },
          { label: "Must Attend Next", val: `${needed} classes` },
          { label: "Advice", val: "Don't bunk anymore!" }
        ];
      }
    }
  },
  "Marks Predictor": {
    inputs: ["Current Internal Marks", "Total Internal Marks", "Target Final %", "Final Exam Total Weightage"],
    calculate: ([internalObtained, internalMax, target, finalWeightage]) => {
      if (internalMax <= 0 || finalWeightage <= 0) return [{ label: "Error", val: "Max marks must be > 0" }];
      const currentPercent = (internalObtained / internalMax) * (100 - finalWeightage);
      const neededInFinal = target - currentPercent;
      
      if (neededInFinal <= 0) return [{ label: "Target Status", val: "Already Achieved 🎯" }];
      if (neededInFinal > finalWeightage) return [{ label: "Target Status", val: "Mathematically Impossible 💀" }];
      
      const scoreNeeded = (neededInFinal / finalWeightage) * 100; // As a percentage of the final exam
      return [
        { label: "Current Weightage Earned", val: currentPercent.toFixed(2) + " %" },
        { label: "Need in Finals", val: scoreNeeded.toFixed(2) + " % of Max Marks" }
      ];
    }
  },
  "Grade Predictor": {
    inputs: ["Marks Obtained", "Maximum Marks"],
    calculate: ([obtained, max]) => {
      if (max <= 0) return [{ label: "Error", val: "Max marks must be > 0" }];
      const percentage = (obtained / max) * 100;
      let grade = "";
      
      if (percentage >= 90) grade = "A+ (Outstanding)";
      else if (percentage >= 80) grade = "A (Excellent)";
      else if (percentage >= 70) grade = "B (Good)";
      else if (percentage >= 60) grade = "C (Average)";
      else if (percentage >= 50) grade = "D (Pass)";
      else grade = "F (Fail 💀)";

      return [
        { label: "Percentage", val: percentage.toFixed(2) + " %" },
        { label: "Predicted Grade", val: grade }
      ];
    }
  }
};

export const StudentCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = STUDENT_MODULES[category];
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
    if (parsedInputs.some(isNaN)) return [];

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
         {category === "Bunk Calculator" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Tells you exactly how many to bunk or attend to hit the target!</p>
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
               placeholder={`Enter ${label.split('(')[0].trim()}...`}
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
                  <span className={`text-lg font-medium ${res.val.includes('Error') || res.val.includes('Danger') || res.val.includes('Impossible') || res.val.includes('Fail') ? 'text-red-400' : 'text-lime-400'} font-mono max-w-[65%] text-right break-words`}>
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