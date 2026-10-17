"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Crown,
  Briefcase,
  HardHat,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  MoreVertical,
  Clock,
  Building,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { UserItem, UserRole } from "@/types/user";
import { MOCK_USERS } from "@/data/mockData";
import AddUserModal from "@/components/users/AddUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeactivateConfirmDialog from "@/components/users/DeactivateConfirmDialog";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function UsersPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<UserItem | null>(null);

  // Statistics
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const managerCount = users.filter((u) => u.role === "MANAGER").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesDept = departmentFilter === "All" || u.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [users, searchQuery, roleFilter, departmentFilter]);

  const departments = ["All", ...Array.from(new Set(users.map((u) => u.department)))];

  // Handlers
  const handleAddUser = (newUser: UserItem) => {
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Provisioned ${newUser.name} with ${newUser.role} permissions.`);
  };

  const handleEditSave = (updated: UserItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    toast.success(`Updated permissions and profile for ${updated.name}.`);
  };

  const handleInlineRoleChange = (userId: string, newRole: UserRole) => {
    const target = users.find((u) => u.id === userId);
    if (target?.email === "admin@nexus.com" && newRole !== "ADMIN") {
      toast.warning("Cannot demote primary root administrator account.");
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.info(`Updated role for ${target?.name} to ${newRole}.`);
  };

  const handleToggleStatus = (user: UserItem) => {
    if (user.email === "admin@nexus.com") {
      toast.warning("Cannot deactivate primary root administrator.");
      return;
    }

    if (user.status === "ACTIVE") {
      setDeactivatingUser(user);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: "ACTIVE" } : u))
      );
      toast.success(`Reactivated ${user.name}'s account.`);
    }
  };

  const handleConfirmDeactivation = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "INACTIVE" } : u))
    );
    toast.info(`Deactivated access for ${target?.name}.`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return {
          icon: Crown,
          label: "Admin",
          badgeClass: "bg-indigo-950/80 border-indigo-800 text-indigo-300",
        };
      case "MANAGER":
        return {
          icon: Briefcase,
          label: "Manager",
          badgeClass: "bg-sky-950/80 border-sky-800 text-sky-300",
        };
      case "STAFF":
        return {
          icon: HardHat,
          label: "Staff",
          badgeClass: "bg-slate-800/80 border-slate-700 text-slate-300",
        };
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
              <Users className="w-6 h-6 text-indigo-400" />
              <span>User & Team Access Control</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Role-Based Access Control (RBAC), team shifts, department assignments, and security audit status.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shadow-indigo-600/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Members
            </span>
            <p className="text-xl font-bold text-slate-100">{totalCount}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Admins & Leaders
            </span>
            <p className="text-xl font-bold text-indigo-400">{adminCount}</p>
          </div>
          <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 rounded-lg text-indigo-400">
            <Crown className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Ops Managers
            </span>
            <p className="text-xl font-bold text-sky-400">{managerCount}</p>
          </div>
          <div className="p-2 bg-sky-950/60 border border-sky-800/60 rounded-lg text-sky-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Floor Technicians
            </span>
            <p className="text-xl font-bold text-slate-300">{staffCount}</p>
          </div>
          <div className="p-2 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-300">
            <HardHat className="w-4 h-4" />
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
            placeholder="Search by team member name, email, or department..."
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
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d === "All" ? "All Departments" : d}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "ADMIN", label: "Admins" },
                { id: "MANAGER", label: "Managers" },
                { id: "STAFF", label: "Staff" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  roleFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Member Data Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">Team Member</th>
                <th className="px-4 py-3.5">Department & Shift</th>
                <th className="px-4 py-3.5">Assigned Role (RBAC)</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Last Terminal Login</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No team members match your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search filters or add a new user</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setRoleFilter("ALL");
                        setDepartmentFilter("All");
                      }}
                      className="mt-3 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg transition-colors"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleConfig = getRoleBadge(u.role);
                  const RoleIcon = roleConfig.icon;
                  const initials = u.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2);

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors group">
                      {/* Member Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors block text-sm">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Shift */}
                      <td className="px-4 py-3.5">
                        <div className="text-slate-200 font-medium">{u.department}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{u.shift}</span>
                        </div>
                      </td>

                      {/* Role with Instant Switcher */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleConfig.badgeClass}`}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            <span>{roleConfig.label}</span>
                          </span>

                          {/* Quick inline role toggle */}
                          <select
                            value={u.role}
                            onChange={(e) => handleInlineRoleChange(u.id, e.target.value as UserRole)}
                            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            title="Quick switch role"
                          >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {u.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 border border-rose-800/60 text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                        {u.lastLogin}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Deactivate */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              u.status === "ACTIVE"
                                ? "text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-800 hover:bg-rose-950/30"
                                : "text-emerald-400 border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-950/80"
                            }`}
                            title={u.status === "ACTIVE" ? "Deactivate account" : "Reactivate account"}
                          >
                            {u.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                          </button>

                          {/* Edit Modal Trigger */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Edit user profile"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditSave}
      />

      <DeactivateConfirmDialog
        user={deactivatingUser}
        isOpen={!!deactivatingUser}
        onClose={() => setDeactivatingUser(null)}
        onConfirm={handleConfirmDeactivation}
      />
    </div>
  );
}
