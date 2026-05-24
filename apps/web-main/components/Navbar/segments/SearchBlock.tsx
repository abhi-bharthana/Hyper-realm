"use client";

import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface SearchBlockProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isLoading: boolean;
  results: any[];
  closeSearch: () => void;
  handleResultClick: (hid: string) => void;
}

export function SearchBlock({
  searchQuery,
  setSearchQuery,
  isLoading,
  results,
  closeSearch,
  handleResultClick
}: SearchBlockProps) {
  return (
    <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
      <Button variant="ghost" size="icon" onClick={closeSearch} className="rounded-full shrink-0">
        <X className="w-4 h-4" />
      </Button>
      
      <input 
        autoFocus
        className="w-full bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground"
        placeholder="Search citizens..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />}
      
      {/* Dropdown Result Matrix */}
      {searchQuery.trim().length >= 2 && (
        <div className="absolute top-16 left-0 w-full bg-background border border-border rounded-2xl shadow-xl p-2 z-[99] max-h-[300px] overflow-y-auto">
          {results.length > 0 ? (
            results.map((user: any) => (
              <div 
                key={user.hid} 
                onClick={() => handleResultClick(user.hid)}
                className="p-3 hover:bg-muted rounded-xl cursor-pointer text-sm font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] uppercase text-primary overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.nickname?.charAt(0) || 'U'
                    )}
                  </div>
                  <span>{user.nickname}</span>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {user.rank || 'Citizen'}
                </span>
              </div>
            ))
          ) : (
            !isLoading && <div className="p-4 text-xs text-center text-muted-foreground">No citizens found</div>
          )}
        </div>
      )}
    </div>
  );
}