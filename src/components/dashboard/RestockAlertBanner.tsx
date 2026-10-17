import React from "react";
import Link from "next/link";
import { AlertTriangle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { CriticalItem } from "@/types/dashboard";

interface RestockAlertBannerProps {
  items: CriticalItem[];
  isScanning: boolean;
  onRunScan: () => void;
}

export default function RestockAlertBanner({
  items,
  isScanning,
  onRunScan,
}: RestockAlertBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-rose-900/70 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/20 p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left message */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL STOCK DEPLETION DETECTED ({items.length} SKUs)</span>
          </div>

          <p className="text-sm text-slate-300">
            Key items have fallen below their safety threshold. Autonomous restocking scan is
            recommended to prevent fulfillment delays.
          </p>

          {/* Quick list of critical items */}
          <div className="pt-2 flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-900/90 border border-rose-800/60 text-slate-200"
              >
                <span className="font-mono text-rose-400">{item.sku}</span>
                <span>{item.name}:</span>
                <span className="font-semibold text-rose-300">{item.currentStock} left</span>
                <span className="text-[11px] text-slate-400">(Min: {item.minSafetyStock})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Analyzing Stockouts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Run AI Restock Scan</span>
              </>
            )}
          </button>

          <Link
            href="/inventory"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
