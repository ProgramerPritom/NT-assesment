export interface ActiveSupplierInfo {
  id: string;
  name: string;
  email: string;
  creditLimit: number;
}

export interface RestockAnalysisInput {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minSafetyStock: number;
  unitPrice: number;
  warehouseBin: string;
  currentSupplier?: ActiveSupplierInfo | null;
  availableSuppliers: ActiveSupplierInfo[];
}

export interface RestockRecommendation {
  recommendedSupplierId: string;
  recommendedSupplierName: string;
  recommendedQuantity: number;
  estimatedCost: number;
  confidenceScore: number; // 0 - 100
  reasoning: string;
  isFallback?: boolean;
}

export interface RiskAssessment {
  financialFactor: number; // 0 - 50
  confidenceFactor: number; // 0 - 30
  supplierFactor: number; // 0 or 20
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoApprove: boolean; // true if riskScore < 60
}
