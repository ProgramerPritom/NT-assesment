"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { MovementType, StockMovement } from "@/types/dashboard";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
}

interface QuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMovement: StockMovement) => void;
  initialProduct?: ProductOption | null;
  products?: ProductOption[];
}

const DEFAULT_PRODUCTS: ProductOption[] = [
  { id: "p1", name: "Crucial 1TB NVMe SSD", sku: "SKU-CRU-1TB", currentStock: 4 },
  { id: "p2", name: "Kingston Fury 32GB RAM", sku: "SKU-KNG-32G", currentStock: 8 },
  { id: "p3", name: "Corsair RM750e PSU", sku: "SKU-COR-750", currentStock: 45 },
  { id: "p4", name: "Logitech MX Master 3S", sku: "SKU-LOG-MX3", currentStock: 112 },
];

export default function QuickStockModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
  products = DEFAULT_PRODUCTS,
}: QuickStockModalProps) {
  const productList = products.length > 0 ? products : DEFAULT_PRODUCTS;
  const [selectedSku, setSelectedSku] = useState(initialProduct?.sku || productList[0]?.sku || "");
  const [type, setType] = useState<MovementType>("STOCK_IN");
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialProduct) {
      setSelectedSku(initialProduct.sku);
    } else if (productList.length > 0) {
      setSelectedSku(productList[0].sku);
    }
    setError("");
  }, [initialProduct, productList]);

  if (!isOpen) return null;

  const selectedProduct = productList.find((p) => p.sku === selectedSku);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (type === "STOCK_OUT" && selectedProduct && quantity > selectedProduct.currentStock) {
      setError(
        `Insufficient stock! Requested ${quantity} pcs, but only ${selectedProduct.currentStock} pcs available in bin.`
      );
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 350));

    const newMovement: StockMovement = {
      id: "mov-" + Date.now(),
      productName: selectedProduct?.name || "Inventory Item",
      sku: selectedSku,
      type,
      quantity,
      reason: reason || (type === "STOCK_IN" ? "Supplier shipment intake" : "Dispatched to fulfillment"),
      performedBy: "Alex Vance",
      timestamp: "Just now",
    };

    onSuccess(newMovement);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Quick Stock Movement</h2>
            <p className="text-xs text-slate-400">Record an instant warehouse intake or dispatch</p>
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
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Movement Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Operation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("STOCK_IN")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  type === "STOCK_IN"
                    ? "bg-emerald-950/60 border-emerald-600 text-emerald-300 shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>Stock In (Intake)</span>
              </button>

              <button
                type="button"
                onClick={() => setType("STOCK_OUT")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  type === "STOCK_OUT"
                    ? "bg-sky-950/60 border-sky-600 text-sky-300 shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-sky-400" />
                <span>Stock Out (Dispatch)</span>
              </button>
            </div>
          </div>

          {/* Product SKU Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Target Product</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {productList.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({p.sku}) — {p.currentStock} pcs in bin
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">Quantity (Units)</label>
              {selectedProduct && (
                <span className="text-[11px] text-slate-400">
                  Current Bin Stock:{" "}
                  <span className="text-slate-200 font-semibold">
                    {selectedProduct.currentStock} pcs
                  </span>
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Audited Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Audited Reason / Reference</label>
            <input
              type="text"
              placeholder="e.g. PO-8902 received or Order #4501 dispatch"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Commit Movement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
