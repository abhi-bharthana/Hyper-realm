'use client';

import React, { useState, useEffect } from 'react';
import { User, LayoutDashboard, Palette, CheckCircle2, Monitor, Link2, FileText, Image as ImageIcon, Activity, Clock, Wifi, ShieldCheck } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore'; 
import { useWellbeingStore } from '@/store/useWellbeingStore'; // 👈 Wellbeing Store Import Kiya

// 🖼️ GOD LEVEL PRESET WALLPAPERS
const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Hyper Base (Gradient)', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop', name: 'Cyber City', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop', name: 'Deep Space', thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop', name: 'Abstract Liquid', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop' },
];

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png";

// ==========================================
// ⏱️ WELLBEING UTILS & COMPONENTS
// ==========================================
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const APP_META: Record<string, { name: string, color: string }> = {
  explorer: { name: 'File Explorer', color: 'bg-blue-500' },
  calculator: { name: 'Calculator', color: 'bg-lime-500' },
  settings: { name: 'Settings', color: 'bg-zinc-400' },
  terminal: { name: 'Terminal', color: 'bg-green-500' },
  canvas: { name: 'Neural Canvas', color: 'bg-purple-500' },
  taskmanager: { name: 'Task Manager', color: 'bg-red-500' },
  default: { name: 'System Process', color: 'bg-white/50' }
};

