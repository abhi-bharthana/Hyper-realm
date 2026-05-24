"use client";

import { useChatStore } from "@/store/useChatStore";
import { ChatChannels } from "../ChatChannels";
import { MessageStream } from "../MessageStream";

export function CompactLayout() {
  const { activeReceiverId } = useChatStore();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {!activeReceiverId ? (
        <div className="flex-1 overflow-hidden p-3">
          <div className="pb-2 border-b border-white/5 mb-3 px-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Direct Nodes</p>
          </div>
          <ChatChannels />
        </div>
      ) : (
        <MessageStream />
      )}
    </div>
  );
}