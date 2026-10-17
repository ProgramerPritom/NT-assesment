import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ArrowRight, Activity } from "lucide-react";
import { StockMovement, MovementType } from "@/types/dashboard";

interface RecentActivityProps {
  movements: StockMovement[];
}

export default function RecentActivity({ movements }: RecentActivityProps) {
  const getBadge = (type: MovementType) => {
    switch (type) {
      case "STOCK_IN":
        return {
          label: "Stock In",
          icon: ArrowDownLeft,
          classes: "bg-emerald-950/60 border-emerald-800/60 text-emerald-400",
          qtyColor: "text-emerald-400",
          sign: "+",
        };
      case "STOCK_OUT":
        return {
          label: "Stock Out",
          icon: ArrowUpRight,
          classes: "bg-sky-950/60 border-sky-800/60 text-sky-400",
          qtyColor: "text-sky-400",
          sign: "-",
        };
      case "ADJUSTMENT":
        return {
          label: "Adjustment",
          icon: RefreshCw,
          classes: "bg-amber-950/60 border-amber-800/60 text-amber-400",
          qtyColor: "text-amber-400",
          sign: "±",
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm sm:text-base font-semibold text-slate-100">
            Recent Stock Movements
          </h2>
        </div>

        <Link
          href="/inventory"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
        >
          <span>Full Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product / SKU</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">By</th>
              <th className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {movements.map((m) => {
              const badge = getBadge(m.type);
              const Icon = badge.icon;

              return (
                <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.classes}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-200">{m.productName}</div>
                    <div className="font-mono text-[11px] text-slate-400">{m.sku}</div>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap font-mono font-semibold">
                    <span className={badge.qtyColor}>
                      {badge.sign}
                      {m.quantity}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                    {m.reason}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {m.performedBy}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap text-slate-400">
                    {m.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
