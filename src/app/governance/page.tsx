"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Package,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { AITask, TaskStatus } from "@/types/governance";
import { MOCK_GOVERNANCE_TASKS } from "@/data/mockData";
import TaskApprovalDrawer from "@/components/governance/TaskApprovalDrawer";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function GovernancePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AITask[]>(MOCK_GOVERNANCE_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "HIGH_RISK" | "AUTO_EXECUTED" | "ALL">("PENDING");
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Statistics
  const pendingCount = tasks.filter((t) => t.status === "AWAITING_APPROVAL").length;
  const autoExecutedCount = tasks.filter((t) => t.status === "AUTO_EXECUTED").length;
  const approvedCount = tasks.filter((t) => t.status === "APPROVED").length;
  const highRiskCount = tasks.filter((t) => t.riskScore >= 60).length;

  const avgConfidence = Math.round(
    tasks.reduce((acc, t) => acc + t.aiConfidence, 0) / (tasks.length || 1)
  );

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.productName.toLowerCase().includes(q) ||
        t.sku.toLowerCase().includes(q) ||
        t.supplierName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeTab === "PENDING") {
        matchesTab = t.status === "AWAITING_APPROVAL";
      } else if (activeTab === "HIGH_RISK") {
        matchesTab = t.riskScore >= 60;
      } else if (activeTab === "AUTO_EXECUTED") {
        matchesTab = t.status === "AUTO_EXECUTED";
      }

      return matchesSearch && matchesTab;
    });
  }, [tasks, searchQuery, activeTab]);

  // Handlers
  const handleApprove = (taskId: string, approvedQuantity: number) => {
    const target = tasks.find((t) => t.id === taskId);
    const poCode = `PO-${Math.floor(1050 + Math.random() * 8900)}`;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "APPROVED",
            modifiedQuantity: approvedQuantity,
            estimatedCost: approvedQuantity * t.unitPrice,
            approvedBy: "Alex Vance (Ops Admin)",
            executedAt: "Just now",
            poReference: poCode,
          };
        }
        return t;
      })
    );

    toast.success(
      `Approved ${target?.productName}: Generated ${poCode} (${approvedQuantity} units dispatched).`
    );
  };

  const handleReject = (taskId: string, reason: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "REJECTED",
              rejectionReason: reason,
              executedAt: "Rejected",
            }
          : t
      )
    );
    toast.error(`Rejected restock proposal for ${target?.sku}: "${reason}"`);
  };

  if (loading) {
    return <PageSkeleton pillCount={4} rowCount={5} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
              <span>AI Governance & Human-in-the-Loop Queue</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              HITL Policy Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic blast-radius risk evaluation. Autonomous decisions halted when Risk Score &ge; 60.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Blast Radius Threshold: <strong className="text-slate-200">Score &ge; 60</strong></span>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Awaiting Review
            </span>
            <p className="text-xl font-bold text-amber-400">{pendingCount}</p>
          </div>
          <div className="p-2 bg-amber-950/60 border border-amber-800/60 rounded-lg text-amber-400">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              High Risk Halts
            </span>
            <p className="text-xl font-bold text-rose-400">{highRiskCount}</p>
          </div>
          <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-lg text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Auto-Executed
            </span>
            <p className="text-xl font-bold text-sky-400">{autoExecutedCount}</p>
          </div>
          <div className="p-2 bg-sky-950/60 border border-sky-800/60 rounded-lg text-sky-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Avg AI Confidence
            </span>
            <p className="text-xl font-bold text-indigo-400">{avgConfidence}%</p>
          </div>
          <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 rounded-lg text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, product name, vendor, or task ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-200 border border-amber-800">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("HIGH_RISK")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "HIGH_RISK"
                ? "bg-rose-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            High Risk (&ge;60)
          </button>

          <button
            onClick={() => setActiveTab("AUTO_EXECUTED")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "AUTO_EXECUTED"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Auto-Executed
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "ALL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* Governance Queue Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Task ID & SKU</th>
                <th className="px-4 py-3.5">Stock Depletion</th>
                <th className="px-4 py-3.5">Proposed Reorder Batch</th>
                <th className="px-4 py-3.5">Recommended Vendor</th>
                <th className="px-4 py-3.5">AI Confidence</th>
                <th className="px-4 py-3.5">Blast Radius Risk</th>
                <th className="px-4 py-3.5 text-right">HITL Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <BrainCircuit className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No tasks in this governance queue</p>
                    <p className="text-xs text-slate-500 mt-1">All high-risk autonomous alerts are addressed</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isHighRisk = t.riskScore >= 60;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-850/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTask(t)}
                    >
                      {/* Task ID and Product */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] text-indigo-400 font-bold block">
                          {t.id}
                        </span>
                        <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors block text-sm">
                          {t.productName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{t.sku}</span>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-xs">
                          <span className="text-rose-400 font-bold">{t.currentStock}</span>
                          <span className="text-slate-500"> / {t.minSafetyStock} safe buffer</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {Math.round((t.currentStock / t.minSafetyStock) * 100)}% buffer left
                        </span>
                      </td>

                      {/* Proposed Batch & Value */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-slate-100 font-bold">
                          {t.recommendedQuantity} units
                        </div>
                        <div className="font-mono text-xs text-indigo-300 font-medium">
                          ${t.estimatedCost.toLocaleString()} total
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-200 font-medium block">{t.supplierName}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Compliant Tier-1
                        </span>
                      </td>

                      {/* AI Confidence */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${t.aiConfidence}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-200">
                            {t.aiConfidence}%
                          </span>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            isHighRisk
                              ? "bg-rose-950/80 border-rose-800 text-rose-300"
                              : "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                          }`}
                        >
                          {isHighRisk && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                          <span>{t.riskScore} / 100</span>
                          <span className="text-[10px] font-normal uppercase">
                            ({isHighRisk ? "High Risk" : "Low Risk"})
                          </span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {t.status === "AWAITING_APPROVAL" ? (
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
                          >
                            <span>Inspect & Decide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTask(t)}
                            className="text-xs text-slate-400 hover:text-slate-200 font-medium px-2 py-1"
                          >
                            View Decision
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Approval Drawer */}
      <TaskApprovalDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
