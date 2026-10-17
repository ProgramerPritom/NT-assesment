export type TaskStatus = "AWAITING_APPROVAL" | "AUTO_EXECUTED" | "APPROVED" | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AITask {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  minSafetyStock: number;
  recommendedQuantity: number;
  unitPrice: number;
  estimatedCost: number;
  supplierId: string;
  supplierName: string;
  aiConfidence: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  status: TaskStatus;
  reasoningTrace: string[];
  rejectionReason?: string;
  modifiedQuantity?: number;
  approvedBy?: string;
  timestamp: string;
  executedAt?: string;
  poReference?: string;
}
