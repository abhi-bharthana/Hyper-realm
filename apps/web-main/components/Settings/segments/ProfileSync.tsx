"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { api, API_URLS } from "@/lib/api";
import { useThemeStore } from "@/store/useThemeStore";

// Wahi same placeholder images jo humne dashboard profile ke liye use ki thi
const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png"; 

export function ProfileSync() {
  const { theme } = useThemeStore();
  const [profile, setProfile] = useState<any>(null);
  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get(`${API_URLS.HUB}/profile`); 
        setProfile(data);
      } catch (e) {
        console.error("Profile sync failed", e);
      }
    };
    fetchProfile();
  }, []);

  // 🚀 Avatar Resolution Logic (Same as ProfileHeader)
  let displayAvatar = null;
  if (profile) {
    if (profile.avatar_url) {
      displayAvatar = profile.avatar_url;
    } else if (profile.gender === 'female') {
      displayAvatar = IMAGE_2_FEMALE_DEFAULT;
    } else {
      displayAvatar = IMAGE_1_MALE_DEFAULT;
    }
  }

  return (
    <section className="mb-8">
      <div className={`p-6 rounded-[2.5rem] border backdrop-blur-md ${
        isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/5 bg-zinc-900/40'
      }`}>
        <div className="flex items-center gap-4">
          
          {/* 🚀 FIX: rounded-2xl ki jagah rounded-full kiya circular ke liye, aur overflow-hidden lagaya */}
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg overflow-hidden shrink-0" 
            style={{ backgroundColor: theme?.primary || '#16a34a' }}
          >
            {displayAvatar ? (
              <img 
                src={displayAvatar} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="text-black w-7 h-7 stroke-[2.5]" />
            )}
          </div>

          <div className="overflow-hidden">
            <h3 className="font-black text-lg tracking-tight truncate leading-none mb-1">
              {profile?.nickname || "Syncing Agent..."}
            </h3>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-70" style={{ color: theme?.primary }}>
              ID: {profile?.hid?.split('-')[0] || "Auth..."}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}