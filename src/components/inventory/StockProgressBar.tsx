import React from "react";
import { StockStatus } from "@/types/inventory";

interface StockProgressBarProps {
  current: number;
  safety: number;
}

export function getStockStatus(current: number, safety: number): StockStatus {
  if (current <= safety * 0.35 || current <= 5) return "CRITICAL";
  if (current <= safety) return "WARNING";
  return "HEALTHY";
}

export default function StockProgressBar({ current, safety }: StockProgressBarProps) {
  const status = getStockStatus(current, safety);
  const ratio = safety > 0 ? (current / safety) * 100 : 100;
  const barWidth = Math.min(100, Math.max(5, ratio));

  const config = {
    HEALTHY: {
      barColor: "bg-emerald-500",
      badgeColor: "bg-emerald-950/60 border-emerald-800/60 text-emerald-400",
      label: "Safe Buffer",
      dot: "bg-emerald-400",
    },
    WARNING: {
      barColor: "bg-amber-500",
      badgeColor: "bg-amber-950/60 border-amber-800/60 text-amber-400",
      label: "Low Stock",
      dot: "bg-amber-400",
    },
    CRITICAL: {
      barColor: "bg-rose-500",
      badgeColor: "bg-rose-950/60 border-rose-800/60 text-rose-400",
      label: "Critical Depletion",
      dot: "bg-rose-400 animate-pulse",
    },
  }[status];

  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">
          {current} <span className="text-[11px] font-normal text-slate-400">/ {safety}</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.badgeColor}`}
        >
          <span className={`w-1 h-1 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${config.barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
