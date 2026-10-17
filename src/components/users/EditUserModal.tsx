"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Save, Loader2, Crown, Briefcase, HardHat } from "lucide-react";
import { UserItem, UserRole, UserStatus } from "@/types/user";

interface EditUserModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserItem) => void;
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

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<UserItem>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        shift: user.shift,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);

    onSave({
      ...user,
      name: formData.name?.trim() || user.name,
      email: formData.email?.trim() || user.email,
      role: formData.role || user.role,
      status: formData.status || user.status,
      department: formData.department || user.department,
      shift: formData.shift || user.shift,
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
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Edit Member Permissions</h2>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Role Privilege Level</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "ADMIN", title: "Admin", icon: Crown, color: "border-indigo-500 bg-indigo-600/20 text-indigo-200" },
                { id: "MANAGER", title: "Manager", icon: Briefcase, color: "border-sky-500 bg-sky-600/20 text-sky-200" },
                { id: "STAFF", title: "Staff", icon: HardHat, color: "border-slate-500 bg-slate-700/30 text-slate-200" },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = formData.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: r.id as UserRole }))}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      isSelected
                        ? r.color
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Department</label>
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
              <label className="text-xs font-medium text-slate-300">Shift</label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Account Status</label>
            <div className="flex gap-3">
              {(["ACTIVE", "INACTIVE"] as UserStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: st }))}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    formData.status === st
                      ? st === "ACTIVE"
                        ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                        : "bg-rose-950/80 border-rose-700 text-rose-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  {st === "ACTIVE" ? "Active (Granted Terminal Access)" : "Inactive (Deactivated)"}
                </button>
              ))}
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
