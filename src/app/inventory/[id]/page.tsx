"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  MapPin,
  Building2,
  DollarSign,
  TrendingDown,
  BrainCircuit,
  ArrowRightLeft,
  Edit2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types/inventory";
import StockProgressBar, { getStockStatus } from "@/components/inventory/StockProgressBar";
import WarehouseBinCard from "@/components/inventory/WarehouseBinCard";
import MovementTimeline, { LedgerItem } from "@/components/inventory/MovementTimeline";
import QuickStockModal from "@/components/inventory/QuickStockModal";
import EditProductModal from "@/components/inventory/EditProductModal";
import { StockMovement } from "@/types/dashboard";

const CATALOG_DATABASE: Record<string, Product> = {
  p1: {
    id: "p1",
    sku: "SKU-CRU-1TB",
    name: "Crucial 1TB NVMe PCIe 4.0 SSD",
    category: "Storage",
    unitPrice: 85,
    currentStock: 4,
    minSafetyStock: 30,
    warehouseBin: "Zone-A1",
    supplierId: "sup-1",
    supplierName: "Silicon Logistics",
    createdAt: "2026-09-10",
  },
  p2: {
    id: "p2",
    sku: "SKU-KNG-32G",
    name: "Kingston Fury Beast 32GB DDR5 6000MHz",
    category: "Memory",
    unitPrice: 110,
    currentStock: 8,
    minSafetyStock: 25,
    warehouseBin: "Zone-A2",
    supplierId: "sup-2",
    supplierName: "Global Cloud Hardware",
    createdAt: "2026-09-12",
  },
  p3: {
    id: "p3",
    sku: "SKU-COR-750",
    name: "Corsair RM750e 750W 80+ Gold Fully Modular",
    category: "Power Supply",
    unitPrice: 99,
    currentStock: 45,
    minSafetyStock: 20,
    warehouseBin: "Zone-B2",
    supplierId: "sup-1",
    supplierName: "Silicon Logistics",
    createdAt: "2026-09-15",
  },
};

