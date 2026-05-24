"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Compass, Lock, UserPlus, Search, Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { api, API_URLS } from "@/lib/api";

export function DiscoverPanel() {
  const { theme, isDiscoverOpen, toggleDiscover } = useThemeStore();
  const isLight = theme === 'light-verdant';
  
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'mutuals'>('suggestions');
  
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isDiscoverOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'suggestions') {
          // NOTE: Suggestions ke liye abhi backend route nahi hai, isliye mock rakha hai.
          // Jab backend pe /suggestions ban jaye, tab isko api.get se replace kar dena.
          setTimeout(() => {
            setUsers([
              { hid: "usr-001", nickname: "NeonNinja", role: "Commander" },
              { hid: "usr-002", nickname: "CyberSamurai", role: "Agent" },
              { hid: "usr-003", nickname: "DataWeaver", role: "Agent" },
            ]);
            setIsLoading(false);
          }, 800);
        } 
        else if (activeTab === 'requests') {
          // ⚡ ASLI BACKEND FETCH: Go Server se Pending Requests layega
          const data = await api.get(`${API_URLS.HUB}/users/requests`);
          setRequests(data || []);
          setIsLoading(false);
        }
      } catch (e) {
        console.error(`Failed to fetch ${activeTab}`, e);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isDiscoverOpen, activeTab]);

  const handleAcceptRequest = async (hid: string) => {
    // ⚡ Optimistic UI: Server par request jane se pehle hi UI se hata do taaki fast feel ho
    setRequests((prev) => prev.filter((r) => r.hid !== hid));

    try {
      // ⚡ ASLI API CALL: Backend DB me status 'accepted' karega
      await api.post(`${API_URLS.HUB}/users/requests/accept`, { target_hid: hid });
      console.log(`Accepted request from ${hid}`);
    } catch (e) {
      console.error("Failed to accept request", e);
      // Agar fail ho jaye toh user ko alert de sakte ho
    }
  };

  const handleDeclineRequest = async (hid: string) => {
    // ⚡ Optimistic UI
    setRequests((prev) => prev.filter((r) => r.hid !== hid));

    try {
      // ⚡ ASLI API CALL: Backend DB se connection entry delete karega
      await api.post(`${API_URLS.HUB}/users/requests/decline`, { target_hid: hid });
      console.log(`Declined request from ${hid}`);
    } catch (e) {
      console.error("Failed to decline request", e);
    }
  };

  return (
    <AnimatePresence>
      {isDiscoverOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDiscover}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`fixed left-0 top-0 h-screen z-[101] w-full md:w-[400px] shadow-2xl border-r
              ${isLight ? 'bg-white/95 border-black/5' : 'bg-[#0a0a0a]/95 border-white/5'} backdrop-blur-3xl p-8 overflow-y-auto flex flex-col`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
                  Discover
                </h2>
              </div>
              <button onClick={toggleDiscover} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search matrix..." 
                className={`w-full py-3 pl-10 pr-4 rounded-2xl border text-sm font-medium outline-none transition-all
                  ${isLight ? 'bg-black/5 border-black/10 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary'}`}
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-8 p-1 rounded-2xl bg-foreground/5">
              <button 
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'suggestions' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Suggestions
              </button>
              
              <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all relative ${activeTab === 'requests' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Requests
                {requests.length > 0 && activeTab !== 'requests' && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              <button 
                disabled
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-muted-foreground/40 flex items-center justify-center gap-1 cursor-not-allowed"
              >
                Mutuals <Lock className="w-3 h-3" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Scanning Network...</span>
                </div>
              ) : (
                <>
                  {/* --- TAB: SUGGESTIONS --- */}
                  {activeTab === 'suggestions' && users.map((user, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      key={user.hid} 
                      className="p-4 rounded-[1.5rem] border border-border bg-card/30 backdrop-blur-sm flex items-center justify-between group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold">
                          {user.nickname.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{user.nickname}</h4>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{user.role}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-primary hover:text-black flex items-center justify-center transition-all">
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}

                  {/* --- TAB: REQUESTS --- */}
                  {activeTab === 'requests' && requests.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 opacity-50">
                      <p className="text-xs uppercase font-black tracking-widest">No Pending Requests</p>
                    </div>
                  )}

                  {activeTab === 'requests' && requests.map((req, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
                      key={req.hid} 
                      className="p-4 rounded-[1.5rem] border border-primary/20 bg-primary/5 backdrop-blur-sm flex flex-col gap-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold">
                            {req.nickname.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{req.nickname}</h4>
                            {/* Note: Go backend se humne `time` bhej diya tha as "New", isliye waisa dikhega */}
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{req.role} • {req.time || 'New'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Accept / Decline Action Buttons */}
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => handleAcceptRequest(req.hid)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button 
                          onClick={() => handleDeclineRequest(req.hid)}
                          className="w-12 flex items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}