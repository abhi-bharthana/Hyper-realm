'use client';

import React, { useState, useEffect } from 'react';
import { User, LayoutDashboard, Palette, Activity, Shield } from 'lucide-react'; 
import { useUserStore } from '@/store/useUserStore';
import { useWellbeingStore } from '@/store/useWellbeingStore';

import IdentityModule from './modules/IdentityModule';
import WidgetsModule from './modules/WidgetsModule';
import AppearanceModule from './modules/AppearanceModule';
import WellbeingModule from './modules/WellbeingModule';
import PrivacyModule from './modules/PrivacyModule'; 

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    useUserStore.persist.rehydrate();
    useWellbeingStore.persist.rehydrate(); 
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-full w-full text-white overflow-hidden bg-transparent font-sans">
      
      {/* 💊 SIDEBAR MENU - PILL BASED */}
      <div className="w-60 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col p-5 gap-2 select-none z-10 shrink-0">
        <div className="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 mt-4">System Config</div>
        
        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'profile' ? 'bg-[#8d6bff]/20 text-[#8d6bff] shadow-[0_4px_15px_rgba(141,107,255,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><User size={16} /> Identity</button>
        <button onClick={() => setActiveTab('widgets')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'widgets' ? 'bg-[#52d9ff]/20 text-[#52d9ff] shadow-[0_4px_15px_rgba(82,217,255,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><LayoutDashboard size={16} /> Widgets</button>
        <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'appearance' ? 'bg-[#ffbd2e]/20 text-[#ffbd2e] shadow-[0_4px_15px_rgba(255,189,46,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><Palette size={16} /> Appearance</button>
        
        <div className="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 mt-6">Privacy & Tracking</div>
        
        <button onClick={() => setActiveTab('privacy')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'privacy' ? 'bg-[#ff5f56]/20 text-[#ff5f56] shadow-[0_4px_15px_rgba(255,95,86,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><Shield size={16} /> Privacy</button>
        <button onClick={() => setActiveTab('wellbeing')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'wellbeing' ? 'bg-[#06b6d4]/20 text-[#06b6d4] shadow-[0_4px_15px_rgba(6,182,212,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><Activity size={16} /> Wellbeing</button>
      </div>

      {/* 🖥️ MAIN CONTENT AREA - 🚀 FIXED SCROLLING */}
      <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-black/10 to-transparent custom-scrollbar">
        {/* 🚀 Ye inner wrapper exact 128px (pb-32) ki khali jagah dega aakhri me */}
        <div className="w-full min-h-full p-8 pb-32">
          {activeTab === 'profile' && <IdentityModule />}
          {activeTab === 'widgets' && <WidgetsModule />}
          {activeTab === 'appearance' && <AppearanceModule />}
          {activeTab === 'privacy' && <PrivacyModule />} 
          {activeTab === 'wellbeing' && <WellbeingModule />}
        </div>
      </div>
    </div>
  );
}