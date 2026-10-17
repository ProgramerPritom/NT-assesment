"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types/inventory";
import StockProgressBar, { getStockStatus } from "@/components/inventory/StockProgressBar";
import AddProductModal from "@/components/inventory/AddProductModal";
import EditProductModal from "@/components/inventory/EditProductModal";
import DeleteConfirmDialog from "@/components/inventory/DeleteConfirmDialog";
import QuickStockModal from "@/components/inventory/QuickStockModal";
import { StockMovement } from "@/types/dashboard";

const INITIAL_PRODUCTS: Product[] = [
  {
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
  {
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
  {
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
  {
    id: "p4",
    sku: "SKU-LOG-MX3",
    name: "Logitech MX Master 3S Wireless Mouse",
    category: "Peripherals",
    unitPrice: 99,
    currentStock: 112,
    minSafetyStock: 30,
    warehouseBin: "Zone-C1",
    supplierId: "sup-3",
    supplierName: "FastTrack Cargo",
    createdAt: "2026-09-18",
  },
  {
    id: "p5",
    sku: "SKU-SAM-2TB",
    name: "Samsung 990 PRO 2TB PCIe 4.0 NVMe SSD",
    category: "Storage",
    unitPrice: 169,
    currentStock: 50,
    minSafetyStock: 20,
    warehouseBin: "Zone-A3",
    supplierId: "sup-2",
    supplierName: "Global Cloud Hardware",
    createdAt: "2026-09-20",
  },
  {
    id: "p6",
    sku: "SKU-AMD-780",
    name: "AMD Ryzen 7 7800X3D Gaming Processor",
    category: "Processors",
    unitPrice: 449,
    currentStock: 14,
    minSafetyStock: 20,
    warehouseBin: "Zone-A4",
    supplierId: "sup-1",
    supplierName: "Silicon Logistics",
    createdAt: "2026-09-22",
  },
  {
    id: "p7",
    sku: "SKU-NOC-D15",
    name: "Noctua NH-D15 chromax.black Dual-Tower Cooler",
    category: "Cooling",
    unitPrice: 119,
    currentStock: 28,
    minSafetyStock: 15,
    warehouseBin: "Zone-B1",
    supplierId: "sup-4",
    supplierName: "Nordic Tech Supply",
    createdAt: "2026-09-25",
  },
  {
    id: "p8",
    sku: "SKU-CIS-24P",
    name: "Cisco Catalyst 1000 24-Port Gigabit Switch",
    category: "Networking",
    unitPrice: 580,
    currentStock: 6,
    minSafetyStock: 10,
    warehouseBin: "Zone-B3",
    supplierId: "sup-2",
    supplierName: "Global Cloud Hardware",
    createdAt: "2026-09-28",
  },
  {
    id: "p9",
    sku: "SKU-SEA-8TB",
    name: "Seagate IronWolf Pro 8TB NAS HDD",
    category: "Storage",
    unitPrice: 199,
    currentStock: 35,
    minSafetyStock: 15,
    warehouseBin: "Zone-A1",
    supplierId: "sup-1",
    supplierName: "Silicon Logistics",
    createdAt: "2026-10-01",
  },
];

export default function InventoryPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "HEALTHY" | "WARNING" | "CRITICAL">("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);

  // Compute stats
  const totalSkus = products.length;
  const criticalCount = products.filter((p) => getStockStatus(p.currentStock, p.minSafetyStock) === "CRITICAL").length;
  const warningCount = products.filter((p) => getStockStatus(p.currentStock, p.minSafetyStock) === "WARNING").length;
  const healthyCount = products.filter((p) => getStockStatus(p.currentStock, p.minSafetyStock) === "HEALTHY").length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.warehouseBin.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

      const itemStatus = getStockStatus(p.currentStock, p.minSafetyStock);
      const matchesStatus = statusFilter === "ALL" || itemStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    toast.success(`Registered product SKU ${newProduct.sku} to catalog.`);
  };

  const handleEditProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast.success(`Updated SKU ${updated.sku} settings successfully.`);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (target) {
      toast.info(`Removed ${target.sku} from active catalog.`);
    }
  };

  const handleStockMovementSuccess = (movement: StockMovement) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === movement.sku) {
          const delta = movement.type === "STOCK_IN" ? movement.quantity : -movement.quantity;
          const updatedStock = Math.max(0, p.currentStock + delta);
          return { ...p, currentStock: updatedStock };
        }
        return p;
      })
    );
    toast.success(
      `Adjusted ${movement.sku} stock by ${movement.type === "STOCK_IN" ? "+" : "-"}${movement.quantity} pcs.`
    );
  };

  const openQuickStockForRow = (product: Product) => {
    setQuickStockProduct(product);
    setIsQuickStockOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
              <Boxes className="w-6 h-6 text-indigo-400" />
              <span>Product Catalog & Stock Management</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain active warehouse SKUs, assign bin locations, and track buffer thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total SKUs
            </span>
            <p className="text-xl font-bold text-slate-100">{totalSkus}</p>
          </div>
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Safe Buffer
            </span>
            <p className="text-xl font-bold text-emerald-400">{healthyCount}</p>
          </div>
          <div className="p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <p className="text-xl font-bold text-amber-400">{warningCount}</p>
          </div>
          <div className="p-2 bg-amber-950/60 border border-amber-800/60 rounded-lg text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Critical Depletion
            </span>
            <p className="text-xl font-bold text-rose-400">{criticalCount}</p>
          </div>
          <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-lg text-rose-400">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
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
            placeholder="Search by SKU, product name, or warehouse bin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 bg-slate-950 border border-slate-800 rounded-lg placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-200">
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tab Filters */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "HEALTHY", label: "Safe" },
                { id: "WARNING", label: "Low" },
                { id: "CRITICAL", label: "Critical" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  statusFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog Data Table */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3.5">SKU & Item Details</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Bin Location</th>
                <th className="px-4 py-3.5">Unit Price</th>
                <th className="px-4 py-3.5">Stock Level & Safety Ratio</th>
                <th className="px-4 py-3.5">Assigned Supplier</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/70 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No products match your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search filters or add a new SKU</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setStatusFilter("ALL");
                      }}
                      className="mt-3 px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 rounded-lg transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-850/40 transition-colors group"
                    >
                      {/* SKU and Name */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/inventory/${p.id}`}
                          className="font-medium text-slate-100 hover:text-indigo-400 transition-colors block text-sm"
                        >
                          {p.name}
                        </Link>
                        <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          {p.category}
                        </span>
                      </td>

                      {/* Bin Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-300 font-medium">
                          {p.warehouseBin}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-medium text-slate-200">
                        ${p.unitPrice.toFixed(2)}
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className="px-4 py-3.5">
                        <StockProgressBar current={p.currentStock} safety={p.minSafetyStock} />
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                        {p.supplierName}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Stock Modal Trigger */}
                          <button
                            onClick={() => openQuickStockForRow(p)}
                            title="Quick Stock In / Stock Out"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-transparent hover:border-indigo-800/50 transition-all"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Edit product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingProduct(p)}
                            title="Delete SKU"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Showing <strong className="text-slate-200">{filteredProducts.length}</strong> of{" "}
            <strong className="text-slate-200">{products.length}</strong> items in catalog
          </span>
          <span className="font-mono text-[11px]">
            Total physical inventory: {totalStockUnits.toLocaleString()} units
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* Quick Stock Modal */}
      <QuickStockModal
        isOpen={isQuickStockOpen}
        onClose={() => {
          setIsQuickStockOpen(false);
          setQuickStockProduct(null);
        }}
        initialProduct={quickStockProduct}
        products={products}
        onSuccess={handleStockMovementSuccess}
      />
    </div>
  );
}
