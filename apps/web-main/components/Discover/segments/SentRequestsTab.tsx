"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, User } from "lucide-react";
import { api, API_URLS } from "@/lib/api";

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png"; 

export function SentRequestsTab() {
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const data = await api.get(`${API_URLS.HUB}/users/requests/sent`);
        setSentRequests(data || []);
      } catch (e) {
        console.error("Failed to fetch sent requests", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSentRequests();
  }, []);

  const handleCancelRequest = async (targetHid: string) => {
    // Optimistic UI: Turant hatado screen se
    setSentRequests((prev) => prev.filter((r) => r.hid !== targetHid));
    try {
      await api.post(`${API_URLS.HUB}/users/requests/cancel`, { target_hid: targetHid });
    } catch (e) {
      console.error("Failed to cancel request", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Fetching Outgoing Data...</span>
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 opacity-50">
        <p className="text-xs uppercase font-black tracking-widest">No Outgoing Pending Links</p>
      </div>
    );
  }

  return (
    <>
      {sentRequests.map((req, idx) => {
        let displayAvatar = req.avatar_url || (req.gender === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT);

        return (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            key={req.hid} 
            className="p-4 rounded-[1.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-between group hover:border-red-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm text-foreground truncate">{req.nickname}</h4>
                <p className="text-[9px] font-mono text-amber-500/80 uppercase tracking-wider">Requested • Pending</p>
              </div>
            </div>

            <button 
              onClick={() => handleCancelRequest(req.hid)}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </motion.div>
        );
      })}
    </>
  );
}