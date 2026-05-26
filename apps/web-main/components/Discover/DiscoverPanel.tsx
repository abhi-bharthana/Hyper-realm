"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Compass, Lock, Search, Loader2, UserPlus, User } from "lucide-react";
import { useState, useEffect } from "react";
import { api, API_URLS } from "@/lib/api";

// Segments Import
import { SuggestionsTab } from "./segments/SuggestionsTab";
import { RequestsTab } from "./segments/RequestsTab";
import { SentRequestsTab } from "./segments/SentRequestsTab";
import { MutualsTab } from "./segments/MutualsTab";

const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png";

export function DiscoverPanel() {
  const { theme, isDiscoverOpen, toggleDiscover } = useThemeStore();
  const isLight = theme === 'light-verdant' || theme?.type === 'light';
  
  // 🚀 Explicitly 4 Clear Tabs
  const [activeTab, setActiveTab] = useState<'suggestions' | 'received' | 'sent' | 'mutuals'>('suggestions');
  
  // 🔍 Live Search States Inside Discover
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentTrack, setSentTrack] = useState<Record<string, boolean>>({}); // Local state to track sent requests in search results

  // ⚡ Debounced Search Effect: Directly connected to /api/v1/search Go endpoint
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await api.get(`${API_URLS.HUB}/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data || []);
      } catch (err) {
        console.error("Discover search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce rate

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSendRequestFromSearch = async (targetHid: string) => {
    // Optimistic Update: Click karte hi state "Requested" kar do taaki user gayab na ho
    setSentTrack(prev => ({ ...prev, [targetHid]: true }));
    try {
      await api.post(`${API_URLS.HUB}/users/requests/send`, { target_hid: targetHid });
    } catch (e) {
      console.error("Failed to send request from search", e);
      setSentTrack(prev => ({ ...prev, [targetHid]: false })); // Rollback if failed
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
            className={`fixed left-0 top-0 h-screen z-[101] w-full md:w-[430px] shadow-2xl border-r
              ${isLight ? 'bg-white/95 border-black/5' : 'bg-[#0a0a0a]/95 border-white/5'} backdrop-blur-3xl p-8 overflow-y-auto flex flex-col`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Compass className="w-6 h-6 text-primary" style={{ color: theme?.primary }} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
                  Discover
                </h2>
              </div>
              <button onClick={toggleDiscover} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* 🔍 REAL-TIME SEARCH BAR */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matrix by name or HID..." 
                className={`w-full py-3 pl-10 pr-12 rounded-2xl border text-sm font-medium outline-none transition-all
                  ${isLight ? 'bg-black/5 border-black/10 focus:border-primary' : 'bg-white/5 border-white/10 focus:border-primary'}`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase opacity-60 hover:opacity-100 transition-opacity"
                >
                  Clear
                </button>
              )}
            </div>

            {/* 🚀 UPGRADED 4 CATEGORY TABS (Hidden when searching to avoid layout overlap) */}
            {searchQuery.trim().length === 0 && (
              <div className="grid grid-cols-4 gap-1 mb-8 p-1 rounded-2xl bg-foreground/5 text-center">
                <button 
                  onClick={() => setActiveTab('suggestions')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'suggestions' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  style={activeTab === 'suggestions' ? { backgroundColor: theme?.primary } : {}}
                >
                  Suggestions
                </button>
                
                <button 
                  onClick={() => setActiveTab('received')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'received' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  style={activeTab === 'received' ? { backgroundColor: theme?.primary } : {}}
                >
                  Received
                </button>

                <button 
                  onClick={() => setActiveTab('sent')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'sent' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  style={activeTab === 'sent' ? { backgroundColor: theme?.primary } : {}}
                >
                  Sent
                </button>

                <button 
                  onClick={() => setActiveTab('mutuals')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-0.5 ${activeTab === 'mutuals' ? 'bg-primary text-black shadow-md' : 'text-muted-foreground/40 hover:text-foreground'}`}
                  style={activeTab === 'mutuals' ? { backgroundColor: theme?.primary } : {}}
                >
                  Mutuals <Lock className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {searchQuery.trim().length > 0 ? (
                /* 🔍 --- SEARCH RESULTS ACTIVE MODE --- */
                isSearching ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Searching Registry...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-50">
                    <p className="text-xs uppercase font-black tracking-widest">No matching agents found</p>
                  </div>
                ) : (
                  searchResults.map((user, idx) => {
                    const isRequested = sentTrack[user.hid];
                    let displayAvatar = user.avatar_url || (user.gender === 'female' ? IMAGE_2_FEMALE_DEFAULT : IMAGE_1_MALE_DEFAULT);

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
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
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono truncate">{user.rank || 'Agent'}</p>
                          </div>
                        </div>

                        {/* 🚀 Fix check: status dynamically updates to 'Requested' so user remains on screen */}
                        {isRequested ? (
                          <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider font-mono">
                            Requested
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleSendRequestFromSearch(user.hid)}
                            className="w-8 h-8 shrink-0 rounded-full bg-foreground/5 hover:bg-primary hover:text-black flex items-center justify-center transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )
              ) : (
                /* 🗂️ --- REGULAR TABS MODE --- */
                <>
                  {activeTab === 'suggestions' && <SuggestionsTab />}
                  {activeTab === 'received' && <RequestsTab />}
                  {activeTab === 'sent' && <SentRequestsTab />}
                  {activeTab === 'mutuals' && <MutualsTab />}
                </>
              )}
            </div>

          </motion.div>
          
        </>
      )}
    </AnimatePresence>
  );
}