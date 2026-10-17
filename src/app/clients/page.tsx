"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Client, ClientStatus } from "@/types/client";
import { MOCK_CLIENTS } from "@/data/mockData";
import RegisterClientModal from "@/components/clients/RegisterClientModal";
import SuspendConfirmModal from "@/components/clients/SuspendConfirmModal";
import EditClientModal from "@/components/clients/EditClientModal";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function ClientsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ClientStatus>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [suspendingClient, setSuspendingClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  // Statistics
  const totalCount = clients.length;
  const pendingCount = clients.filter((c) => c.status === "PENDING_VERIFICATION").length;
  const activeCount = clients.filter((c) => c.status === "ACTIVE").length;
  const suspendedCount = clients.filter((c) => c.status === "SUSPENDED").length;
  const totalCreditAllocated = clients.reduce((acc, c) => acc + c.creditLimit, 0);

  // Filtering
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.taxNumber.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [clients, searchQuery, statusFilter, selectedCategory]);

  const categories = ["All", ...Array.from(new Set(clients.map((c) => c.category)))];

  // Action Handlers
  const handleRegisterClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    toast.success(`Registered ${newClient.name} (${newClient.code}) for compliance audit.`);
  };

  const handleVerifyAndActivate = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: "ACTIVE", suspensionReason: undefined } : c))
    );
    toast.success(`Compliance verified! ${client?.name || "Vendor"} is now ACTIVE.`);
  };

  const handleSuspendConfirm = (clientId: string, reason: string) => {
    const client = clients.find((c) => c.id === clientId);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, status: "SUSPENDED", suspensionReason: reason } : c
      )
    );
    toast.error(`Vendor ${client?.name} suspended: ${reason}`);
  };

  const handleReinstate = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: "ACTIVE", suspensionReason: undefined } : c))
    );
    toast.success(`Reinstated ${client?.name} to ACTIVE status with approved credit line.`);
  };

  const handleEditSave = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    toast.success(`Updated profile for ${updated.name}.`);
  };

  const handleDeleteClient = (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    if (target && target.activeOrdersCount > 0) {
      toast.error(`Cannot delete ${target.name} while active purchase orders exist.`);
      setDeletingClientId(null);
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    toast.info(`Removed ${target?.name || "Client"} from registry.`);
    setDeletingClientId(null);
  };

  if (loading) {
    return <PageSkeleton pillCount={4} rowCount={5} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-indigo-400" />
              <span>Client & Supplier Activation Hub</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Vendor onboarding, tax verification workflow, credit line allocations, and status lifecycle.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Supplier</span>
        </button>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Accounts
            </span>
            <p className="text-xl font-bold text-slate-100">{totalCount}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Active & Verified
            </span>
            <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
          </div>
          <div className="p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Pending Audit
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
              Suspended
            </span>
            <p className="text-xl font-bold text-rose-400">{suspendedCount}</p>
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
            placeholder="Search by vendor name, code (VND-), tax EIN, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dropdowns & Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setStatusFilter("PENDING_VERIFICATION")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                statusFilter === "PENDING_VERIFICATION"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Active ({activeCount})
            </button>

            <button
              onClick={() => setStatusFilter("SUSPENDED")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                statusFilter === "SUSPENDED"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Suspended ({suspendedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Client Directory Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Vendor & Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Tax EIN & Contact</th>
                <th className="px-4 py-3.5">Payment Terms</th>
                <th className="px-4 py-3.5">Credit Line</th>
                <th className="px-4 py-3.5">Status & Compliance</th>
                <th className="px-4 py-3.5 text-right">Lifecycle Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No client or supplier records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing active search filters or onboard a new supplier.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setStatusFilter("ALL");
                      }}
                      className="mt-3 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-850/40 transition-colors group">
                      {/* Name & Code */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors text-sm">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-indigo-400 font-medium">
                            {c.code}
                          </span>
                          <span className="text-[10px] text-slate-500">&bull; Added {c.createdAt}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          {c.category}
                        </span>
                      </td>

                      {/* Tax ID & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-xs text-slate-200">{c.taxNumber}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[170px]">{c.email}</span>
                        </div>
                      </td>

                      {/* Payment Terms */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-slate-300">
                          {c.paymentTerms.replace("_", " ")}
                        </span>
                      </td>

                      {/* Credit Line */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-100">
                          ${c.creditLimit.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.activeOrdersCount} Active PO{c.activeOrdersCount !== 1 ? "s" : ""}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {c.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active & Verified
                          </span>
                        )}

                        {c.status === "PENDING_VERIFICATION" && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-800/60 text-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              Pending Verification
                            </span>
                          </div>
                        )}

                        {c.status === "SUSPENDED" && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-800/60 text-rose-400">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Suspended
                            </span>
                            {c.suspensionReason && (
                              <p className="text-[10px] text-rose-300/80 mt-1 max-w-[200px] line-clamp-1 italic">
                                &quot;{c.suspensionReason}&quot;
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Lifecycle Action Buttons */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pending: Verify & Activate */}
                          {c.status === "PENDING_VERIFICATION" && (
                            <button
                              onClick={() => handleVerifyAndActivate(c.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm"
                              title="Verify Tax ID & Activate Vendor"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify & Activate</span>
                            </button>
                          )}

                          {/* Active: Suspend Button */}
                          {c.status === "ACTIVE" && (
                            <button
                              onClick={() => setSuspendingClient(c)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-950 hover:border-rose-800 transition-colors"
                              title="Suspend client due to compliance breach"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Suspended: Reinstate Button */}
                          {c.status === "SUSPENDED" && (
                            <button
                              onClick={() => handleReinstate(c.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-800 hover:bg-indigo-900 transition-colors"
                              title="Reinstate to Active"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reinstate</span>
                            </button>
                          )}

                          {/* Edit Modal Trigger */}
                          <button
                            onClick={() => setEditingClient(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Edit vendor profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingClientId(c.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Remove vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Delete Vendor Record?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove this vendor? This action is recorded in compliance audit trails.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingClientId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(deletingClientId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RegisterClientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegisterClient}
      />

      <SuspendConfirmModal
        client={suspendingClient}
        isOpen={!!suspendingClient}
        onClose={() => setSuspendingClient(null)}
        onConfirm={handleSuspendConfirm}
      />

      <EditClientModal
        client={editingClient}
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}
