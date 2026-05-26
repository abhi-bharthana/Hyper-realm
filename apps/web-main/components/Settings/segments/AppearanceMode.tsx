"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";

export function AppearanceMode() {
  const { theme, setTheme } = useThemeStore();
  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';
  const currentThemeId = theme?.id || theme;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Sun className="w-3 h-3" style={{ color: theme?.primary }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Appearance Mode</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setTheme('dark-green')}
          className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
            currentThemeId !== 'light-verdant' 
              ? 'border-primary bg-primary/10 shadow-md' 
              : isLight ? 'border-slate-200 bg-slate-200/40 hover:bg-slate-200/80' : 'border-white/5 bg-white/5'
          }`}
          style={currentThemeId !== 'light-verdant' ? { borderColor: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
        >
          <Moon className="w-6 h-6" style={{ color: currentThemeId !== 'light-verdant' ? theme?.primary : undefined }} />
          <span className="text-[10px] font-bold uppercase italic">Dark Node</span>
        </button>

        <button 
          onClick={() => setTheme('light-verdant')}
          className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
            currentThemeId === 'light-verdant' 
              ? 'border-primary bg-primary/10 shadow-md' 
              : isLight ? 'border-slate-200 bg-slate-200/40' : 'border-white/5 bg-white/5'
          }`}
          style={currentThemeId === 'light-verdant' ? { borderColor: theme?.primary, backgroundColor: `${theme?.primary}1a` } : {}}
        >
          <Sun className="w-6 h-6" style={{ color: currentThemeId === 'light-verdant' ? theme?.primary : undefined }} />
          <span className="text-[10px] font-bold uppercase italic">Light Node</span>
        </button>
      </div>
    </section>
  );
}