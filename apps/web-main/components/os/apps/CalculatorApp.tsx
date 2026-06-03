'use client';

import React, { useState, useEffect } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { 
  History, Calculator, Orbit, RefreshCw, Delete, Scale, 
  TriangleRight, Binary, BarChart2, Sigma, Atom, FlaskConical, 
  Zap, Terminal, Wrench, Wallet, Dumbbell, GraduationCap 
} from 'lucide-react'; 

import { UnitConverter } from '@/components/os/apps/Calculator_components/UnitConverter';
import { GeometryCalculator } from '@/components/os/apps/Calculator_components/GeometryCalculator';
import { AlgebraCalculator } from '@/components/os/apps/Calculator_components/AlgebraCalculator';
import { StatisticsCalculator } from '@/components/os/apps/Calculator_components/StatisticsCalculator';
import { CalculusCalculator } from '@/components/os/apps/Calculator_components/CalculusCalculator';
import { PhysicsCalculator } from '@/components/os/apps/Calculator_components/PhysicsCalculator';
import { ChemistryCalculator } from '@/components/os/apps/Calculator_components/ChemistryCalculator';
import { ElectricalCalculator } from '@/components/os/apps/Calculator_components/ElectricalCalculator';
import { ComputerScienceCalculator } from '@/components/os/apps/Calculator_components/ComputerScienceCalculator';
import { CivilMechanicalCalculator } from '@/components/os/apps/Calculator_components/CivilMechanicalCalculator';
import { FinanceCalculator } from '@/components/os/apps/Calculator_components/FinanceCalculator';
import { HealthCalculator } from '@/components/os/apps/Calculator_components/HealthCalculator';
import { StudentCalculator } from '@/components/os/apps/Calculator_components/StudentCalculator';

type Mode = 'standard' | 'scientific' | 'currency' | 'unit' | 'geometry' | 'algebra' | 'statistics' | 'calculus' | 'physics' | 'chemistry' | 'electrical' | 'computerscience' | 'civilmech' | 'finance' | 'health' | 'student' | 'history';

