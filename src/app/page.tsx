"use client";

import React from "react";
import Link from "next/link";
import {
  Boxes,
  Building2,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function HomePage() {
  const toast = useToast();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-medium text-indigo-300 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phase 1 Verification — App Shell & Design System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            NexusWMS Operations Hub
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Enterprise warehouse automation platform powered by autonomous AI agents with
            deterministic human-in-the-loop risk governance.
          </p>
        </div>

        {/* Quick Toast Interactive Demo */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-slate-800/80">
          <span className="text-xs font-medium text-slate-400">Test Global Toast:</span>
          <button
            onClick={() => toast.success("Stock level updated successfully across bins.")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40 transition-colors"
          >
            Success Toast
          </button>
          <button
            onClick={() => toast.error("Action halted: Risk score exceeded threshold (78/100).")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 hover:bg-rose-900/40 transition-colors"
          >
            Risk Alert Toast
          </button>
          <button
            onClick={() => toast.info("New supplier registration awaiting tax verification.")}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 hover:bg-indigo-900/40 transition-colors"
          >
            Info Toast
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Core Modules Preview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <Link
            href="/inventory"
            className="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center justify-between">
              <span>Inventory & Ledger</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
              SKU catalog, real-time stock status, and double-entry movement ledger.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/clients"
            className="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center justify-between">
              <span>Client Activation</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
              Vendor verification lifecycle: Pending, Active, and Suspended states.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/governance"
            className="group p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center justify-between">
              <span>AI Governance Queue</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
              Review paused AI purchase orders and approve or decline with reason.
            </p>
          </Link>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Phase 1 Checklist Completed
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Responsive Layout & App Shell</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Industrial Slate Design Tokens</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Active Navigation Highlighting</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Global Toast Notification Context</span>
          </div>
        </div>
      </div>
    </div>
  );
}
