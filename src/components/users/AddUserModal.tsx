"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2, AlertCircle, Wand2, Shield, Crown, Briefcase, HardHat } from "lucide-react";
import { UserItem, UserFormData, UserRole } from "@/types/user";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: UserItem) => void;
}

const DEPARTMENTS: UserItem["department"][] = [
  "Inventory Operations",
  "Inbound Receiving",
  "Fulfillment & Dispatch",
  "Executive & Compliance",
];

const SHIFTS: UserItem["shift"][] = [
  "Morning (08:00 - 16:00)",
  "Evening (16:00 - 00:00)",
  "Full Day Operations",
];

export default function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "STAFF",
    department: "Inventory Operations",
    shift: "Morning (08:00 - 16:00)",
    tempPassword: "password123",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, tempPassword: pwd }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("User full name is required.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid workplace email address is required.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));

      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: "ACTIVE",
        department: formData.department,
        shift: formData.shift,
        lastLogin: "Never (Awaiting First Login)",
        createdAt: new Date().toISOString().split("T")[0],
      };

      onAdd(newUser);
      onClose();
      setFormData({
        name: "",
        email: "",
        role: "STAFF",
        department: "Inventory Operations",
        shift: "Morning (08:00 - 16:00)",
        tempPassword: "password123",
      });
    } catch {
      setError("Failed to create user account. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Add Team Member</h2>
              <p className="text-xs text-slate-400">
                Grant warehouse system access with role-based permissions (RBAC).
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jordan Cooper"
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Workplace Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="jordan.c@nexus.com"
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">System Role Permission</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "ADMIN",
                  title: "Admin",
                  desc: "Full access & users",
                  icon: Crown,
                  activeColor: "border-indigo-500 bg-indigo-600/15 text-indigo-300",
                },
                {
                  id: "MANAGER",
                  title: "Manager",
                  desc: "HITL approvals & POs",
                  icon: Briefcase,
                  activeColor: "border-sky-500 bg-sky-600/15 text-sky-300",
                },
                {
                  id: "STAFF",
                  title: "Staff",
                  desc: "Catalog & movements",
                  icon: HardHat,
                  activeColor: "border-slate-500 bg-slate-700/30 text-slate-200",
                },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: r.id as UserRole }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? r.activeColor
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{r.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Assigned Department</label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value as UserItem["department"],
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-slate-100">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Work Shift Schedule</label>
              <select
                value={formData.shift}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shift: e.target.value as UserItem["shift"],
                  }))
                }
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {SHIFTS.map((shift) => (
                  <option key={shift} value={shift} className="bg-slate-900 text-slate-100">
                    {shift}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temporary Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Temporary Password</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              value={formData.tempPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, tempPassword: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg font-mono focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              The user will be prompted to reset their password upon initial terminal authentication.
            </p>
          </div>

          {/* Actions */}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
