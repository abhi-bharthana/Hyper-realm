import Link from "next/link";
import { Monitor, ArrowUpRight } from "lucide-react";

export function OSSystemMode() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">System Environments</h3>
        <p className="text-sm text-muted-foreground">
          Switch between Web Dashboard and the core Hyper-Realm Web OS.
        </p>
      </div>

      <div className="border border-border/60 rounded-xl p-5 bg-muted/10 flex items-center justify-between hover:border-primary/50 transition-all group">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-105 transition-transform">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Hyper OS Desktop</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Boot into the full windowed environment with built-in Dev Tools, Terminal, and Task Manager.
            </p>
          </div>
        </div>

        {/* Next.js Link se direct navigation */}
        <Link 
          href="/os" 
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          Boot System
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}