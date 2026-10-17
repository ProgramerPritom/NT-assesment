"use client";

import React, { useState } from "react";
import { UserX, X, AlertTriangle, Loader2 } from "lucide-react";
import { UserItem } from "@/types/user";

interface DeactivateConfirmDialogProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export default function DeactivateConfirmDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
}: DeactivateConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const isSelf = user.email.toLowerCase() === "admin@nexus.com" || user.name === "Alex Vance";

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
    onConfirm(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
          <UserX className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-100">
            {user.status === "ACTIVE" ? "Deactivate Team Member?" : "Delete User Record?"}
          </h3>
          <p className="text-xs text-slate-300 font-mono mt-1">{user.name} &bull; {user.email}</p>
        </div>

        {isSelf ? (
          <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-xl text-left text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-snug">
              System Safeguard: You cannot deactivate or delete your own primary Administrator session account.
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed text-left">
            Deactivating will revoke access to the warehouse operations dashboard immediately. Shift logs and historical ledger movements will remain intact for audit compliance.
          </p>
        )}

        <div className="pt-3 border-t border-slate-800 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-lg transition-colors"
          >
            {isSelf ? "Dismiss" : "Cancel"}
          </button>

          {!isSelf && (
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Deactivation</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
