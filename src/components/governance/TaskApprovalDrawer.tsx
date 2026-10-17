"use client";

import React, { useState } from "react";
import {
  X,
  BrainCircuit,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2,
  Package,
  DollarSign,
  Clock,
  Layers,
  Edit3,
  Check,
  Loader2,
} from "lucide-react";
import { AITask } from "@/types/governance";

interface TaskApprovalDrawerProps {
  task: AITask | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (taskId: string, approvedQuantity: number) => void;
  onReject: (taskId: string, reason: string) => void;
}

export default function TaskApprovalDrawer({
  task,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: TaskApprovalDrawerProps) {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [customQty, setCustomQty] = useState<number>(0);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Sync state when task opens
  React.useEffect(() => {
    if (task) {
      setCustomQty(task.recommendedQuantity);
      setIsEditingQty(false);
      setIsRejecting(false);
      setRejectReason("");
      setRejectError("");
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentQuantity = customQty > 0 ? customQty : task.recommendedQuantity;
  const currentTotalCost = currentQuantity * task.unitPrice;

  const handleApproveClick = async () => {
    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setActionLoading(false);
    onApprove(task.id, currentQuantity);
    onClose();
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejectError("");

    if (!rejectReason.trim() || rejectReason.trim().length < 8) {
      setRejectError("Please provide an explanatory audit reason for rejection (min 8 characters).");
      return;
    }

    setActionLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setActionLoading(false);
    onReject(task.id, rejectReason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold">
                  {task.id}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    task.status === "AWAITING_APPROVAL"
                      ? "bg-amber-950/80 border-amber-800/80 text-amber-300"
                      : task.status === "AUTO_EXECUTED"
                      ? "bg-sky-950/80 border-sky-800/80 text-sky-300"
                      : task.status === "APPROVED"
                      ? "bg-emerald-950/80 border-emerald-800/80 text-emerald-300"
                      : "bg-rose-950/80 border-rose-800/80 text-rose-300"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-100">{task.productName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                {task.sku} &bull; {task.category}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Top Scores Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* AI Confidence Meter */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Confidence
                  </span>
                  <span className="font-mono font-bold text-indigo-300">{task.aiConfidence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${task.aiConfidence}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Calculated by Gemini 1.5 Flash structured context validator.
                </p>
              </div>

              {/* Deterministic Blast Radius Risk Score */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  task.riskScore >= 60
                    ? "bg-rose-950/20 border-rose-800/60"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        task.riskScore >= 60 ? "text-rose-400" : "text-amber-400"
                      }`}
                    />
                    Risk Blast Radius
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      task.riskScore >= 60 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {task.riskScore} / 100
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      task.riskScore >= 60 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${task.riskScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {task.riskScore >= 60
                    ? "Threshold >= 60 exceeded. Halted for Manager Review."
                    : "Below threshold (<60). Permitted for auto-dispatch."}
                </p>
              </div>
            </div>

            {/* Proposed Purchase Order Payload */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  Proposed Order Payload
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Vendor
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Recommended Vendor</span>
                  <span className="text-slate-200 font-semibold">{task.supplierName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Unit Cost</span>
                  <span className="font-mono text-slate-200 font-medium">
                    ${task.unitPrice.toFixed(2)} / unit
                  </span>
                </div>

                {/* Quantity with editable field */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Order Batch</span>
                    {task.status === "AWAITING_APPROVAL" && (
                      <button
                        onClick={() => setIsEditingQty(!isEditingQty)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        {isEditingQty ? "Done" : "Edit"}
                      </button>
                    )}
                  </div>

                  {isEditingQty ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        min={1}
                        value={customQty}
                        onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2 py-1 text-xs font-mono text-slate-100 bg-slate-900 border border-indigo-500 rounded"
                      />
                      <span className="text-slate-400 text-xs">units</span>
                    </div>
                  ) : (
                    <span className="font-mono text-slate-100 font-bold text-sm">
                      {currentQuantity} units
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block">Total Financial Impact</span>
                  <span className="font-mono text-indigo-300 font-bold text-sm">
                    ${currentTotalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Live AI Reasoning Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>Deterministic AI Reasoning Trace</span>
              </h3>

              <div className="space-y-2.5 pl-2 border-l border-indigo-500/30">
                {task.reasoningTrace.map((step, idx) => (
                  <div key={idx} className="relative pl-5 group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[13px] top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-indigo-500/60 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rejection Note Display if rejected */}
            {task.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-1">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                  Rejection Reason (Audit Trail)
                </span>
                <p className="text-xs text-rose-200 italic">&quot;{task.rejectionReason}&quot;</p>
              </div>
            )}

            {/* Approval Info if approved */}
            {task.approvedBy && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1 text-xs">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                  Execution Authorization
                </span>
                <p className="text-slate-200">
                  Authorized by: <span className="font-medium">{task.approvedBy}</span>
                </p>
                {task.poReference && (
                  <p className="font-mono text-emerald-300 text-[11px]">PO Ref: {task.poReference}</p>
                )}
              </div>
            )}

            {/* Rejection Form Input */}
            {isRejecting && (
              <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl bg-slate-950 border border-rose-800/80 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-300">
                    Specify Reason for Rejection
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRejecting(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  rows={2}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Quantity too high for current quarter budget, or alternate supplier is preferred..."
                  className="w-full p-2.5 text-xs text-slate-100 bg-slate-900 border border-slate-700 rounded-lg placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                {rejectError && <p className="text-[11px] text-rose-400">{rejectError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/80 hover:bg-rose-900 rounded-lg transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {task.status === "AWAITING_APPROVAL" && !isRejecting && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-950 hover:text-white transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject with Reason</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApproveClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing PO...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Approve & Execute PO</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
