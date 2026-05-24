// components/Profile/ProfileStats.tsx
import { Users, Database, Zap } from "lucide-react";

interface StatsProps {
  friendsCount: number;
  postsCount: number;
  likesCount?: number;
}

export function ProfileStats({ friendsCount, postsCount, likesCount = 0 }: StatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-800/50">
      <StatBox icon={<Users className="w-4 h-4" />} label="Network Nodes" value={friendsCount} />
      <StatBox icon={<Database className="w-4 h-4" />} label="Data Packets" value={postsCount} />
      <StatBox icon={<Zap className="w-4 h-4" />} label="Energy Level" value={likesCount} />
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="relative overflow-hidden bg-black/40 border border-zinc-800/60 p-4 rounded-xl flex flex-col gap-3 group hover:border-lime-500/40 hover:bg-lime-500/5 transition-all duration-300 cursor-default">
      {/* Top Left corner accent */}
      <div className="absolute top-0 left-0 w-8 h-[1px] bg-lime-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-[1px] h-8 bg-lime-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-2 text-zinc-500 group-hover:text-lime-400/80 transition-colors text-[10px] font-mono uppercase tracking-[0.2em]">
        {icon}
        {label}
      </div>
      
      <div className="text-3xl font-mono font-medium text-zinc-100 group-hover:text-white transition-colors">
        {value.toString().padStart(3, '0')} {/* 0 ko 000 jaisa dikhane ke liye */}
      </div>
    </div>
  );
}