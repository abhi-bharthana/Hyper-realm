// components/Profile/FollowButton.tsx
"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

export function FollowButton({ receiverId }: { receiverId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFollow = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsFollowing(!isFollowing);
      setLoading(false);
    }, 400);
  };

  return (
    <button
      onClick={toggleFollow}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
        isFollowing 
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700" 
          : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
      }`}
    >
      {loading ? "..." : isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
    </button>
  );
}