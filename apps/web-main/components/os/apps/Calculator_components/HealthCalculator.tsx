'use client';

import React, { useState, useMemo } from 'react';

// 🏋️ HEALTH & FITNESS MATH ENGINE
const HEALTH_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "BMI": {
    inputs: ["Weight (kg)", "Height (cm)"],
    calculate: ([w, h]) => {
      if (h <= 0) return [{ label: "Error", val: "Height must be > 0" }];
      const hMeters = h / 100;
      const bmi = w / (hMeters * hMeters);
      let category = "";
      if (bmi < 18.5) category = "Underweight 🔵";
      else if (bmi < 25) category = "Normal 🟢";
      else if (bmi < 30) category = "Overweight 🟡";
      else category = "Obese 🔴";

      return [
        { label: "BMI Score", val: bmi.toFixed(2) },
        { label: "Category", val: category }
      ];
    }
  },
  "BMR": {
    inputs: ["Weight (kg)", "Height (cm)", "Age (Years)", "Gender (1=Male, 0=Female)"],
    calculate: ([w, h, age, gender]) => {
      if (w <= 0 || h <= 0 || age <= 0) return [{ label: "Error", val: "Invalid inputs" }];
      // Mifflin-St Jeor Equation
      let bmr = (10 * w) + (6.25 * h) - (5 * age);
      bmr = gender === 1 ? bmr + 5 : bmr - 161;
      
      return [
        { label: "Basal Metabolic Rate", val: bmr.toFixed(0) + " kcal/day" },
        { label: "Note", val: "Calories burned at pure rest" }
      ];
    }
  },
  "TDEE": {
    inputs: ["BMR (kcal)", "Activity Level (1.2 to 1.9)"],
    calculate: ([bmr, activity]) => {
      if (activity < 1.2 || activity > 2.0) return [{ label: "Error", val: "Activity typically 1.2 to 1.9" }];
      const tdee = bmr * activity;
      return [
        { label: "Total Daily Energy", val: tdee.toFixed(0) + " kcal/day" },
        { label: "Maintenance", val: "Consume this to maintain weight" }
      ];
    }
  },
  "Calories Burned": {
    inputs: ["Weight (kg)", "MET Value of Activity", "Duration (Minutes)"],
    calculate: ([w, met, mins]) => {
      // Formula: Calories = MET * Weight(kg) * Time(hrs)
      if (mins <= 0) return [{ label: "Error", val: "Duration must be > 0" }];
      const hrs = mins / 60;
      const burned = met * w * hrs;
      return [
        { label: "Calories Burned", val: burned.toFixed(0) + " kcal" },
        { label: "Fat Equivalent", val: (burned / 7700).toFixed(3) + " kg" } // ~7700 kcal = 1kg fat
      ];
    }
  },
  "Body Fat %": {
    inputs: ["Weight (kg)", "Height (cm)", "Age (Years)", "Gender (1=Male, 0=Female)"],
    calculate: ([w, h, age, gender]) => {
      const hMeters = h / 100;
      const bmi = w / (hMeters * hMeters);
      // General BMI-based Body Fat formula (Adults)
      const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * gender) - 5.4;
      
      return [
        { label: "Est. Body Fat", val: bf.toFixed(2) + " %" },
        { label: "Lean Body Mass", val: (w - (w * (bf/100))).toFixed(2) + " kg" }
      ];
    }
  },
  "Protein Requirement": {
    inputs: ["Weight (kg)", "Goal (1=Maintain, 2=Muscle Gain)"],
    calculate: ([w, goal]) => {
      let low = 0, high = 0;
      if (goal === 1) { low = w * 0.8; high = w * 1.2; }
      else { low = w * 1.6; high = w * 2.2; } // Standard bodybuilding range
      
      return [
        { label: "Minimum Daily", val: low.toFixed(0) + " g" },
        { label: "Optimal/High Daily", val: high.toFixed(0) + " g" }
      ];
    }
  },
  "Water Intake": {
    inputs: ["Weight (kg)", "Exercise Duration (Mins)"],
    calculate: ([w, mins]) => {
      // Base: 35ml per kg. Plus ~500ml per 30 mins of exercise
      const baseWater = (w * 35) / 1000; // in Liters
      const extraWater = (mins / 30) * 0.5; // in Liters
      const total = baseWater + extraWater;
      
      return [
        { label: "Base Requirement", val: baseWater.toFixed(2) + " L" },
        { label: "Total w/ Exercise", val: total.toFixed(2) + " L" }
      ];
    }
  }
};

export const HealthCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = HEALTH_MODULES[category];
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
         {category === "TDEE" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">Activity: 1.2 (Sedentary), 1.55 (Moderate), 1.9 (Extra Active)</p>
           </div>
         )}
         
         {category === "Calories Burned" && (
           <div className="bg-lime-500/5 p-3 rounded-2xl border border-lime-500/10 mb-2">
              <p className="text-[10px] text-lime-400/80">MET Examples: Walking=3.5, Weightlifting=6.0, Running=9.8</p>
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