// 📚 CATEGORY DICTIONARIES
const UNIT_CATEGORIES = ["Length", "Area", "Volume", "Weight/Mass", "Temperature", "Speed", "Time", "Pressure", "Density", "Force", "Power", "Energy", "Torque", "Frequency", "Angle", "Fuel economy", "Electric current", "Voltage", "Resistance", "Data transfer rate", "Digital storage"];
const GEOMETRY_CATEGORIES = ["Right Triangle Solver", "Circle Calculator", "Sector Calculator", "Arc Length Calculator", "Polygon Calculator", "Distance Calculator", "Midpoint Calculator", "Slope Calculator"];
const ALGEBRA_CATEGORIES = ["Linear Equation Solver", "System of Equations", "Quadratic Solver", "Polynomial Evaluator", "Factorization Tool", "Roots Calculator", "Logarithm Calculator", "Exponential Calculator"];
const STATISTICS_CATEGORIES = ["Mean, Median & Mode", "Variance & Standard Dev", "Z-Score Calculator", "Probability Calculator", "Binomial Distribution", "Normal Distribution", "Correlation Calculator"];
const CALCULUS_CATEGORIES = ["Derivative Calculator", "Integration Calculator", "Limit Calculator", "Taylor Series", "Function Analyzer", "Graph Plotter"];
const PHYSICS_CATEGORIES = ["Kinetic Energy", "Potential Energy", "Momentum", "Work Done", "Projectile Motion", "Free Fall", "Circular Motion", "Gravitation", "Wave Equations", "Lens Formula", "Mirror Formula", "Relativity Calculator"];
const CHEMISTRY_CATEGORIES = ["Molarity", "Molality", "Normality", "pH Calculator", "Ideal Gas Law", "Dilution Calculator", "Molecular Mass", "Stoichiometry Calculator", "Reaction Yield"];
const ELECTRICAL_CATEGORIES = ["Ohm's Law", "Power Triangle", "Resistor Network", "Capacitor Network", "Inductor Calculator", "RC Circuit", "RL Circuit", "RLC Circuit", "Transformer Calculator", "Three Phase Power"];
const CS_CATEGORIES = ["Binary Arithmetic", "Logic Gate Simulator", "Truth Table Generator", "Big-O Complexity Helper", "CIDR Calculator", "Storage Requirement Calculator"];
const CIVIL_MECH_CATEGORIES = ["Beam Load Calculator", "Stress Calculator", "Strain Calculator", "Young's Modulus", "Gear Ratio", "Torque Calculator", "Material Weight Calculator", "Concrete Mix Calculator"];
const FINANCE_CATEGORIES = ["EMI", "SIP", "FD", "RD", "Loan Amortization", "ROI", "Break-Even", "Compound Interest", "Inflation", "Retirement Planning"];
const HEALTH_CATEGORIES = ["BMI", "BMR", "TDEE", "Calories Burned", "Body Fat %", "Protein Requirement", "Water Intake"];
const STUDENT_CATEGORIES = ["CGPA", "SGPA", "Attendance %", "Bunk Calculator", "Marks Predictor", "Grade Predictor"];

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [mode, setMode] = useState<Mode>('standard');
  
  // 🧭 STATES FOR SUB-MODULES
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<string | null>(null);
  const [selectedAlg, setSelectedAlg] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null);
  const [selectedPhys, setSelectedPhys] = useState<string | null>(null);
  const [selectedChem, setSelectedChem] = useState<string | null>(null);
  const [selectedElec, setSelectedElec] = useState<string | null>(null);
  const [selectedCS, setSelectedCS] = useState<string | null>(null);
  const [selectedCivilMech, setSelectedCivilMech] = useState<string | null>(null);
  const [selectedFinance, setSelectedFinance] = useState<string | null>(null);
  const [selectedHealth, setSelectedHealth] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { history, fetchHistory, saveCalculation, clearHistory, isLoading } = useCalculatorStore();

  useEffect(() => {
    if (mode === 'history') fetchHistory();
  }, [mode]);

  const handleNum = (num: string) => setDisplay((prev) => (prev === '0' ? num : prev + num));
  const handleOp = (op: string) => { setExpression(display + ' ' + op + ' '); setDisplay('0'); };
  const clearDisplay = () => { setDisplay('0'); setExpression(''); };
  const deleteLast = () => setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));

  const handleEqual = () => {
    try {
      const fullExpression = expression + display;
      const rawResult = eval(fullExpression.replace('×', '*').replace('÷', '/'));
      const finalResult = String(Math.round(rawResult * 100000000) / 100000000); 

      setDisplay(finalResult);
      setExpression('');
      saveCalculation('standard', fullExpression, finalResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  // 💎 ULTRA-SMOOTH PILL BUTTON COMPONENT
  const PillButton = ({ label, onClick, colorClass = "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/90" }: { label: string | React.ReactNode, onClick: () => void, colorClass?: string }) => (
    <button 
      onClick={onClick}
      className={`rounded-full flex items-center justify-center text-xl font-medium transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.85] shadow-sm hover:shadow-md ${colorClass} h-14 backdrop-blur-md`}
    >
      {label}
    </button>
  );

  // 🚀 REUSABLE BUTTERY NAVIGATION TAB COMPONENT
  const NavTab = ({ id, icon: Icon, label, colorClass = "text-white" }: { id: Mode, icon: any, label: string, colorClass?: string }) => {
    const isActive = mode === id;
    return (
      <button 
        onClick={() => setMode(id)} 
        className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center gap-1.5 
        ${isActive 
          ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105 border border-white/10' 
          : 'text-white/50 hover:text-white hover:bg-white/10 border border-transparent hover:scale-105 active:scale-95'}`}
      >
        <Icon className={`w-3.5 h-3.5 ${isActive ? colorClass : ''}`} /> {label}
      </button>
    );
  };

  // 🚀 REUSABLE FLOATING CATEGORY CARD COMPONENT
  const CategoryCard = ({ label, icon: Icon, onClick }: { label: string, icon: any, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-[1.25rem] py-4 px-5 text-sm font-medium text-white/80 hover:text-white text-left transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] active:scale-95 flex justify-between items-center backdrop-blur-sm"
    >
      <span className="truncate pr-4">{label}</span>
      <Icon className="w-4 h-4 text-white/20 group-hover:text-white/70 transition-colors duration-300 shrink-0" />
    </button>
  );

  return (
    // 🌌 MAIN SYSTEM APP BACKGROUND WITH SOFT GRADIENT MESH
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-3xl text-white overflow-hidden font-sans border border-white/10 rounded-b-2xl shadow-2xl relative">
      
      {/* 🟢 TOP NAVIGATION PILLS - Smooth scrolling */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-white/5 bg-black/20 backdrop-blur-xl z-10">
        <div className="flex gap-1.5 p-1 rounded-full overflow-x-auto scroll-smooth custom-scrollbar no-scrollbar w-full mr-2">
          <NavTab id="standard" icon={Calculator} label="Std" />
          <NavTab id="scientific" icon={Orbit} label="Sci" />
          <NavTab id="unit" icon={Scale} label="Unit" />
          <NavTab id="geometry" icon={TriangleRight} label="Geo" />
          <NavTab id="algebra" icon={Binary} label="Alg" />
          <NavTab id="statistics" icon={BarChart2} label="Stat" />
          <NavTab id="calculus" icon={Sigma} label="Calc" />
          <NavTab id="physics" icon={Atom} label="Phys" />
          <NavTab id="chemistry" icon={FlaskConical} label="Chem" />
          <NavTab id="electrical" icon={Zap} label="Elec" colorClass="text-yellow-400" />
          <NavTab id="computerscience" icon={Terminal} label="CS" colorClass="text-blue-400" />
          <NavTab id="civilmech" icon={Wrench} label="Mech" colorClass="text-zinc-300" />
          <NavTab id="finance" icon={Wallet} label="Fin" colorClass="text-emerald-400" />
          <NavTab id="health" icon={Dumbbell} label="Health" colorClass="text-orange-400" />
          <NavTab id="student" icon={GraduationCap} label="Edu" colorClass="text-cyan-400" />
          <NavTab id="currency" icon={RefreshCw} label="Curr" />
        </div>
        
        <button 
          onClick={() => setMode('history')} 
          className={`shrink-0 p-2.5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${mode === 'history' ? 'bg-lime-500 text-black shadow-[0_0_20px_rgba(132,204,22,0.5)] scale-105' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* 🔀 DYNAMIC RENDER PANELS WITH BUTTERY ENTRANCE ANIMATION 
          (Using key={mode} forces React to replay the animate-in classes on tab switch!) */}
      <div key={mode} className="flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-0">
        
        {mode === 'history' ? (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white/80 tracking-wide">Calculation History</h3>
              <button onClick={clearHistory} className="text-[10px] uppercase tracking-wider px-4 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors duration-300 active:scale-95">Clear</button>
            </div>
            {isLoading ? (
              <div className="flex justify-center mt-10">
                <div className="w-5 h-5 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex justify-between items-end hover:bg-white/[0.06] transition-colors duration-300 cursor-default backdrop-blur-md">
                    <div className="text-white/50 text-xs font-mono">{h.expression} =</div>
                    <div className="text-lg font-medium text-white">{h.result}</div>
                  </div>
                ))}
                {history.length === 0 && <p className="text-center text-white/30 text-sm mt-10">No cloud records found.</p>}
              </div>
            )}
          </div>
        ) : mode === 'currency' ? (
          <div className="flex-1 flex items-center justify-center p-6 flex-col gap-6">
            <div className="text-center text-lime-400/60 animate-pulse">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <p className="text-sm font-medium tracking-wide">Initializing Forex Engine...</p>
            </div>
          </div>
        ) : mode === 'unit' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedUnit ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 px-2">Unit Categories</h3>
                <div className="grid grid-cols-2 gap-3 pb-4 px-1">
                  {UNIT_CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setSelectedUnit(cat)} className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl py-3 px-4 text-xs font-medium text-white/80 hover:text-white text-center truncate transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:shadow-lg active:scale-95">{cat}</button>
                  ))}
                </div>
              </div>
            ) : <UnitConverter category={selectedUnit} onBack={() => setSelectedUnit(null)} />}
          </div>
        ) : mode === 'geometry' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedGeo ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Coordinate & Shapes</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {GEOMETRY_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={TriangleRight} onClick={() => setSelectedGeo(cat)} />)}
                </div>
              </div>
            ) : <GeometryCalculator category={selectedGeo} onBack={() => setSelectedGeo(null)} />}
          </div>
        ) : mode === 'algebra' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedAlg ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Equations & Math</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {ALGEBRA_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Binary} onClick={() => setSelectedAlg(cat)} />)}
                </div>
              </div>
            ) : <AlgebraCalculator category={selectedAlg} onBack={() => setSelectedAlg(null)} />}
          </div>
        ) : mode === 'statistics' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedStat ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Data & Probabilities</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {STATISTICS_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={BarChart2} onClick={() => setSelectedStat(cat)} />)}
                </div>
              </div>
            ) : <StatisticsCalculator category={selectedStat} onBack={() => setSelectedStat(null)} />}
          </div>
        ) : mode === 'calculus' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedCalc ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Advanced Calculus</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {CALCULUS_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Sigma} onClick={() => setSelectedCalc(cat)} />)}
                </div>
              </div>
            ) : <CalculusCalculator category={selectedCalc} onBack={() => setSelectedCalc(null)} />}
          </div>
        ) : mode === 'physics' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedPhys ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Physics & Mechanics</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {PHYSICS_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Atom} onClick={() => setSelectedPhys(cat)} />)}
                </div>
              </div>
            ) : <PhysicsCalculator category={selectedPhys} onBack={() => setSelectedPhys(null)} />}
          </div>
        ) : mode === 'chemistry' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedChem ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lime-500 mb-4 px-2">Chemical Reactions</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {CHEMISTRY_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={FlaskConical} onClick={() => setSelectedChem(cat)} />)}
                </div>
              </div>
            ) : <ChemistryCalculator category={selectedChem} onBack={() => setSelectedChem(null)} />}
          </div>
        ) : mode === 'electrical' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedElec ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-4 px-2">Electrical & Circuits</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {ELECTRICAL_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Zap} onClick={() => setSelectedElec(cat)} />)}
                </div>
              </div>
            ) : <ElectricalCalculator category={selectedElec} onBack={() => setSelectedElec(null)} />}
          </div>
        ) : mode === 'computerscience' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedCS ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4 px-2">Code & Networks</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {CS_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Terminal} onClick={() => setSelectedCS(cat)} />)}
                </div>
              </div>
            ) : <ComputerScienceCalculator category={selectedCS} onBack={() => setSelectedCS(null)} />}
          </div>
        ) : mode === 'civilmech' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedCivilMech ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-2">Materials & Mechanics</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {CIVIL_MECH_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Wrench} onClick={() => setSelectedCivilMech(cat)} />)}
                </div>
              </div>
            ) : <CivilMechanicalCalculator category={selectedCivilMech} onBack={() => setSelectedCivilMech(null)} />}
          </div>
        ) : mode === 'finance' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedFinance ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 px-2">Wealth & Planning</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {FINANCE_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Wallet} onClick={() => setSelectedFinance(cat)} />)}
                </div>
              </div>
            ) : <FinanceCalculator category={selectedFinance} onBack={() => setSelectedFinance(null)} />}
          </div>
        ) : mode === 'health' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedHealth ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 px-2">Fitness & Body</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {HEALTH_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={Dumbbell} onClick={() => setSelectedHealth(cat)} />)}
                </div>
              </div>
            ) : <HealthCalculator category={selectedHealth} onBack={() => setSelectedHealth(null)} />}
          </div>
        ) : mode === 'student' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedStudent ? (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4 px-2">Campus & Grades</h3>
                <div className="grid grid-cols-1 gap-3 pb-4 px-1">
                  {STUDENT_CATEGORIES.map((cat) => <CategoryCard key={cat} label={cat} icon={GraduationCap} onClick={() => setSelectedStudent(cat)} />)}
                </div>
              </div>
            ) : <StudentCalculator category={selectedStudent} onBack={() => setSelectedStudent(null)} />}
          </div>
        ) : (
          /* 🧮 STANDARD & SCIENTIFIC CALCULATOR ENGINE */
          <div className="flex-1 flex flex-col p-5">
            <div className="flex-1 flex flex-col items-end justify-end pb-8 pr-2">
              <div className="text-white/40 text-xl min-h-[30px] font-mono tracking-wider mb-2">{expression}</div>
              <div className="text-[4.5rem] font-light tracking-tight truncate max-w-full text-white drop-shadow-md">{display}</div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mt-auto">
              {mode === 'scientific' && (
                <>
                  <PillButton label="sin" onClick={() => {}} colorClass="bg-black/30 border border-white/5 text-lime-400 text-sm" />
                  <PillButton label="cos" onClick={() => {}} colorClass="bg-black/30 border border-white/5 text-lime-400 text-sm" />
                  <PillButton label="tan" onClick={() => {}} colorClass="bg-black/30 border border-white/5 text-lime-400 text-sm" />
                  <PillButton label="π" onClick={() => handleNum('3.14159')} colorClass="bg-black/30 border border-white/5 text-lime-400 text-sm font-serif" />
                </>
              )}
              
              <PillButton label="AC" onClick={clearDisplay} colorClass="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20" />
              <PillButton label={<Delete className="w-5 h-5"/>} onClick={deleteLast} />
              <PillButton label="%" onClick={() => setDisplay(String(Number(display) / 100))} />
              <PillButton label="÷" onClick={() => handleOp('/')} colorClass="bg-lime-500/10 border border-lime-500/20 text-lime-400 hover:bg-lime-500/20" />

              <PillButton label="7" onClick={() => handleNum('7')} />
              <PillButton label="8" onClick={() => handleNum('8')} />
              <PillButton label="9" onClick={() => handleNum('9')} />
              <PillButton label="×" onClick={() => handleOp('*')} colorClass="bg-lime-500/10 border border-lime-500/20 text-lime-400 hover:bg-lime-500/20" />

              <PillButton label="4" onClick={() => handleNum('4')} />
              <PillButton label="5" onClick={() => handleNum('5')} />
              <PillButton label="6" onClick={() => handleNum('6')} />
              <PillButton label="-" onClick={() => handleOp('-')} colorClass="bg-lime-500/10 border border-lime-500/20 text-lime-400 hover:bg-lime-500/20" />

              <PillButton label="1" onClick={() => handleNum('1')} />
              <PillButton label="2" onClick={() => handleNum('2')} />
              <PillButton label="3" onClick={() => handleNum('3')} />
              <PillButton label="+" onClick={() => handleOp('+')} colorClass="bg-lime-500/10 border border-lime-500/20 text-lime-400 hover:bg-lime-500/20" />

              <button 
                onClick={() => handleNum('0')} 
                className="col-span-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/90 text-xl font-medium transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.90] shadow-sm hover:shadow-md h-14 flex items-center justify-start pl-8 backdrop-blur-md"
              >
                0
              </button>
              <PillButton label="." onClick={() => display.includes('.') ? null : handleNum('.')} />
              
              <button 
                onClick={handleEqual}
                className="rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.85] shadow-[0_0_20px_rgba(132,204,22,0.3)] hover:shadow-[0_0_30px_rgba(132,204,22,0.5)] border border-lime-400/50 bg-lime-500/90 text-black h-14 hover:bg-lime-400 backdrop-blur-md"
              >
                =
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}