import React, { useState, useEffect } from 'react';
import { User, FileText, Link2, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png";

export default function IdentityModule() {
  const { profile, updateProfile } = useUserStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { setLocalProfile(profile); }, [profile]);

  const handleSaveProfile = () => {
    updateProfile(localProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); 
  };

  const getAvatarSource = () => {
    const url = localProfile?.avatarUrl;
    const gender = localProfile?.gender?.toLowerCase() || ''; 
    if (!url || url === '/avatar-3d.png' || url === '') {
      return gender === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT;
    }
    return url;
  };

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
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
  );
}