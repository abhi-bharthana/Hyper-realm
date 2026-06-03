import React from 'react';
import { Palette, Image as ImageIcon, Monitor } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Hyper Base (Gradient)', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop', name: 'Cyber City', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop', name: 'Deep Space', thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop' },
  { id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop', name: 'Abstract Liquid', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop' },
];

export default function AppearanceModule() {
  const { preferences, updatePreferences } = useUserStore();

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
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
  );
}