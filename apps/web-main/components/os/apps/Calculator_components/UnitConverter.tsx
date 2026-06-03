'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDown, Delete } from 'lucide-react';

// 🚀 FULL 21-CATEGORY UNIT ENGINE
const unitData: Record<string, { units: string[], factors: Record<string, number> }> = {
  "Length": { 
    units: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Miles", "Yards", "Feet", "Inches"], 
    factors: { "Meters": 1, "Kilometers": 1000, "Centimeters": 0.01, "Millimeters": 0.001, "Miles": 1609.34, "Yards": 0.9144, "Feet": 0.3048, "Inches": 0.0254 } 
  },
  "Area": { 
    units: ["Square Meters", "Square Kilometers", "Hectares", "Acres", "Square Miles", "Square Feet", "Square Inches"], 
    factors: { "Square Meters": 1, "Square Kilometers": 1000000, "Hectares": 10000, "Acres": 4046.86, "Square Miles": 2589988.11, "Square Feet": 0.092903, "Square Inches": 0.00064516 } 
  },
  "Volume": { 
    units: ["Cubic Meters", "Liters", "Milliliters", "Gallons (US)", "Quarts (US)", "Pints (US)", "Fluid Ounces (US)"], 
    factors: { "Cubic Meters": 1, "Liters": 0.001, "Milliliters": 0.000001, "Gallons (US)": 0.00378541, "Quarts (US)": 0.000946353, "Pints (US)": 0.000473176, "Fluid Ounces (US)": 0.0000295735 } 
  },
  "Weight/Mass": { 
    units: ["Kilograms", "Grams", "Milligrams", "Metric Tons", "Pounds", "Ounces"], 
    factors: { "Kilograms": 1, "Grams": 0.001, "Milligrams": 0.000001, "Metric Tons": 1000, "Pounds": 0.453592, "Ounces": 0.0283495 } 
  },
  "Temperature": { 
    units: ["Celsius", "Fahrenheit", "Kelvin"], 
    factors: {} // ⚠️ Formula handled separately in logic below
  },
  "Speed": { 
    units: ["Meters per second", "Kilometers per hour", "Miles per hour", "Feet per second", "Knots"], 
    factors: { "Meters per second": 1, "Kilometers per hour": 0.277778, "Miles per hour": 0.44704, "Feet per second": 0.3048, "Knots": 0.514444 } 
  },
  "Time": { 
    units: ["Seconds", "Minutes", "Hours", "Days", "Weeks", "Years"], 
    factors: { "Seconds": 1, "Minutes": 60, "Hours": 3600, "Days": 86400, "Weeks": 604800, "Years": 31536000 } 
  },
  "Pressure": { 
    units: ["Pascals", "Kilopascals", "Bar", "PSI", "Atmospheres"], 
    factors: { "Pascals": 1, "Kilopascals": 1000, "Bar": 100000, "PSI": 6894.76, "Atmospheres": 101325 } 
  },
  "Density": { 
    units: ["kg/m³", "g/cm³", "lb/ft³", "lb/in³"], 
    factors: { "kg/m³": 1, "g/cm³": 1000, "lb/ft³": 16.0185, "lb/in³": 27679.9 } 
  },
  "Force": { 
    units: ["Newtons", "Kilonewtons", "Pound-force"], 
    factors: { "Newtons": 1, "Kilonewtons": 1000, "Pound-force": 4.44822 } 
  },
  "Power": { 
    units: ["Watts", "Kilowatts", "Megawatts", "Horsepower"], 
    factors: { "Watts": 1, "Kilowatts": 1000, "Megawatts": 1000000, "Horsepower": 745.7 } 
  },
  "Energy": { 
    units: ["Joules", "Kilojoules", "Calories", "Kilocalories", "Watt-hours", "Kilowatt-hours"], 
    factors: { "Joules": 1, "Kilojoules": 1000, "Calories": 4.184, "Kilocalories": 4184, "Watt-hours": 3600, "Kilowatt-hours": 3600000 } 
  },
  "Torque": { 
    units: ["Newton-meters", "Pound-feet", "Pound-inches"], 
    factors: { "Newton-meters": 1, "Pound-feet": 1.35582, "Pound-inches": 0.112985 } 
  },
  "Frequency": { 
    units: ["Hertz", "Kilohertz", "Megahertz", "Gigahertz"], 
    factors: { "Hertz": 1, "Kilohertz": 1000, "Megahertz": 1000000, "Gigahertz": 1000000000 } 
  },
  "Angle": { 
    units: ["Degrees", "Radians", "Gradians"], 
    factors: { "Degrees": 1, "Radians": 57.2958, "Gradians": 0.9 } 
  },
  "Fuel economy": { 
    units: ["Kilometers/liter", "Miles/gallon (US)", "Miles/gallon (UK)"], 
    factors: { "Kilometers/liter": 1, "Miles/gallon (US)": 0.425144, "Miles/gallon (UK)": 0.354006 } 
  },
  "Electric current": { 
    units: ["Amperes", "Milliamperes", "Microamperes"], 
    factors: { "Amperes": 1, "Milliamperes": 0.001, "Microamperes": 0.000001 } 
  },
  "Voltage": { 
    units: ["Volts", "Millivolts", "Kilovolts"], 
    factors: { "Volts": 1, "Millivolts": 0.001, "Kilovolts": 1000 } 
  },
  "Resistance": { 
    units: ["Ohms", "Milliohms", "Kiloohms", "Megaohms"], 
    factors: { "Ohms": 1, "Milliohms": 0.001, "Kiloohms": 1000, "Megaohms": 1000000 } 
  },
  "Data transfer rate": { 
    units: ["Bits/s", "Kilobits/s", "Megabits/s", "Gigabits/s", "Bytes/s", "Kilobytes/s", "Megabytes/s"], 
    factors: { "Bits/s": 1, "Kilobits/s": 1000, "Megabits/s": 1000000, "Gigabits/s": 1000000000, "Bytes/s": 8, "Kilobytes/s": 8000, "Megabytes/s": 8000000 } 
  },
  "Digital storage": { 
    units: ["Bits", "Bytes", "Kilobytes", "Megabytes", "Gigabytes", "Terabytes"], 
    factors: { "Bits": 1, "Bytes": 8, "Kilobytes": 8192, "Megabytes": 8388608, "Gigabytes": 8589934592, "Terabytes": 8796093022208 } 
  }
};

