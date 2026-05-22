"use client";
import { Newspaper, ArrowUpRight } from "lucide-react";

const MOCK_NEWS = [
  "Quantum-Gravity research hits v1.2 milestone.",
  "Hyper-Transit announces new Delhi-Dehradun route.",
  "AI Ethics board approves Neural Link Interface.",
  "Global markets shift towards interaction-density models.",
  "New solar flare detected: Verdant nodes on standby.",
  "Hyper Fuel expands logistics to Southeast Asia.",
  "Software Paradigms: The rise of bio-mimetic AI.",
  "Server uptime reaches 99.99% across all nodes.",
  "Tech conference: Abhishek Yadav to present QGU framework.",
  "New encryption standards for Hyper ID Service."
];

export function NewsPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Global Feed</span>
      </div>
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {MOCK_NEWS.map((news, i) => (
          <div key={i} className="group cursor-pointer border-b border-border/50 pb-3 hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start gap-3">
              <span className="text-[10px] font-mono text-primary/50">0{i + 1}</span>
              <p className="text-xs font-medium leading-relaxed group-hover:text-foreground transition-colors">
                {news}
              </p>
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}