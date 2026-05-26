"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Loader2, User } from "lucide-react";
import { api, API_URLS } from "@/lib/api";

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png"; 

export function SuggestionsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // ⚡ REAL API CALL: Fetching random profiles from Go Backend
        const data = await api.get(`${API_URLS.HUB}/users/discover`);
        setUsers(data || []);
      } catch (e) {
        console.error("Failed to fetch suggestions", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleSendRequest = async (targetHid: string) => {
    // Optimistic UI: Turant list se hata do taaki fast feel ho
    setUsers((prev) => prev.filter((u) => u.hid !== targetHid));
    try {
      // ⚡ REAL API CALL: Sending friend request
      await api.post(`${API_URLS.HUB}/users/requests/send`, { target_hid: targetHid });
    } catch (e) {
      console.error("Failed to send request", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Scanning Network...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 opacity-50">
        <p className="text-xs uppercase font-black tracking-widest">No New Agents Found</p>
      </div>
    );
  }

  return (
    <>
      {users.map((user, idx) => {
        // Avatar Resolution Logic
        let displayAvatar = null;
        if (user.avatar_url) {
          displayAvatar = user.avatar_url;
        } else if (user.gender === 'female') {
          displayAvatar = IMAGE_2_FEMALE_DEFAULT;
        } else {
          displayAvatar = IMAGE_1_MALE_DEFAULT;
        }

        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            key={user.hid} 
            className="p-4 rounded-[1.5rem] border border-border bg-card/30 backdrop-blur-sm flex items-center justify-between group hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-foreground truncate">{user.nickname}</h4>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono truncate">{user.role || 'Agent'}</p>
              </div>
            </div>
            <button 
              onClick={() => handleSendRequest(user.hid)}
              className="w-8 h-8 shrink-0 rounded-full bg-foreground/5 hover:bg-primary hover:text-black flex items-center justify-center transition-all"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
    </>
  );
}