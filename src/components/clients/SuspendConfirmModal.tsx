"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert, Loader2 } from "lucide-react";
import { Client } from "@/types/client";

interface SuspendConfirmModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientId: string, reason: string) => void;
}

export default function SuspendConfirmModal({
  client,
  isOpen,
  onClose,
  onConfirm,
}: SuspendConfirmModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !client) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim() || reason.trim().length < 10) {
      setError("Please specify a concrete reason for suspension (at least 10 characters).");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setLoading(false);

    onConfirm(client.id, reason.trim());
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-2xl shadow-2xl p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Suspend Vendor Account</h2>
              <p className="text-xs text-rose-300 font-mono mt-0.5">{client.code} &bull; {client.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          Suspending this client will immediately freeze any pending purchase orders, disallow AI auto-restock allocations to this vendor, and flag their account across operations.
        </p>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirm} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Compliance Violation / Suspension Note <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Failed shipment SLA criteria twice, or pending forensic invoice review..."
              className="w-full p-3 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Freezing...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Suspension</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
