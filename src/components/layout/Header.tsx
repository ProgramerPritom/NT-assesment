"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Bell, Shield, User, LogOut, ChevronDown } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<"ADMIN" | "MANAGER" | "STAFF">("ADMIN");
  const toast = useToast();

  const handleRoleSwitch = (role: "ADMIN" | "MANAGER" | "STAFF") => {
    setCurrentRole(role);
    setDropdownOpen(false);
    toast.info(`Switched active view role to: ${role}`);
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Mobile menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Main Warehouse — North Sector A</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Quick notification button */}
        <button
          onClick={() => toast.info("No unread urgent alerts in inventory queue.")}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        {/* User profile with role badge */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-semibold text-xs">
              {currentRole[0]}
            </div>

            <div className="hidden md:block">
              <span className="block text-xs font-semibold text-slate-200 leading-tight">Alex Vance</span>
              <span className="block text-[10px] text-slate-400 font-medium">{currentRole}</span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User profile & demo role switcher dropdown */}
          {dropdownOpen && (
            <>
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-30"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-medium text-slate-100">Alex Vance</p>
                  <p className="text-[11px] text-slate-400">alex.vance@nexus.com</p>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Switch Demo Role
                  </p>
                  {(["ADMIN", "MANAGER", "STAFF"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSwitch(r)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentRole === r
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        {r}
                      </span>
                      {currentRole === r && <span className="text-[10px]">Active</span>}
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
