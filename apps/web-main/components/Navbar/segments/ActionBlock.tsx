"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Search, MessageSquareText, User, Settings } from "lucide-react";

interface ActionBlockProps {
  userName: string | null;
  toggleDiscover: () => void;
  toggleSettings: () => void;
  setIsSearchOpen: (val: boolean) => void;
  handleChatToggle: () => void;
}

export function ActionBlock({
  userName,
  toggleDiscover,
  toggleSettings,
  setIsSearchOpen,
  handleChatToggle
}: ActionBlockProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {/* Discover Action */}
      <Button variant="ghost" size="icon" onClick={toggleDiscover} className="rounded-full w-9 h-9">
        <Compass className="w-4 h-4 text-primary" />
      </Button>
      
      {/* Open Search Trigger */}
      <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="rounded-full w-9 h-9">
        <Search className="w-4 h-4" />
      </Button>
      
      {/* Secure Terminal Chat Control Toggle */}
      <Button variant="ghost" size="icon" onClick={handleChatToggle} className="rounded-full w-9 h-9">
        <MessageSquareText className="w-4 h-4" />
      </Button>

      {/* User Session Info */}
      <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-all">
        <User className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase hidden md:block max-w-[80px] truncate">
          {userName || "Guest"}
        </span>
      </Link>

      {/* System Settings Action */}
      <Button variant="ghost" size="icon" onClick={toggleSettings} className="rounded-full w-9 h-9">
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}