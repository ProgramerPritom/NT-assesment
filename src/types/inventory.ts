export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minSafetyStock: number;
  warehouseBin: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
}

export type StockStatus = "HEALTHY" | "WARNING" | "CRITICAL";

export interface ProductFormData {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minSafetyStock: number;
  warehouseBin: string;
  supplierName: string;
}
