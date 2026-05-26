"use client";

import { motion } from "framer-motion";
import { HardDrive, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";

export function StorageAccess() {
  const router = useRouter();
  const { theme, toggleSettings } = useThemeStore();
  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';

  const maxLimitBytes = 5 * 1024 * 1024 * 1024; 
  const usedStorageBytes = 1.54 * 1024 * 1024 * 1024; 
  const usedGB = (usedStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (maxLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const usagePercentage = ((usedStorageBytes / maxLimitBytes) * 100).toFixed(1);

  const navigateToDrive = () => {
    toggleSettings();
    router.push('/dashboard/drive');
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-3 h-3" style={{ color: theme?.primary }} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Network Storage</span>
      </div>
      
      <div 
        onClick={navigateToDrive}
        className={`p-5 rounded-[2rem] border transition-all cursor-pointer group ${
          isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
            Hyper Drive
          </h3>
          <button className={`p-1.5 rounded-lg transition-all group-hover:scale-110 ${
            isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-zinc-400'
          }`}>
            <ExternalLink className="w-3.5 h-3.5" style={{ color: theme?.primary }} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider">
            <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>{usedGB} GB Used</span>
            <span style={{ color: theme?.primary }}>{usagePercentage}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-black/40 border border-white/5'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: theme?.primary || '#16a34a' }}
            />
          </div>
          <div className="text-[8px] font-mono opacity-50 uppercase tracking-widest text-right pt-0.5">
            Max {totalGB}.00 GB Quota
          </div>
        </div>
      </div>
    </section>
  );
}