'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, HardDrive, Bell, Globe, Check } from 'lucide-react';
import { usePermissionStore, PermissionType } from '@/store/usePermissionStore';
import { SYSTEM_APPS } from '@/config/apps.config';

export default function PrivacyModule() {
  const { appPermissions, togglePermission } = usePermissionStore();

  const getAppName = (appId: string) => {
    if (SYSTEM_APPS[appId]) return SYSTEM_APPS[appId].name;
    // Add Cloud Apps fallback here later if needed
    return appId;
  };

  const getPermissionDetails = (perm: string) => {
    switch(perm) {
      case 'storage:drive_read': return { label: 'Drive Read Access', icon: <HardDrive size={14} />, color: 'text-[#52d9ff]' };
      case 'storage:drive_write': return { label: 'Drive Write Access', icon: <HardDrive size={14} />, color: 'text-amber-400' };
      case 'notifications': return { label: 'Push Notifications', icon: <Bell size={14} />, color: 'text-yellow-400' };
      case 'network:outbound': return { label: 'Network & Internet', icon: <Globe size={14} />, color: 'text-[#27c93f]' };
      default: return { label: perm, icon: <Lock size={14} />, color: 'text-gray-400' };
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
        <Shield className="text-[#ff5f56]" size={28} /> Privacy & Security
      </h2>
      <p className="text-white/40 text-sm mb-8 font-medium">Manage which applications have access to your secure environment.</p>

      {Object.keys(appPermissions).length === 0 ? (
        <div className="p-10 border border-dashed border-white/10 rounded-[2.5rem] text-center bg-black/20 shadow-lg">
          <Lock className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <p className="text-sm font-bold text-white/60 uppercase tracking-widest">No Permissions Requested</p>
          <p className="text-xs text-white/40 mt-2">Third-party apps will appear here when they request access.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(appPermissions).map(([appId, perms]) => (
            <div key={appId} className="bg-black/20 border border-white/5 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5f56]/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#ff5f56]/10 transition-colors" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[1rem] bg-white/5 border border-white/10 flex items-center justify-center font-black text-[#52d9ff] text-xl shadow-inner uppercase">
                   {getAppName(appId).charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white/90">{getAppName(appId)}</h3>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{appId}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {Object.entries(perms).map(([permName, isGranted]) => {
                  const details = getPermissionDetails(permName);
                  return (
                    <div key={permName} className="flex items-center justify-between p-4 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl bg-white/5 shadow-sm ${details.color}`}>
                          {details.icon}
                        </div>
                        <span className="text-sm font-bold text-white/70">{details.label}</span>
                      </div>
                      
                      {/* God-Level Custom Toggle Switch */}
                      <button 
                        onClick={() => togglePermission(appId, permName as PermissionType, !isGranted)}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ease-out flex items-center shadow-inner ${isGranted ? 'bg-[#27c93f]' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          layout
                          initial={false}
                          className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md"
                          animate={{ x: isGranted ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {isGranted && <Check size={10} className="text-[#27c93f]" />}
                        </motion.div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}