"use client";

import React, { useState } from "react";
import { X, Building2, Plus, Loader2, AlertCircle, Wand2 } from "lucide-react";
import { Client, ClientFormData, PaymentTerms } from "@/types/client";

interface RegisterClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (client: Client) => void;
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

export default function RegisterClientModal({
  isOpen,
  onClose,
  onRegister,
}: RegisterClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    category: "Tier-1 Hardware",
    taxNumber: "",
    email: "",
    phone: "",
    creditLimit: 100000,
    paymentTerms: "NET_30",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerateTaxNumber = () => {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(10000 + Math.random() * 90000);
    setFormData((prev) => ({ ...prev, taxNumber: `EIN-${p1}-${p2}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Company / Vendor name is required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please provide a valid company contact email.");
      return;
    }

    if (!formData.taxNumber.trim()) {
      setError("Tax Identification Number (EIN/BIN) is required for compliance verification.");
      return;
    }

    if (formData.creditLimit < 1000) {
      setError("Credit limit must be at least $1,000.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const codePrefix = formData.name
        .replace(/[^A-Za-z]/g, "")
        .substring(0, 3)
        .toUpperCase();
      const randomCode = Math.floor(10 + Math.random() * 90);

      const newClient: Client = {
        id: `sup-${Date.now()}`,
        name: formData.name.trim(),
        code: `VND-${codePrefix || "VEN"}-${randomCode}`,
        category: formData.category,
        taxNumber: formData.taxNumber.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || "+1 (555) 000-0000",
        creditLimit: formData.creditLimit,
        paymentTerms: formData.paymentTerms,
        status: "PENDING_VERIFICATION",
        activeOrdersCount: 0,
        ratingScore: 90,
        createdAt: new Date().toISOString().split("T")[0],
      };

      onRegister(newClient);
      onClose();
      setFormData({
        name: "",
        category: "Tier-1 Hardware",
        taxNumber: "",
        email: "",
        phone: "",
        creditLimit: 100000,
        paymentTerms: "NET_30",
      });
    } catch {
      setError("Failed to register supplier. Please review the inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Register New Supplier / Client</h2>
              <p className="text-xs text-slate-400">
                Initial status will be set to Pending Verification for compliance audit.
              </p>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Legal Company Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Apex Semiconductor Labs Inc."
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Industry Category</label>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Tax ID / EIN <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTaxNumber}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                required
                value={formData.taxNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, taxNumber: e.target.value }))}
                placeholder="EIN-902-11488"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Contact Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="compliance@company.com"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Approved Credit Limit ($)</label>
              <input
                type="number"
                min={1000}
                step={5000}
                required
                value={formData.creditLimit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    creditLimit: Math.max(0, parseFloat(e.target.value) || 0),
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Register for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
