'use client';

import React, { useState, useMemo } from 'react';

// 💰 FINANCE MATH ENGINE
const FINANCE_MODULES: Record<string, { inputs: string[], calculate: (vals: number[]) => { label: string, val: string }[] }> = {
  "EMI": {
    inputs: ["Loan Amount (₹)", "Annual Interest Rate (%)", "Tenure (Months)"],
    calculate: ([p, rate, n]) => {
      if (n <= 0) return [{ label: "Error", val: "Tenure must be > 0" }];
      const r = (rate / 12) / 100;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emi * n;
      const totalInterest = totalAmount - p;
      return [
        { label: "Monthly EMI", val: "₹ " + emi.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "Total Interest", val: "₹ " + totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "Total Payment", val: "₹ " + totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) }
      ];
    }
  },
  "SIP": {
    inputs: ["Monthly Investment (₹)", "Expected Return Rate p.a. (%)", "Time Period (Years)"],
    calculate: ([p, rate, years]) => {
      if (years <= 0) return [{ label: "Error", val: "Years must be > 0" }];
      const r = (rate / 12) / 100;
      const n = years * 12;
      const futureValue = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      const invested = p * n;
      return [
        { label: "Invested Amount", val: "₹ " + invested.toLocaleString() },
        { label: "Est. Returns", val: "₹ " + (futureValue - invested).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        { label: "Total Value", val: "₹ " + futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      ];
    }
  },
  "FD": {
    inputs: ["Total Investment (₹)", "Interest Rate p.a. (%)", "Time Period (Years)"],
    calculate: ([p, rate, years]) => {
      // Assuming Quarterly Compounding (Standard in India)
      const n = 4;
      const r = rate / 100;
      const maturity = p * Math.pow(1 + (r / n), n * years);
      return [
        { label: "Invested Amount", val: "₹ " + p.toLocaleString() },
        { label: "Est. Returns", val: "₹ " + (maturity - p).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        { label: "Maturity Value", val: "₹ " + maturity.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      ];
    }
  },
  "RD": {
    inputs: ["Monthly Investment (₹)", "Interest Rate p.a. (%)", "Time Period (Years)"],
    calculate: ([p, rate, years]) => {
      const months = years * 12;
      const r = rate / 100;
      // RD formula: P * n + P * [n(n+1)/2] * r/12
      const invested = p * months;
      const interest = p * ((months * (months + 1)) / 2) * (r / 12);
      const maturity = invested + interest;
      return [
        { label: "Invested Amount", val: "₹ " + invested.toLocaleString() },
        { label: "Est. Returns", val: "₹ " + interest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        { label: "Maturity Value", val: "₹ " + maturity.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      ];
    }
  },
  "Loan Amortization": {
    inputs: ["Loan Amount (₹)", "Interest Rate p.a. (%)", "Tenure (Years)"],
    calculate: ([p, rate, years]) => {
      if (years <= 0) return [];
      const n = years * 12;
      const r = (rate / 12) / 100;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      
      // First month breakdown
      const interestM1 = p * r;
      const principalM1 = emi - interestM1;

      return [
        { label: "Monthly EMI", val: "₹ " + emi.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "Month 1 Interest", val: "₹ " + interestM1.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "Month 1 Principal", val: "₹ " + principalM1.toLocaleString(undefined, { maximumFractionDigits: 2 }) }
      ];
    }
  },
  "ROI": {
    inputs: ["Amount Invested (₹)", "Amount Returned (₹)"],
    calculate: ([invested, returned]) => {
      if (invested === 0) return [{ label: "Error", val: "Investment cannot be 0" }];
      const profit = returned - invested;
      const roi = (profit / invested) * 100;
      return [
        { label: "Net Profit", val: "₹ " + profit.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "ROI (%)", val: roi.toFixed(2) + " %" }
      ];
    }
  },
  "Break-Even": {
    inputs: ["Fixed Costs (₹)", "Price Per Unit (₹)", "Variable Cost Per Unit (₹)"],
    calculate: ([fc, price, vc]) => {
      if (price <= vc) return [{ label: "Error", val: "Price must be > Variable Cost" }];
      const breakEvenUnits = fc / (price - vc);
      const breakEvenRevenue = breakEvenUnits * price;
      return [
        { label: "Break-Even Units", val: Math.ceil(breakEvenUnits).toLocaleString() },
        { label: "Break-Even Revenue", val: "₹ " + breakEvenRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 }) }
      ];
    }
  },
  "Compound Interest": {
    inputs: ["Principal (₹)", "Interest Rate p.a. (%)", "Time (Years)", "Compounding Freq/Yr (e.g. 1, 4, 12)"],
    calculate: ([p, rate, t, n]) => {
      if (n <= 0) return [{ label: "Error", val: "Frequency must be > 0" }];
      const r = rate / 100;
      const amount = p * Math.pow(1 + (r / n), n * t);
      return [
        { label: "Total Interest", val: "₹ " + (amount - p).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: "Total Amount", val: "₹ " + amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) }
      ];
    }
  },
  "Inflation": {
    inputs: ["Current Expense/Cost (₹)", "Inflation Rate p.a. (%)", "Years in Future"],
    calculate: ([cost, rate, years]) => {
      const r = rate / 100;
      const futureCost = cost * Math.pow(1 + r, years);
      return [
        { label: "Future Cost", val: "₹ " + futureCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        { label: "Value Depreciated By", val: "₹ " + (futureCost - cost).toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      ];
    }
  },
  "Retirement Planning": {
    inputs: ["Current Monthly Expense (₹)", "Years to Retire", "Expected Inflation (%)", "Safe Withdrawal Rate (%)"],
    calculate: ([expense, years, inflation, swr]) => {
      if (swr <= 0) return [{ label: "Error", val: "Withdrawal rate must be > 0" }];
      // 1. Calculate future monthly expense at retirement
      const futureMonthlyExpense = expense * Math.pow(1 + (inflation / 100), years);
      const futureYearlyExpense = futureMonthlyExpense * 12;
      
      // 2. Calculate corpus required using Safe Withdrawal Rate rule (e.g., 4% rule)
      const corpusRequired = futureYearlyExpense / (swr / 100);

      return [
        { label: "Future Monthly Exp.", val: "₹ " + futureMonthlyExpense.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
        { label: "Corpus Required", val: "₹ " + corpusRequired.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
      ];
    }
  }
};

export const FinanceCalculator = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const engine = FINANCE_MODULES[category];
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