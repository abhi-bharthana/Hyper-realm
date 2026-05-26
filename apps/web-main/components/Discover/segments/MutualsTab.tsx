"use client";

import { Lock } from "lucide-react";

export function MutualsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-40 opacity-50 gap-3">
      <Lock className="w-6 h-6" />
      <p className="text-xs uppercase font-black tracking-widest text-center">
        Mutuals Module <br/> <span className="text-[9px]">Locked</span>
      </p>
    </div>
  );
}