export const UnitConverter = ({ category, onBack }: { category: string, onBack: () => void }) => {
  const data = unitData[category] || { units: ["Not Mapped"], factors: { "Not Mapped": 1 } };
  
  const [fromUnit, setFromUnit] = useState(data.units[0]);
  const [toUnit, setToUnit] = useState(data.units[1] || data.units[0]);
  const [value, setValue] = useState('0');

  // Matrix Reset: Har category change hone par clean state setup
  useEffect(() => {
    if (data.units.length > 0) {
      setFromUnit(data.units[0]);
      setToUnit(data.units[1] || data.units[0]);
      setValue('0');
    }
  }, [category, data.units]);

  const result = useMemo(() => {
    const val = parseFloat(value);
    if (isNaN(val)) return '0';

    // 🧪 Native Temperature Engine
    if (category === "Temperature") {
      let c = 0;
      if (fromUnit === 'Celsius') c = val;
      else if (fromUnit === 'Fahrenheit') c = (val - 32) * 5 / 9;
      else if (fromUnit === 'Kelvin') c = val - 273.15;

      let res = 0;
      if (toUnit === 'Celsius') res = c;
      else if (toUnit === 'Fahrenheit') res = (c * 9 / 5) + 32;
      else if (toUnit === 'Kelvin') res = c + 273.15;
      
      return res.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }

    // ⚙️ Core Multiplication Matrix Engine
    const fromFactor = data.factors[fromUnit];
    const toFactor = data.factors[toUnit];
    
    if (!fromFactor || !toFactor) return '0';

    const baseValue = val * fromFactor;
    const finalValue = baseValue / toFactor;
    
    // Auto-formatting values depending on scale
    if (finalValue < 0.0001 && finalValue > 0) {
      return finalValue.toExponential(4);
    }
    return finalValue.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [value, fromUnit, toUnit, data, category]);

  // Numpad Functions
  const handleNum = (num: string) => setValue((prev) => (prev === '0' ? num : prev + num));
  const deleteLast = () => setValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  const clearAll = () => setValue('0');

  const PillButton = ({ label, onClick, colorClass = "bg-white/5 hover:bg-white/10 border border-white/10 text-white/90" }: { label: React.ReactNode, onClick: () => void, colorClass?: string }) => (
    <button onClick={onClick} className={`rounded-full flex items-center justify-center text-xl font-medium transition-all duration-200 active:scale-90 shadow-sm ${colorClass} h-12 backdrop-blur-md`}>
      {label}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col pt-2 animate-in fade-in zoom-in duration-300 h-full">
      
      {/* HEADER */}
      <div className="px-4 flex justify-between items-center mb-2">
        <button onClick={onBack} className="text-xs text-lime-400 hover:text-lime-300 transition-colors w-max font-medium">← Categories</button>
        <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{category}</h2>
      </div>
      
      {/* CONVERSION DISPLAY */}
      <div className="flex-1 px-4 flex flex-col justify-end space-y-3 pb-4 border-b border-white/10">
         <div className="text-right">
            <div className="text-4xl font-light text-white/90 mb-1 truncate">{value}</div>
            <select className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-lime-400 focus:outline-none max-w-[200px]" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {data.units.map(u => <option key={u} value={u} className="bg-black">{u}</option>)}
            </select>
         </div>

         <div className="flex justify-end pr-8 relative">
            <ArrowDown className="w-5 h-5 text-white/20" />
         </div>

         <div className="text-right">
            <div className="text-4xl font-semibold text-lime-400 mb-1 truncate">{result}</div>
            <select className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 focus:outline-none max-w-[200px]" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {data.units.map(u => <option key={u} value={u} className="bg-black">{u}</option>)}
            </select>
         </div>
      </div>

      {/* 3-COLUMN CUSTOM NUMPAD */}
      <div className="p-4 bg-gradient-to-b from-transparent to-black/40">
        <div className="grid grid-cols-3 gap-2">
          <PillButton label="AC" onClick={clearAll} colorClass="bg-red-500/10 border border-red-500/30 text-red-400" />
          <PillButton label={<Delete className="w-5 h-5"/>} onClick={deleteLast} />
          <PillButton label="." onClick={() => value.includes('.') ? null : handleNum('.')} />

          <PillButton label="7" onClick={() => handleNum('7')} />
          <PillButton label="8" onClick={() => handleNum('8')} />
          <PillButton label="9" onClick={() => handleNum('9')} />

          <PillButton label="4" onClick={() => handleNum('4')} />
          <PillButton label="5" onClick={() => handleNum('5')} />
          <PillButton label="6" onClick={() => handleNum('6')} />

          <PillButton label="1" onClick={() => handleNum('1')} />
          <PillButton label="2" onClick={() => handleNum('2')} />
          <PillButton label="3" onClick={() => handleNum('3')} />

          <button onClick={() => handleNum('0')} className="col-span-2 rounded-full flex items-center justify-center text-xl font-medium transition-all duration-200 active:scale-95 shadow-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 h-12 backdrop-blur-md">
            0
          </button>
          <PillButton label="00" onClick={() => handleNum('00')} />
        </div>
      </div>
      
    </div>
  );
};