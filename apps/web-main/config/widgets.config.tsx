import React, { useEffect, useState } from 'react';
import { useVFSStore } from '@/store/useVFSStore'; 
import { useWellbeingStore } from '@/store/useWellbeingStore'; 
import { Activity, Layers } from 'lucide-react'; 
import { SYSTEM_APPS } from '@/config/apps.config'; 

// 🚀 NAYA: WIDGET SETTINGS SCHEMA
export interface WidgetSettingOption {
  key: string;
  type: 'color' | 'toggle' | 'select' | 'text';
  label: string;
  defaultValue: any;
  options?: string[]; // Only for 'select'
}

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  defaultSize: { w: number; h: number }; 
  permissions: string[];
  settingsSchema?: WidgetSettingOption[]; // 🚀 Optional Configuration Menu
  render: (api: any, widgetConfig?: Record<string, any>) => React.ReactNode; 
}

export const defineWidget = (config: WidgetDefinition) => config;

const formatTimeCompact = (totalSeconds: number) => {
  if (!totalSeconds) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// ==========================================
// 🛠️ SYSTEM WIDGETS REGISTRY
// ==========================================

export const SYSTEM_WIDGETS: Record<string, WidgetDefinition> = {
  
  // 1. NEON CLOCK
  'com.system.clock': defineWidget({
    id: 'com.system.clock',
    name: 'Neon Clock',
    description: 'A futuristic glassmorphic time display.',
    defaultSize: { w: 2, h: 2 },
    permissions: [],
    render: () => {
      const [time, setTime] = useState(new Date());
      useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
      }, []);
      
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#52d9ff]/20 rounded-full blur-[30px]" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#52d9ff] drop-shadow-md tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
            {time.toLocaleDateString()}
          </p>
        </div>
      );
    }
  }),

  // 2. 🚀 HYPER DRIVE MONITOR
  'com.system.storage': defineWidget({
    id: 'com.system.storage',
    name: 'Storage Monitor',
    description: 'Live VFS node statistics from Hyper Drive.',
    defaultSize: { w: 2, h: 2 },
    permissions: ['vfs_read'],
    render: () => {
      const { nodes } = useVFSStore();
      
      const fileCount = Object.values(nodes).filter(n => n?.type?.toLowerCase() === 'file').length;
      const folderCount = Object.values(nodes).filter(n => n?.type?.toLowerCase() === 'folder').length;
      const totalNodes = fileCount + folderCount;

      return (
        <div className="w-full h-full p-5 bg-[#050508]/80 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8d6bff]/20 rounded-full blur-[40px] group-hover:bg-[#8d6bff]/40 transition-all duration-500" />
          
          <div className="flex justify-between items-center z-10">
            <h3 className="text-white font-bold text-[10px] tracking-widest uppercase">Hyper Drive</h3>
            <div className="w-2 h-2 rounded-full bg-[#8d6bff] shadow-[0_0_10px_#8d6bff] animate-pulse" />
          </div>
          
          <div className="z-10 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#8d6bff]">
                {totalNodes}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nodes</span>
            </div>
          </div>

          <div className="flex gap-3 text-[10px] font-mono font-bold z-10 bg-black/40 p-2 rounded-xl border border-white/5">
             <div className="flex-1 text-center text-gray-400"><span className="text-[#52d9ff] text-sm block">{fileCount}</span> FILES</div>
             <div className="w-px bg-white/10"></div>
             <div className="flex-1 text-center text-gray-400"><span className="text-[#8d6bff] text-sm block">{folderCount}</span> DIRS</div>
          </div>
        </div>
      );
    }
  }),

  // 3. 🌐 LIVE CRYPTO TRACKER
  'com.network.crypto': defineWidget({
    id: 'com.network.crypto',
    name: 'BTC Live',
    description: 'Real-time Bitcoin price from the web.',
    defaultSize: { w: 2, h: 2 },
    permissions: ['internet'],
    render: () => {
      const [btc, setBtc] = useState<string>('Loading...');
      
      useEffect(() => {
        const fetchBTC = async () => {
          try {
            const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await res.json();
            setBtc('$' + data.bpi.USD.rate.split('.')[0]); 
          } catch {
            setBtc('Error');
          }
        };
        
        fetchBTC();
        const interval = setInterval(fetchBTC, 30000); 
        return () => clearInterval(interval);
      }, []);

      return (
        <div className="w-full h-full p-5 bg-gradient-to-br from-[#f7931a]/10 to-black/60 border border-[#f7931a]/20 rounded-3xl backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f7931a] to-[#d67b0f] flex items-center justify-center font-bold text-white shadow-[0_5px_15px_rgba(247,147,26,0.4)] text-lg">
              ₿
            </div>
            <span className="text-[9px] text-[#f7931a] font-black uppercase tracking-[0.2em] animate-pulse bg-[#f7931a]/10 px-2 py-1 rounded-md">Live API</span>
          </div>
          
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Bitcoin (USD)</p>
            <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tight">{btc}</h2>
          </div>
        </div>
      );
    }
  }),

  // 4. 🧠 DIGITAL WELLBEING WIDGET
  'com.system.wellbeing': defineWidget({
    id: 'com.system.wellbeing',
    name: 'Digital Wellbeing',
    description: 'Live OS Screen Time and App Telemetry.',
    defaultSize: { w: 2, h: 2 },
    permissions: ['telemetry'],
    render: () => {
      const { realScreenTime, appUsage } = useWellbeingStore() as any;

      const topApp = Object.entries(appUsage || {})
        .map(([appId, stats]: any) => ({ appId, ...stats }))
        .sort((a, b) => b.activeTime - a.activeTime)[0];

      const AppDef = topApp ? SYSTEM_APPS[topApp.appId] : null;
      const Icon = AppDef?.icon || Layers;

      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#0d0d12]/80 to-[#1a1a24]/80 backdrop-blur-[40px] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative group cursor-pointer hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#52d9ff]/15 rounded-full blur-[35px] group-hover:bg-[#52d9ff]/25 transition-all duration-500" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Activity size={12} className="text-[#52d9ff]" /> Wellbeing
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          </div>

          <div className="z-10 mt-1">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight drop-shadow-md">
              {formatTimeCompact(realScreenTime)}
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Today's Screen Time</div>
          </div>

          <div className="z-10 bg-white/5 rounded-2xl p-2.5 flex items-center justify-between border border-white/5 backdrop-blur-md shadow-inner">
            {topApp ? (
              <>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-1.5 bg-black/40 rounded-xl shadow-inner border border-white/5 shrink-0">
                    {typeof Icon === 'string' ? (
                      <img src={Icon} alt="app" className="w-3.5 h-3.5 object-contain" />
                    ) : (
                      <Icon size={14} className={AppDef?.color || 'text-white'} />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white capitalize truncate w-[65px]">
                    {AppDef?.name || topApp.appId}
                  </div>
                </div>
                <div className="text-[10px] font-black text-[#52d9ff] shrink-0 drop-shadow-md">
                  {formatTimeCompact(topApp.activeTime)}
                </div>
              </>
            ) : (
              <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase w-full text-center py-1">
                No Activity
              </div>
            )}
          </div>
        </div>
      );
    }
  }),

  // 5. 🔤 TRANSPARENT TYPOGRAPHY CLOCK
  'com.system.transparent_clock': defineWidget({
    id: 'com.system.transparent_clock',
    name: 'Sci-Fi Typo Clock',
    description: 'A completely transparent, resizable typography widget.',
    defaultSize: { w: 4, h: 2 }, 
    permissions: [],
    
    // 🚀 NEW: WIDGET SETTINGS SCHEMA
    settingsSchema: [
      { key: 'textColor', type: 'color', label: 'Primary Text Color', defaultValue: '#ffffff' },
      { key: 'shadowColor', type: 'color', label: 'Glow Color', defaultValue: '#52d9ff' },
      { key: 'showShadow', type: 'toggle', label: 'Enable Glow Effect', defaultValue: true },
      { 
        key: 'fontFamily', 
        type: 'select', 
        label: 'Typography Style', 
        options: ['Syncopate', 'Anurati', 'Aquire', 'Nasalization', 'Neuropol', 'Ethnocentric'],
        defaultValue: 'Syncopate'
      }
    ],

    render: (api, widgetConfig) => {
      const [time, setTime] = useState(new Date());

      useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
      }, []);

      // Parse Settings from Store (With defaults fallback)
      const color = widgetConfig?.textColor || '#ffffff';
      const shadowColor = widgetConfig?.shadowColor || '#52d9ff';
      const shadowEnabled = widgetConfig?.showShadow ?? true;
      const fontFamily = widgetConfig?.fontFamily || 'Syncopate';

      const dayName = time.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const dateStr = `${time.getDate()} ${time.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}, ${time.getFullYear()}`;
      const timeStr = `- ${time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} -`;

      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative pointer-events-none" style={{ containerType: 'inline-size' }}>
          
          {/* 🚀 Dynamic Font Injection from External CDNs */}
          <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@700&display=swap');
            @import url('https://fonts.cdnfonts.com/css/anurati');
            @import url('https://fonts.cdnfonts.com/css/aquire');
            @import url('https://fonts.cdnfonts.com/css/nasalization-rg');
            @import url('https://fonts.cdnfonts.com/css/neuropol-x-free');
            @import url('https://fonts.cdnfonts.com/css/ethnocentric');
          `}} />

          {/* 🖋️ TYPOGRAPHY ENGINE */}
          <div
            className="flex flex-col items-center justify-center w-full transition-all duration-500 ease-out select-none"
            style={{
              color: color,
              textShadow: shadowEnabled ? `0px 15px 35px ${shadowColor}80, 0px 4px 10px rgba(0,0,0,0.8)` : 'none'
            }}
          >
            {/* DAY */}
            <h1
              className="font-black leading-none mb-3"
              style={{ 
                fontFamily: `'${fontFamily}', sans-serif`, 
                fontSize: '11cqw',
                letterSpacing: fontFamily === 'Anurati' ? '0.1em' : '0.25em' // Fix spacing for heavy fonts
              }}
            >
              {dayName}
            </h1>

            {/* DATE */}
            <h2
              className="font-bold tracking-widest leading-tight opacity-90"
              style={{ fontSize: '3cqw', fontFamily: "system-ui, sans-serif" }}
            >
              {dateStr}
            </h2>

            {/* TIME */}
            <h3
              className="font-medium tracking-[0.2em] mt-1 opacity-70"
              style={{ fontSize: '2.5cqw', fontFamily: "system-ui, sans-serif" }}
            >
              {timeStr}
            </h3>
          </div>
        </div>
      );
    }
  })

};