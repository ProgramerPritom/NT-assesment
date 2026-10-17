"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Fingerprint,
  Clock,
  User,
  Server,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { AuditLogItem } from "@/types/audit";
import { useToast } from "@/context/ToastContext";

interface AuditDetailModalProps {
  item: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditDetailModal({ item, isOpen, onClose }: AuditDetailModalProps) {
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !item) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.auditHash);
    setCopied(true);
    toast.info("Copied cryptographic SHA-256 hash to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-mono text-[11px] text-indigo-400 font-semibold block">
                {item.id} &bull; Immutable Ledger Record
              </span>
              <h2 className="text-base font-bold text-slate-100">{item.actionTitle}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Metadata Grid */}
        <div className="grid grid-cols-2 gap-3.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Actor / Authorized By
            </span>
            <span className="text-slate-100 font-semibold block">{item.performedBy.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">{item.performedBy.email}</span>
            <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
              {item.performedBy.role}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Timestamp & Host
            </span>
            <span className="text-slate-100 font-semibold block">{item.timestamp}</span>
            <span className="text-slate-400 font-mono text-[11px] block">IP: {item.ipAddress}</span>
            <span className="inline-block mt-1 text-[10px] font-medium text-emerald-400">
              Validated Cryptographic Node
            </span>
          </div>
        </div>

        {/* Target Entity Details */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Target Resource
          </span>
          <div className="flex items-center justify-between">
            <span className="text-slate-100 font-bold">{item.entityName}</span>
            <span className="font-mono text-indigo-400 text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-900">
              {item.entityId}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed pt-1 text-xs border-t border-slate-850">
            {item.details}
          </p>
        </div>

        {/* Cryptographic Hash Verification */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              SHA-256 Cryptographic Block Signature
            </span>
            <button
              onClick={handleCopyHash}
              className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
            {item.auditHash}
          </div>
          <p className="text-[10px] text-slate-500">
            Guaranteed tamper-proof. Each ledger entry is cryptographically linked to the previous transaction.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
