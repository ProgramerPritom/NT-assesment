"use client";

import React, { useState } from "react";
import { X, Plus, Wand2, Loader2, AlertCircle } from "lucide-react";
import { Product, ProductFormData } from "@/types/inventory";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Product) => void;
}

const CATEGORIES = [
  "Storage",
  "Memory",
  "Power Supply",
  "Peripherals",
  "Cooling",
  "Networking",
  "Processors",
];

const SUPPLIERS = [
  "Silicon Logistics",
  "Global Cloud Hardware",
  "FastTrack Cargo",
  "Nordic Tech Supply",
];

export default function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    name: "",
    category: "Storage",
    unitPrice: 99,
    currentStock: 20,
    minSafetyStock: 15,
    warehouseBin: "Zone-A1",
    supplierName: "Silicon Logistics",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, sku: `SKU-${prefix}-${rand}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.sku.trim()) {
      setError("Product SKU is required.");
      return;
    }

    if (formData.unitPrice <= 0) {
      setError("Unit price must be greater than zero.");
      return;
    }

    if (formData.minSafetyStock < 0 || formData.currentStock < 0) {
      setError("Stock levels cannot be negative.");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 350));

    const newProduct: Product = {
      id: "prod-" + Date.now(),
      sku: formData.sku.toUpperCase(),
      name: formData.name,
      category: formData.category,
      unitPrice: Number(formData.unitPrice),
      currentStock: Number(formData.currentStock),
      minSafetyStock: Number(formData.minSafetyStock),
      warehouseBin: formData.warehouseBin,
      supplierId: "sup-" + Math.floor(Math.random() * 10),
      supplierName: formData.supplierName,
      createdAt: "Just now",
    };

    onAdd(newProduct);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Add New Product SKU</span>
            </h2>
            <p className="text-xs text-slate-400">Register a new catalog item with threshold limits</p>
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
          {/* SKU Field with Generator */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300">Product SKU / Barcode</label>
              <button
                type="button"
                onClick={handleGenerateSku}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-generate</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. SKU-SSD-500"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase font-mono"
              required
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Product Name & Model</label>
            <input
              type="text"
              placeholder="e.g. Samsung 990 PRO 2TB NVMe SSD"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Category & Warehouse Bin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Warehouse Bin Location</label>
              <input
                type="text"
                placeholder="e.g. Zone-A2, Shelf-B4"
                value={formData.warehouseBin}
                onChange={(e) => setFormData({ ...formData, warehouseBin: e.target.value })}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Pricing & Quantities */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Unit Price ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Min Safety Stock</label>
              <input
                type="number"
                min="1"
                value={formData.minSafetyStock}
                onChange={(e) => setFormData({ ...formData, minSafetyStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Assigned Supplier</label>
            <select
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              {SUPPLIERS.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          {/* Footer buttons */}
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
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
