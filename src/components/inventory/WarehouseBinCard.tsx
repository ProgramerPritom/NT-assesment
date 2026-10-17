import React from "react";
import { MapPin, Thermometer, ShieldCheck, Box, Layers } from "lucide-react";

interface WarehouseBinCardProps {
  binLocation: string;
  category: string;
  currentStock: number;
}

export default function WarehouseBinCard({
  binLocation,
  category,
  currentStock,
}: WarehouseBinCardProps) {
  // Derive realistic shelf and rack coordinates from bin code
  const zone = binLocation.split("-")[0] || "Zone-A";
  const rack = `Rack R-${binLocation.replace(/[^0-9]/g, "").padStart(2, "0") || "01"}`;
  const shelf = `Shelf S-${parseInt(binLocation.slice(-1)) || 2}`;
  const binSlot = `Slot #${(currentStock % 20) + 1}`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-100">Warehouse Bin Placement</h2>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-semibold">
          {binLocation}
        </span>
      </div>

      {/* Grid Coordinates Visualizer */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <span className="block text-[10px] uppercase font-semibold text-slate-500">Sector</span>
          <span className="font-mono text-sm font-bold text-slate-200">{zone}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <span className="block text-[10px] uppercase font-semibold text-slate-500">Rack / Bay</span>
          <span className="font-mono text-sm font-bold text-slate-200">{rack}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <span className="block text-[10px] uppercase font-semibold text-slate-500">Shelf & Slot</span>
          <span className="font-mono text-sm font-bold text-slate-200">{shelf}</span>
        </div>
      </div>

      {/* Storage Bin Utilization Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Bin Volume Allocation</span>
          <span className="font-mono text-slate-300">
            {Math.min(95, Math.max(15, currentStock * 2))}% Utilized
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(95, Math.max(15, currentStock * 2))}%` }}
          />
        </div>
      </div>

      {/* Environmental & Handling Conditions */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          <span>Climate: 21°C &bull; 40% RH</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ESD Protected Bin</span>
        </div>
      </div>
    </div>
  );
}