const INITIAL_LEDGER: Record<string, LedgerItem[]> = {
  p1: [
    {
      id: "led-1",
      type: "STOCK_OUT",
      quantity: 26,
      balanceAfter: 4,
      performedBy: "Alex Vance",
      reason: "Bulk fulfillment dispatch order #8399",
      timestamp: "Today, 14:15 PM",
      referenceNumber: "DISP-8399",
    },
    {
      id: "led-2",
      type: "STOCK_OUT",
      quantity: 15,
      balanceAfter: 30,
      performedBy: "Floor Staff Member",
      reason: "Client pickup request #8280",
      timestamp: "Yesterday, 16:30 PM",
      referenceNumber: "PICK-8280",
    },
    {
      id: "led-3",
      type: "ADJUSTMENT",
      quantity: 5,
      balanceAfter: 45,
      performedBy: "Alex Vance",
      reason: "Physical cycle count discrepancy correction",
      timestamp: "Oct 14, 2026 — 10:00 AM",
      referenceNumber: "ADJ-1022",
    },
    {
      id: "led-4",
      type: "STOCK_IN",
      quantity: 50,
      balanceAfter: 50,
      performedBy: "Alex Vance",
      reason: "Initial supplier purchase order intake PO-0941",
      timestamp: "Sep 10, 2026 — 09:30 AM",
      referenceNumber: "PO-0941",
    },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const id = (params?.id as string) || "p1";
  const initialProduct = CATALOG_DATABASE[id] || CATALOG_DATABASE["p1"];

  const [product, setProduct] = useState<Product>(initialProduct);
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER[id] || INITIAL_LEDGER["p1"]);
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const status = getStockStatus(product.currentStock, product.minSafetyStock);
  const totalBinValue = product.currentStock * product.unitPrice;

  const handleStockMovement = (movement: StockMovement) => {
    const delta = movement.type === "STOCK_IN" ? movement.quantity : -movement.quantity;
    const newStock = Math.max(0, product.currentStock + delta);

    setProduct((prev) => ({ ...prev, currentStock: newStock }));

    const newLedgerItem: LedgerItem = {
      id: "led-" + Date.now(),
      type: movement.type,
      quantity: movement.quantity,
      balanceAfter: newStock,
      performedBy: movement.performedBy,
      reason: movement.reason,
      timestamp: "Just now",
      referenceNumber: "MOV-" + Math.floor(1000 + Math.random() * 9000),
    };

    setLedger((prev) => [newLedgerItem, ...prev]);
    toast.success(
      `Committed ${movement.type === "STOCK_IN" ? "Intake" : "Dispatch"} of ${movement.quantity} units for ${product.sku}.`
    );
  };

  const handleEditSave = (updated: Product) => {
    setProduct(updated);
    toast.success(`Product SKU ${updated.sku} settings updated.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Product Catalog</span>
        </Link>

        <span className="text-xs text-slate-400 font-mono">Catalog SKU ID: {product.id}</span>
      </div>

      {/* Main Product Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 font-bold">
              {product.sku}
            </span>

            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              {product.category}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                status === "CRITICAL"
                  ? "bg-rose-950/80 border-rose-800/80 text-rose-300"
                  : status === "WARNING"
                  ? "bg-amber-950/80 border-amber-800/80 text-amber-300"
                  : "bg-emerald-950/80 border-emerald-800/80 text-emerald-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === "CRITICAL"
                    ? "bg-rose-400 animate-ping"
                    : status === "WARNING"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              {status === "CRITICAL"
                ? "Critical Depletion Alert"
                : status === "WARNING"
                ? "Low Stock Threshold"
                : "Safe Stock Level"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
            {product.name}
          </h1>

          <p className="text-xs text-slate-400 flex items-center gap-3">
            <span>Primary Supplier: <strong className="text-slate-200">{product.supplierName}</strong></span>
            <span>&bull;</span>
            <span>Registered: <strong className="text-slate-200">{product.createdAt}</strong></span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsQuickStockOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/30"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Record Movement</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Info</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Stock Level & Safety */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Physical Stock in Bin
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-50 font-mono">
              {product.currentStock}{" "}
              <span className="text-xs font-normal text-slate-400">units</span>
            </span>
            <span className="text-xs text-slate-400">
              Min Buffer: <strong className="text-slate-200">{product.minSafetyStock}</strong>
            </span>
          </div>
          <StockProgressBar current={product.currentStock} safety={product.minSafetyStock} />
        </div>

        {/* Card 2: Unit Price */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Unit Wholesale Price
          </span>
          <div className="text-2xl font-bold text-slate-50 font-mono">
            ${product.unitPrice.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400">Wholesale cost per verified vendor terms</p>
        </div>

        {/* Card 3: Total Asset Value */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm space-y-1">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Asset Valuation
          </span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${totalBinValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400">Based on active bin inventory volume</p>
        </div>
      </div>

      {/* Main Grid: Left Timeline Ledger, Right Placement & AI Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Timeline Ledger */}
        <div className="lg:col-span-2">
          <MovementTimeline ledger={ledger} />
        </div>

        {/* Right Column: Warehouse Bin & Vendor Specs */}
        <div className="space-y-6">
          <WarehouseBinCard
            binLocation={product.warehouseBin}
            category={product.category}
            currentStock={product.currentStock}
          />

          {/* Supplier Terms Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">Supplier Agreement</h3>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Active Partner
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Vendor:</span>
                <span className="font-semibold text-slate-100">{product.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                <span>Standard Lead Time:</span>
                <span className="font-mono text-slate-200">3 Business Days</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span>Payment Terms:</span>
                <span className="text-slate-200">Net 30 &bull; Verified EIN</span>
              </div>
            </div>
          </div>

          {/* AI Restock Recommendation Alert (shown if stock is below safe threshold) */}
          {status !== "HEALTHY" && (
            <div className="rounded-xl border border-amber-800/60 bg-gradient-to-b from-amber-950/20 to-slate-900 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <BrainCircuit className="w-4 h-4" />
                  <h3 className="text-sm font-semibold text-slate-100">AI Restock Analysis</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold">
                  Gemini Flash
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Stock is <strong className="text-amber-400">{product.minSafetyStock - product.currentStock} units below</strong> safety
                buffer. AI restock agent recommends issuing a Purchase Order to{" "}
                <strong className="text-slate-200">{product.supplierName}</strong> for{" "}
                <strong className="text-slate-100">50 units</strong> ($4,250.00).
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Confidence: 94%</span>
                <Link
                  href="/governance"
                  className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Review in HITL Queue &rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stock Modal */}
      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        initialProduct={product}
        products={[product]}
        onSuccess={handleStockMovement}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
        onSave={handleEditSave}
      />
    </div>
  );
}
