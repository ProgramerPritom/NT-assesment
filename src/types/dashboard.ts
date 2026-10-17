export type MovementType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";

export interface StockMovement {
  id: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface CriticalItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minSafetyStock: number;
  unitPrice: number;
  supplier: string;
}

export interface DashboardMetrics {
  totalInventoryValue: number;
  inventoryGrowth: number;
  criticalStockCount: number;
  activeSuppliersCount: number;
  pendingApprovalsCount: number;
}
