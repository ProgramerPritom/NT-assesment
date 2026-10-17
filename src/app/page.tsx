"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Building2,
  BrainCircuit,
  DollarSign,
  AlertTriangle,
  Plus,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RestockAlertBanner from "@/components/dashboard/RestockAlertBanner";
import GovernancePreviewCard from "@/components/dashboard/GovernancePreviewCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import QuickStockModal from "@/components/inventory/QuickStockModal";
import { StockMovement, CriticalItem, DashboardMetrics } from "@/types/dashboard";

const INITIAL_METRICS: DashboardMetrics = {
  totalInventoryValue: 148250,
  inventoryGrowth: 8.4,
  criticalStockCount: 2,
  activeSuppliersCount: 4,
  pendingApprovalsCount: 1,
};

const INITIAL_CRITICAL_ITEMS: CriticalItem[] = [
  {
    id: "p1",
    name: "Crucial 1TB NVMe SSD",
    sku: "SKU-CRU-1TB",
    currentStock: 4,
    minSafetyStock: 30,
    unitPrice: 85,
    supplier: "Silicon Logistics",
  },
  {
    id: "p2",
    name: "Kingston Fury 32GB RAM",
    sku: "SKU-KNG-32G",
    currentStock: 8,
    minSafetyStock: 25,
    unitPrice: 110,
    supplier: "Global Cloud Hardware",
  },
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-1",
    productName: "Logitech MX Master 3S",
    sku: "SKU-LOG-MX3",
    type: "STOCK_IN",
    quantity: 40,
    reason: "Bulk vendor shipment intake (PO-1049)",
    performedBy: "Alex Vance",
    timestamp: "18 mins ago",
  },
  {
    id: "mov-2",
    productName: "Corsair RM750e PSU",
    sku: "SKU-COR-750",
    type: "STOCK_OUT",
    quantity: 12,
    reason: "Outbound enterprise fulfillment #8410",
    performedBy: "Staff Member",
    timestamp: "45 mins ago",
  },
  {
    id: "mov-3",
    productName: "Crucial 1TB NVMe SSD",
    sku: "SKU-CRU-1TB",
    type: "STOCK_OUT",
    quantity: 26,
    reason: "Client dispatch order #8399",
    performedBy: "Alex Vance",
    timestamp: "2 hours ago",
  },
  {
    id: "mov-4",
    productName: "Kingston Fury 32GB RAM",
    sku: "SKU-KNG-32G",
    type: "ADJUSTMENT",
    quantity: 2,
    reason: "Routine shelf audit discrepancy correction",
    performedBy: "Alex Vance",
    timestamp: "5 hours ago",
  },
  {
    id: "mov-5",
    productName: "Samsung 990 PRO 2TB",
    sku: "SKU-SAM-2TB",
    type: "STOCK_IN",
    quantity: 50,
    reason: "Restock PO-1038 received",
    performedBy: "Staff Member",
    timestamp: "Yesterday",
  },
];

const PENDING_AI_TASK = {
  id: "ai-task-1",
  sku: "SKU-CRU-1TB",
  productName: "Crucial 1TB NVMe SSD",
  quantity: 50,
  estimatedCost: 4250,
  confidenceScore: 94,
  riskScore: 78,
  supplier: "Silicon Logistics",
};

export default function DashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>(INITIAL_CRITICAL_ITEMS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleRunAiScan = async () => {
    setIsScanning(true);
    toast.info("Gemini AI Engine: Scanning warehouse SKUs for stockout hazards...");

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setIsScanning(false);
    toast.warning(
      "AI Restock Scan Complete: 2 critical items identified. Drafted purchase proposal routed to Governance Queue (Blast Radius: 78/100)."
    );
  };

  const handleStockMovementCreated = (newMovement: StockMovement) => {
    setMovements((prev) => [newMovement, ...prev.slice(0, 4)]);

    if (newMovement.type === "STOCK_IN") {
      setMetrics((prev) => ({
        ...prev,
        totalInventoryValue: prev.totalInventoryValue + newMovement.quantity * 80,
      }));
      toast.success(
        `Recorded intake of ${newMovement.quantity} units for ${newMovement.sku}.`
      );
    } else {
      setMetrics((prev) => ({
        ...prev,
        totalInventoryValue: Math.max(0, prev.totalInventoryValue - newMovement.quantity * 80),
      }));
      toast.info(
        `Recorded dispatch of ${newMovement.quantity} units for ${newMovement.sku}.`
      );
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
              Operations Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inventory levels, autonomous restocking status, and ledger transactions.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setStockModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Entry</span>
          </button>

          <button
            onClick={handleRunAiScan}
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">AI Restock Scan</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inventory Value"
          value={`$${metrics.totalInventoryValue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: `+${metrics.inventoryGrowth}% this month`, isPositive: true }}
          variant="default"
          href="/inventory"
        />

        <MetricCard
          title="Critical Low Stock"
          value={`${metrics.criticalStockCount} Items`}
          subtitle="Below safety buffer"
          icon={AlertTriangle}
          pulseBadge="Urgent"
          variant="critical"
          href="/inventory"
        />

        <MetricCard
          title="Active Suppliers"
          value={`${metrics.activeSuppliersCount} Verified`}
          subtitle="100% compliant terms"
          icon={Building2}
          variant="success"
          href="/clients"
        />

        <MetricCard
          title="Pending AI Approvals"
          value={`${metrics.pendingApprovalsCount} High Risk`}
          subtitle="Paused for manager review"
          icon={BrainCircuit}
          variant="warning"
          href="/governance"
        />
      </div>

      {/* Critical Stock Warning Banner with 1-click AI restock scan */}
      <RestockAlertBanner
        items={criticalItems}
        isScanning={isScanning}
        onRunScan={handleRunAiScan}
      />

      {/* Main Grid: Recent Activity Feed + Governance & Warehouse Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns for Double-Entry Stock Movement Feed */}
        <div className="lg:col-span-2">
          <RecentActivity movements={movements} />
        </div>

        {/* Right: 1 Column for AI Governance and Warehouse Bin Health */}
        <div className="space-y-6">
          <GovernancePreviewCard pendingTask={PENDING_AI_TASK} />

          {/* Quick Bin Capacity Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">Warehouse Bin Health</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">92% Operational</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Sector A (High Density NVMe & Flash)</span>
                  <span className="font-mono text-slate-400">84% Capacity</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[84%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Sector B (Core Hardware & Power)</span>
                  <span className="font-mono text-slate-400">62% Capacity</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[62%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cycle counts verified
              </span>
              <span className="font-mono text-[11px]">Zone North-01</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stock Movement Modal */}
      <QuickStockModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSuccess={handleStockMovementCreated}
      />
    </div>
  );
}
