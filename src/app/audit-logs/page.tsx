"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  BrainCircuit,
  Building2,
  Users,
  Download,
  Fingerprint,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { AuditLogItem, AuditEntityCategory } from "@/types/audit";
import { MOCK_AUDIT_LOGS } from "@/data/mockData";
import AuditDetailModal from "@/components/audit/AuditDetailModal";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function AuditLogsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | AuditEntityCategory>("ALL");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "NORMAL" | "WARNING" | "CRITICAL">("ALL");
  const [inspectingItem, setInspectingItem] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Stats
  const totalEvents = logs.length;
  const stockEvents = logs.filter((l) => l.category === "STOCK").length;
  const governanceEvents = logs.filter((l) => l.category === "GOVERNANCE").length;
  const clientEvents = logs.filter((l) => l.category === "CLIENT").length;
  const criticalEvents = logs.filter((l) => l.severity === "CRITICAL").length;

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.actionTitle.toLowerCase().includes(q) ||
        l.entityName.toLowerCase().includes(q) ||
        l.performedBy.name.toLowerCase().includes(q) ||
        l.performedBy.email.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.auditHash.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "ALL" || l.category === selectedCategory;
      const matchesSev = severityFilter === "ALL" || l.severity === severityFilter;

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [logs, searchQuery, selectedCategory, severityFilter]);

  const handleExportCsv = () => {
    toast.info("Generating certified compliance audit export bundle...");
    setTimeout(() => {
      toast.success("Compliance Audit Log exported: nexus_audit_manifest_2026.csv downloaded.");
    }, 800);
  };

  const getActionIcon = (actionType: AuditLogItem["actionType"]) => {
    switch (actionType) {
      case "STOCK_IN":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case "STOCK_OUT":
        return <ArrowUpRight className="w-4 h-4 text-sky-400" />;
      case "STOCK_ADJUSTMENT":
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case "AI_TASK_APPROVED":
      case "AI_TASK_REJECTED":
        return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
      case "CLIENT_ACTIVATED":
      case "CLIENT_SUSPENDED":
      case "CLIENT_REGISTERED":
        return <Building2 className="w-4 h-4 text-teal-400" />;
      case "USER_ROLE_CHANGED":
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return <PageSkeleton pillCount={4} rowCount={6} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-400" />
              <span>Compliance & Immutable Audit Ledger</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tamper-Proof
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological forensic trail of all inventory dispatches, supplier verifications, and AI governance authorizations.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Manifest</span>
        </button>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Audit Entries
            </span>
            <p className="text-xl font-bold text-slate-100">{totalEvents}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
            <Fingerprint className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Stock Operations
            </span>
            <p className="text-xl font-bold text-emerald-400">{stockEvents}</p>
          </div>
          <div className="p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              AI HITL Decisions
            </span>
            <p className="text-xl font-bold text-indigo-400">{governanceEvents}</p>
          </div>
          <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 rounded-lg text-indigo-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Security Incidents
            </span>
            <p className="text-xl font-bold text-rose-400">{criticalEvents}</p>
          </div>
          <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-lg text-rose-400">
            <ShieldAlert className="w-4 h-4" />
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
            placeholder="Search by action title, target item, actor name, or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
          {(
            [
              { id: "ALL", label: "All Logs" },
              { id: "STOCK", label: "Stock Ledger" },
              { id: "GOVERNANCE", label: "AI Governance" },
              { id: "CLIENT", label: "Vendor Compliance" },
              { id: "SECURITY", label: "Security & RBAC" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedCategory === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Data Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Timestamp & ID</th>
                <th className="px-4 py-3.5">Operation Type</th>
                <th className="px-4 py-3.5">Target Resource</th>
                <th className="px-4 py-3.5">Authorized Actor</th>
                <th className="px-4 py-3.5">Audit Note</th>
                <th className="px-4 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No audit records match your filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing active search or category filters</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("ALL");
                        setSeverityFilter("ALL");
                      }}
                      className="mt-3 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingItem(item)}
                    >
                      {/* Timestamp & ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-indigo-400 font-semibold block">
                          {item.id}
                        </span>
                        <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.timestamp}
                        </span>
                      </td>

                      {/* Operation Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-slate-950 border border-slate-800">
                            {getActionIcon(item.actionType)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">
                              {item.actionTitle}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {item.actionType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target Entity */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-100">{item.entityName}</div>
                        <span className="font-mono text-[11px] text-slate-400">{item.entityId}</span>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{item.performedBy.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.performedBy.email}
                        </div>
                      </td>

                      {/* Description & Impact */}
                      <td className="px-4 py-3.5">
                        <p className="text-slate-300 line-clamp-2 max-w-sm leading-relaxed">
                          {item.details}
                        </p>
                      </td>

                      {/* Inspect Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-xs"
                          title="Inspect cryptographic proof"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector */}
      <AuditDetailModal
        item={inspectingItem}
        isOpen={!!inspectingItem}
        onClose={() => setInspectingItem(null)}
      />
    </div>
  );
}
