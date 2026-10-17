import React from "react";

export default function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-36 shimmer rounded" />
        <div className="h-4 w-28 shimmer rounded" />
      </div>

      {/* Main Header Card Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-24 shimmer rounded-md" />
            <div className="h-6 w-20 shimmer rounded-md" />
            <div className="h-6 w-28 shimmer rounded-full" />
          </div>
          <div className="h-7 w-72 shimmer rounded-lg" />
          <div className="h-3 w-48 shimmer rounded" />
        </div>

        <div className="flex gap-3">
          <div className="h-10 w-28 shimmer rounded-lg" />
          <div className="h-10 w-32 shimmer rounded-lg" />
        </div>
      </div>

      {/* 2-Column Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="h-4 w-32 shimmer rounded" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 shimmer rounded-lg" />
            <div className="h-16 shimmer rounded-lg" />
            <div className="h-16 shimmer rounded-lg" />
          </div>
          <div className="h-2 w-full shimmer rounded-full" />
        </div>

        <div className="lg:col-span-2 h-96 rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-48 shimmer rounded" />
            <div className="h-7 w-32 shimmer rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