export const SettingsApp = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMounted, setIsMounted] = useState(false);
  
  const { profile, updateProfile, preferences, updatePreferences } = useUserStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  // 🚀 TAMPER-PROOF DATA: Reset option removed!
  const { totalOnlineTime, appUsage } = useWellbeingStore();

  const [widgets, setWidgets] = useState({
    storage: true, calendar: false, notes: true, cryptoTicker: false
  });

  useEffect(() => { setLocalProfile(profile); }, [profile]);

  useEffect(() => {
    useUserStore.persist.rehydrate();
    useWellbeingStore.persist.rehydrate(); 
    setIsMounted(true);
  }, []);

  const handleSaveProfile = () => {
    updateProfile(localProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); 
  };

  if (!isMounted) return null;

  const getAvatarSource = () => {
    const url = localProfile?.avatarUrl;
    const gender = localProfile?.gender?.toLowerCase() || ''; 
    if (!url || url === '/avatar-3d.png' || url === '') {
      return gender === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT;
    }
    return url;
  };

  return (
    <div className="flex h-full w-full text-white overflow-hidden bg-transparent font-sans">
      
      {/* ⬅️ SIDEBAR MENU - PILL BASED */}
      <div className="w-60 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col p-5 gap-2 select-none z-10">
        <div className="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 mt-4">System Config</div>
        
        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'profile' ? 'bg-[#8d6bff]/20 text-[#8d6bff] shadow-[0_4px_15px_rgba(141,107,255,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><User size={16} /> Identity</button>
        <button onClick={() => setActiveTab('widgets')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'widgets' ? 'bg-[#52d9ff]/20 text-[#52d9ff] shadow-[0_4px_15px_rgba(82,217,255,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><LayoutDashboard size={16} /> Widgets</button>
        <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'appearance' ? 'bg-[#ffbd2e]/20 text-[#ffbd2e] shadow-[0_4px_15px_rgba(255,189,46,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><Palette size={16} /> Appearance</button>

        <div className="px-3 py-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 mt-6">Privacy & Tracking</div>
        
        <button onClick={() => setActiveTab('wellbeing')} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold w-full ${activeTab === 'wellbeing' ? 'bg-[#06b6d4]/20 text-[#06b6d4] shadow-[0_4px_15px_rgba(6,182,212,0.1)] scale-105' : 'text-white/50 hover:bg-white/5 hover:text-white active:scale-95'}`}><Activity size={16} /> Wellbeing</button>

      </div>

      {/* ➡️ MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-10 pb-24 relative bg-gradient-to-br from-black/10 to-transparent custom-scrollbar">
        
        {/* 👤 PROFILE TAB */}
        {activeTab === 'profile' && (
          <div key="profile" className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
              <User className="text-[#8d6bff]" size={28} /> Profile Identity
            </h2>
            <p className="text-white/40 text-sm mb-8 font-medium">Synced with your live profile dashboard system.</p>
            
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8d6bff] to-[#52d9ff] p-1 shadow-[0_0_30px_rgba(141,107,255,0.3)] overflow-hidden">
                  <div className="w-full h-full bg-[#0a0a0f] rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={getAvatarSource()} 
                      alt="Dashboard Avatar" 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                      onError={(e) => { (e.target as HTMLImageElement).src = localProfile?.gender?.toLowerCase() === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT; }}
                    />
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#52d9ff]/10 border border-[#52d9ff]/20 text-[#52d9ff] text-[9px] font-black uppercase tracking-widest shadow-sm">Hyper User</span>
              </div>
              
              <div className="flex-1 space-y-5 w-full">
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 block pl-2">Global Handle</label>
                  <input type="text" value={localProfile?.username || ''} onChange={(e) => setLocalProfile({ ...localProfile, username: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#8d6bff]/50 focus:bg-white/5 transition-all font-mono text-sm shadow-inner" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 block pl-2">Display Name</label>
                  <input type="text" value={localProfile?.name || ''} onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#8d6bff]/50 focus:bg-white/5 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 block flex items-center gap-1.5 pl-2"><FileText size={12} className="text-[#ffbd2e]" /> User Tagline / Bio</label>
                  <textarea rows={2} value={localProfile?.bio || ''} onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-3xl px-5 py-4 text-white focus:outline-none focus:border-[#ffbd2e]/50 focus:bg-white/5 transition-all text-sm resize-none shadow-inner custom-scrollbar" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2 block flex items-center gap-1.5 pl-2"><Link2 size={12} className="text-[#52d9ff]" /> Avatar Source String</label>
                  <input type="text" value={localProfile?.avatarUrl || ''} onChange={(e) => setLocalProfile({ ...localProfile, avatarUrl: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#52d9ff]/50 focus:bg-white/5 transition-all text-xs font-mono shadow-inner" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-white/5 pt-6 flex items-center gap-5 pl-2">
              <button onClick={handleSaveProfile} className="bg-[#8d6bff]/90 hover:bg-[#8d6bff] text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300 active:scale-90 shadow-[0_0_20px_rgba(141,107,255,0.4)] hover:shadow-[0_0_30px_rgba(141,107,255,0.6)] flex items-center gap-2">
                {isSaved ? <><CheckCircle2 size={18} /> Synced</> : 'Save Profile'}
              </button>
              {JSON.stringify(profile) !== JSON.stringify(localProfile) && !isSaved && <span className="text-xs font-bold text-yellow-500/80 animate-pulse tracking-wide">Unsaved changes...</span>}
            </div>
          </div>
        )}

        {/* 🧩 WIDGETS TAB */}
        {activeTab === 'widgets' && (
           <div key="widgets" className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
             <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight"><LayoutDashboard className="text-[#52d9ff]" size={28} /> Global Widgets</h2>
             <p className="text-white/40 text-sm mb-8 font-medium">Toggle components across your OS Desktop and Main Dashboard.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(widgets).map(([key, isActive]) => (
                 <div key={key} className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-black/20 hover:bg-white/[0.03] transition-all duration-300 shadow-lg group">
                   <div>
                     <div className="font-bold capitalize text-sm text-white/80 group-hover:text-white transition-colors">{key.replace(/([A-Z])/g, ' $1').trim()} Module</div>
                     <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">Environment Sync</div>
                   </div>
                   <button onClick={() => setWidgets(prev => ({ ...prev, [key]: !prev[key as keyof typeof widgets] }))} className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ease-out flex items-center shadow-inner ${isActive ? 'bg-[#52d9ff]' : 'bg-white/10'}`}>
                     <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* 🎨 APPEARANCE & DOCK TAB */}
        {activeTab === 'appearance' && (
          <div key="appearance" className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
              <Palette className="text-[#ffbd2e]" size={28} /> Appearance & Dock
            </h2>
            <p className="text-white/40 text-sm mb-8 font-medium">Customize your workspace layout and dock behavior.</p>
            
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-white/5 bg-black/20 shadow-lg">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4 block flex items-center gap-2 pl-1">
                  <ImageIcon size={14} className="text-[#27c93f]" /> Desktop Wallpaper
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {WALLPAPER_PRESETS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => updatePreferences?.({ wallpaper: wp.id })}
                      className={`relative aspect-video rounded-2xl overflow-hidden border transition-all duration-300 ease-out group ${
                        preferences?.wallpaper === wp.id ? 'border-[#27c93f] shadow-[0_0_20px_rgba(39,201,63,0.3)] scale-105 z-10' : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      {wp.id === 'default' ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#030305] to-[#12121a] flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#8d6bff]/20 blur-xl" />
                        </div>
                      ) : (
                        <img src={wp.thumb} alt={wp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-widest backdrop-blur-sm">
                        Apply
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 block pl-1">Or paste custom Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={preferences?.wallpaper !== 'default' && !WALLPAPER_PRESETS.find(w => w.id === preferences?.wallpaper) ? preferences?.wallpaper : ''}
                    onChange={(e) => updatePreferences?.({ wallpaper: e.target.value || 'default' })}
                    className="w-full bg-black/40 border border-white/5 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[#27c93f]/50 focus:bg-white/5 text-xs font-mono shadow-inner transition-all"
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl border border-white/5 bg-black/20 shadow-lg">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4 block flex items-center gap-2 pl-1">
                  <Monitor size={14} /> Dock Position
                </label>
                <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
                  {['left', 'bottom', 'right'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updatePreferences?.({ dockPosition: pos as 'bottom'|'left'|'right' })}
                      className={`flex-1 py-3 rounded-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] text-sm font-bold capitalize ${
                        preferences?.dockPosition === pos ? 'bg-[#ffbd2e] text-black shadow-[0_0_15px_rgba(255,189,46,0.4)] scale-100' : 'text-white/50 hover:text-white hover:bg-white/5 active:scale-95'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-black/20 hover:bg-white/[0.03] transition-all shadow-lg group">
                <div className="pl-1">
                  <div className="font-bold text-white/80 group-hover:text-white transition-colors">Auto-Hide Dock</div>
                  <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">Hides when inactive</div>
                </div>
                <button 
                  onClick={() => updatePreferences?.({ dockAutoHide: !preferences?.dockAutoHide })}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ease-out flex items-center shadow-inner ${preferences?.dockAutoHide ? 'bg-[#ffbd2e]' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${preferences?.dockAutoHide ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🛡️ 🚀 GOD-MODE DIGITAL WELLBEING TAB */}
        {activeTab === 'wellbeing' && (
          <div key="wellbeing" className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                <Activity className="text-[#06b6d4]" size={28} /> Digital Wellbeing
              </h2>
              
              {/* 🚀 TAMPER-PROOF BADGE INSTEAD OF RESET BUTTON */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#27c93f] bg-[#27c93f]/10 px-3 py-1.5 rounded-full border border-[#27c93f]/20 shadow-sm cursor-default">
                <ShieldCheck className="w-3 h-3" /> Secure Vault
              </div>
            </div>
            
            <p className="text-white/40 text-sm mb-8 font-medium">
              Monitor your internet-connected screen time securely. <span className="text-[#ffbd2e]">Data is permanent and synced to the cloud for weekly analytics.</span>
            </p>
            
            {/* TOTAL TIME WIDGET */}
            <div className="flex flex-col items-center justify-center py-10 px-6 bg-gradient-to-br from-[#06b6d4]/10 to-transparent rounded-[2rem] border border-[#06b6d4]/20 shadow-[0_0_40px_rgba(6,182,212,0.05)] mb-8 relative overflow-hidden group">
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#27c93f]/20 text-[#27c93f] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                <Wifi className="w-3 h-3" /> Online Time
              </div>
              
              <div className="w-48 h-48 rounded-full border border-white/5 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center relative shadow-inner group-hover:border-[#06b6d4]/30 transition-colors duration-500">
                <div className="absolute inset-[-2px] rounded-full border-2 border-[#06b6d4] border-t-transparent animate-spin-slow opacity-30" />
                <Clock className="w-7 h-7 text-[#06b6d4] mb-3 opacity-80" />
                <span className="text-4xl font-light tracking-tight text-white">{formatTime(totalOnlineTime)}</span>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Active Tracker</span>
              </div>
            </div>

            {/* APP BREAKDOWN LIST */}
            <div>
              <h3 className="text-xs font-bold tracking-widest uppercase text-white/50 mb-5 flex items-center gap-2 pl-2">
                <ShieldCheck className="w-4 h-4" /> Usage Breakdown
              </h3>
              
              {Object.keys(appUsage).length === 0 ? (
                <div className="text-center py-10 bg-black/20 rounded-[2rem] border border-white/5 text-white/40 text-sm font-medium">
                  No internet-connected usage recorded yet.
                </div>
              ) : (
                <div className="space-y-4 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                  {Object.entries(appUsage)
                    .sort((a, b) => b[1] - a[1])
                    .map(([appId, time]) => {
                      const meta = APP_META[appId] || APP_META.default;
                      const percentage = totalOnlineTime > 0 ? (time / totalOnlineTime) * 100 : 0;
                      
                      return (
                        <div key={appId} className="flex flex-col gap-2">
                          <div className="flex justify-between items-end px-1">
                            <span className="text-sm font-bold text-white/80 capitalize">{meta.name}</span>
                            <span className="text-xs font-mono text-white/50">{formatTime(time)} <span className="text-[10px] ml-1">({percentage.toFixed(1)}%)</span></span>
                          </div>
                          <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div 
                              className={`h-full ${meta.color} transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};