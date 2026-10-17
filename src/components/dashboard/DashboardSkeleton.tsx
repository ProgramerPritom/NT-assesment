import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-slate-900 border border-slate-800/80" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-800" />
            </div>
            <div className="h-7 w-32 bg-slate-800 rounded" />
            <div className="h-3 w-28 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-xl bg-slate-900 border border-slate-800/80" />
        <div className="h-80 rounded-xl bg-slate-900 border border-slate-800/80" />
      </div>
    </div>
  );
}
