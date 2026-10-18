import { RiskAssessment } from '../ai/aiTypes';

export function calculateBlastRadiusRiskScore(params: {
  estimatedCost: number;
  aiConfidence: number;
  isNewOrUnverifiedSupplier?: boolean;
}): RiskAssessment {
  const { estimatedCost, aiConfidence, isNewOrUnverifiedSupplier = false } = params;

  // 1. Financial Impact Factor (Scale: 0 to 50)
  // Reaches maximum threshold at $2,000 reorder value
  const financialFactor = Math.min(50, (estimatedCost / 2000) * 50);

  // 2. AI Confidence Factor (Scale: 0 to 30)
  // Low confidence penalizes risk score proportionally
  const clampedConfidence = Math.min(100, Math.max(0, aiConfidence));
  const confidenceFactor = (100 - clampedConfidence) * 0.3;

  // 3. Supplier Risk Factor (Scale: 0 or 20)
  // Penalizes unverified or freshly onboarded vendor accounts
  const supplierFactor = isNewOrUnverifiedSupplier ? 20 : 0;

  // Total Blast Radius Risk Score (Scale: 0 to 100)
  const rawScore = financialFactor + confidenceFactor + supplierFactor;
  const riskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Risk Classification
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (riskScore < 35) {
    riskLevel = 'LOW';
  } else if (riskScore < 60) {
    riskLevel = 'MEDIUM';
  } else if (riskScore < 80) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
  }

  // HITL Boundary: Auto-approve only if riskScore < 60
  const autoApprove = riskScore < 60;

  return {
    financialFactor: Math.round(financialFactor * 100) / 100,
    confidenceFactor: Math.round(confidenceFactor * 100) / 100,
    supplierFactor,
    riskScore,
    riskLevel,
    autoApprove,
  };
}
