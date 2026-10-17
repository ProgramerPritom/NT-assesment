import React from "react";

interface PageSkeletonProps {
  pillCount?: number;
  rowCount?: number;
}

export default function PageSkeleton({ pillCount = 4, rowCount = 5 }: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-2">
          <div className="h-6 w-56 shimmer rounded-lg" />
          <div className="h-3.5 w-80 shimmer rounded" />
        </div>
        <div className="h-9 w-36 shimmer rounded-lg" />
      </div>

      {/* KPI Overview Pills Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: pillCount }).map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-2.5 w-20 shimmer rounded" />
              <div className="h-6 w-14 shimmer rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-lg shimmer" />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="h-9 flex-1 shimmer rounded-lg" />
        <div className="flex gap-2">
          <div className="h-9 w-32 shimmer rounded-lg" />
          <div className="h-9 w-48 shimmer rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="h-10 border-b border-slate-800 bg-slate-950/50 flex items-center px-4 gap-4">
          <div className="h-3 w-32 shimmer rounded" />
          <div className="h-3 w-24 shimmer rounded hidden sm:block" />
          <div className="h-3 w-28 shimmer rounded hidden md:block" />
          <div className="h-3 w-20 shimmer rounded hidden lg:block" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-800/70 p-1">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-44 shimmer rounded" />
                <div className="h-2.5 w-28 shimmer rounded" />
              </div>
              <div className="h-4 w-20 shimmer rounded hidden sm:block" />
              <div className="h-4 w-24 shimmer rounded hidden md:block" />
              <div className="h-5 w-20 shimmer rounded-full" />
              <div className="h-7 w-16 shimmer rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
