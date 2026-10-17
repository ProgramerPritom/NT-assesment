"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Save, Loader2, AlertCircle } from "lucide-react";
import { Client, PaymentTerms } from "@/types/client";

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Client) => void;
}

const CATEGORIES: Client["category"][] = [
  "Tier-1 Hardware",
  "Semiconductor",
  "Peripherals",
  "Logistics & Freight",
  "OEM Manufacturer",
];

const PAYMENT_TERMS_OPTIONS: { label: string; value: PaymentTerms }[] = [
  { label: "Net 15 Days", value: "NET_15" },
  { label: "Net 30 Days (Standard)", value: "NET_30" },
  { label: "Net 60 Days (Enterprise)", value: "NET_60" },
  { label: "Immediate on Delivery", value: "IMMEDIATE" },
];

export default function EditClientModal({
  client,
  isOpen,
  onClose,
  onSave,
}: EditClientModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        category: client.category,
        taxNumber: client.taxNumber,
        email: client.email,
        phone: client.phone,
        creditLimit: client.creditLimit,
        paymentTerms: client.paymentTerms,
      });
      setError("");
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name?.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!formData.email?.trim() || !formData.email.includes("@")) {
      setError("Valid contact email is required.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);

    onSave({
      ...client,
      name: formData.name.trim(),
      category: formData.category || client.category,
      taxNumber: formData.taxNumber || client.taxNumber,
      email: formData.email.trim(),
      phone: formData.phone?.trim() || client.phone,
      creditLimit: formData.creditLimit ?? client.creditLimit,
      paymentTerms: formData.paymentTerms || client.paymentTerms,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Edit Vendor Profile</h2>
              <p className="text-xs text-slate-400 font-mono">{client.code}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Company Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as Client["category"],
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tax ID / EIN</label>
              <input
                type="text"
                required
                value={formData.taxNumber || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Contact Email</label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone</label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Credit Limit ($)</label>
              <input
                type="number"
                min={1000}
                step={5000}
                required
                value={formData.creditLimit || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creditLimit: Math.max(0, parseFloat(e.target.value) || 0),
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentTerms: e.target.value as PaymentTerms,
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {PAYMENT_TERMS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
