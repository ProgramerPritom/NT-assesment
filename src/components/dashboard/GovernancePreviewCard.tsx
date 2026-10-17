import React from "react";
import Link from "next/link";
import { BrainCircuit, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

interface PendingTaskPreview {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  estimatedCost: number;
  confidenceScore: number;
  riskScore: number;
  supplier: string;
}

interface GovernancePreviewCardProps {
  pendingTask?: PendingTaskPreview;
}

export default function GovernancePreviewCard({ pendingTask }: GovernancePreviewCardProps) {
  if (!pendingTask) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <BrainCircuit className="w-4 h-4" />
          <h2 className="text-sm font-semibold text-slate-100">AI Restock Governance</h2>
        </div>
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-200">All AI Workflows Clear</p>
          <p className="text-[11px] text-slate-400 mt-1">
            No high-risk restocking proposals currently awaiting human review.
          </p>
        </div>
      </div>
    );
  }

  const isHighRisk = pendingTask.riskScore >= 60;

  return (
    <div className="rounded-xl border border-amber-900/60 bg-gradient-to-b from-amber-950/20 to-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400">
          <BrainCircuit className="w-4 h-4" />
          <h2 className="text-sm font-semibold text-slate-100">Pending AI Approval</h2>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
          <ShieldAlert className="w-3 h-3" />
          Blast Radius: {pendingTask.riskScore}/100
        </span>
      </div>

      <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-mono text-indigo-400">{pendingTask.sku}</span>
            <p className="text-xs font-semibold text-slate-200">{pendingTask.productName}</p>
          </div>
          <span className="text-xs font-semibold text-slate-100">
            ${pendingTask.estimatedCost.toLocaleString()}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span>Supplier: {pendingTask.supplier}</span>
          <span>Order: {pendingTask.quantity} units</span>
        </div>

        {/* Risk meter */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Risk Score Impact</span>
            <span className={isHighRisk ? "text-rose-400 font-semibold" : "text-amber-400"}>
              {isHighRisk ? "High Risk (Halted)" : "Medium Risk"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isHighRisk ? "bg-rose-500" : "bg-amber-500"
              }`}
              style={{ width: `${pendingTask.riskScore}%` }}
            />
          </div>
        </div>
      </div>

      <Link
        href="/governance"
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
      >
        <span>Review in Approval Queue</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
