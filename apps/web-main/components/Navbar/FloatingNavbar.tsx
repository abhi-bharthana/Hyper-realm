"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { useChatStore } from "@/store/useChatStore";
// 1. Imports update karo
import { api, API_URLS } from "@/lib/api";

import { BrandBlock } from "./segments/BrandBlock";
import { SearchBlock } from "./segments/SearchBlock";
import { ActionBlock } from "./segments/ActionBlock";

export function FloatingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { theme, toggleSettings, toggleDiscover } = useThemeStore(); 
  const { mode, setMode, openChat, activeReceiverId } = useChatStore();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const isLight = theme?.id === 'light-verdant' || theme?.type === 'light';
  const hiddenPages = ["/login", "/onboarding"];
  
  const searchRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const localUsername = typeof window !== "undefined" ? localStorage.getItem("hyper_username") : null;
    if (localUsername) {
      setUserName(localUsername);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("hyper_id_token") : null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.username || payload.nickname || null);
      } else {
        setUserName(null);
      }
    } catch (e) {
      console.error("Token parsing failed.", e);
      setUserName(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/v1/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: abortControllerRef.current?.signal
        });
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        setResults(data || []); 
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Search API failed:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = useCallback((hid: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setResults([]);
    router.push(`/dashboard/profile?hid=${hid}`);
  }, [router]);

  const handleChatToggle = useCallback(() => {
    mode === 'hidden' 
      ? (openChat(activeReceiverId || ""), setMode('floating')) 
      : setMode('hidden');
  }, [mode, openChat, activeReceiverId, setMode]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSearch();
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen, closeSearch]);

  if (hiddenPages.includes(pathname)) return null;

  return (
    <nav 
      ref={searchRef}
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between gap-4 px-5 py-2 rounded-full border backdrop-blur-xl transition-all duration-500 ease-in-out
      ${isLight ? 'bg-white/70 border-slate-200 shadow-lg text-slate-900' : 'bg-black/40 border-white/10 shadow-[0_0_30px_rgba(var(--primary),0.05)] text-white'} 
      ${isSearchOpen ? 'md:w-[460px] w-[calc(100vw-32px)]' : 'md:w-[580px] w-[calc(100vw-32px)]'}`}
    >
      {isSearchOpen ? (
        <SearchBlock 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          results={results}
          closeSearch={closeSearch}
          handleResultClick={handleResultClick}
        />
      ) : (
        <>
          <BrandBlock isLight={isLight} />
          
          <ActionBlock 
            userName={userName}
            toggleDiscover={toggleDiscover}
            toggleSettings={toggleSettings}
            setIsSearchOpen={setIsSearchOpen}
            handleChatToggle={handleChatToggle}
          />
        </>
      )}
    </nav>
  );
}