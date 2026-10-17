"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Clock,
  User,
  FileCheck,
  Filter,
} from "lucide-react";
import { MovementType } from "@/types/dashboard";

export interface LedgerItem {
  id: string;
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  performedBy: string;
  reason: string;
  timestamp: string;
  referenceNumber: string;
}

interface MovementTimelineProps {
  ledger: LedgerItem[];
}

export default function MovementTimeline({ ledger }: MovementTimelineProps) {
  const [filterType, setFilterType] = useState<"ALL" | MovementType>("ALL");

  const filtered = filterType === "ALL" ? ledger : ledger.filter((item) => item.type === filterType);

  const getStyle = (type: MovementType) => {
    switch (type) {
      case "STOCK_IN":
        return {
          icon: ArrowDownLeft,
          label: "Stock In",
          badge: "bg-emerald-950/60 border-emerald-800/60 text-emerald-400",
          dot: "bg-emerald-500",
          qtySign: "+",
          qtyColor: "text-emerald-400",
        };
      case "STOCK_OUT":
        return {
          icon: ArrowUpRight,
          label: "Stock Out",
          badge: "bg-sky-950/60 border-sky-800/60 text-sky-400",
          dot: "bg-sky-500",
          qtySign: "-",
          qtyColor: "text-sky-400",
        };
      case "ADJUSTMENT":
        return {
          icon: RefreshCw,
          label: "Adjustment",
          badge: "bg-amber-950/60 border-amber-800/60 text-amber-400",
          dot: "bg-amber-500",
          qtySign: "±",
          qtyColor: "text-amber-400",
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Double-Entry Movement Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable chronological audit trail of all warehouse transfers
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "STOCK_IN", label: "In" },
              { id: "STOCK_OUT", label: "Out" },
              { id: "ADJUSTMENT", label: "Adjust" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No movement history for selected filter.</p>
        ) : (
          filtered.map((item) => {
            const meta = getStyle(item.type);
            const Icon = meta.icon;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node Dot */}
                <span
                  className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${meta.dot} group-hover:scale-125 transition-transform`}
                />

                <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700/80 transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${meta.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>

                      <span className="font-mono text-xs text-slate-400">
                        Ref: {item.referenceNumber}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-200 font-medium">{item.reason}</p>

                    <div className="text-right">
                      <span className={`font-mono text-sm font-bold ${meta.qtyColor}`}>
                        {meta.qtySign}
                        {item.quantity} units
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        Bin Balance:{" "}
                        <strong className="text-slate-200 font-mono">{item.balanceAfter}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-850 text-[11px] text-slate-400">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Logged by:</span>
                    <span className="text-slate-300 font-medium">{item.performedBy}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
