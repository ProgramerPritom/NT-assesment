import { calculateBlastRadiusRiskScore } from '../services/governance/riskEngine';
import { analyzeRestockRecommendation } from '../services/ai/geminiClient';
import { POST as restockScanHandler } from '../app/api/ai/restock-scan/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';

function createRequest(url: string, method: string, body?: Record<string, unknown>, token?: string): NextRequest {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function runAIEngineTests() {
  console.log('=== Running AI Engine & Autonomous Restock Scanner DoD Tests ===\n');

  // Test 1: Pure Deterministic Blast Radius Risk Formula
  console.log('Test 1: Verifying Mathematical Blast Radius Formula...');
  
  // Case A: Low risk order
  const riskLow = calculateBlastRadiusRiskScore({
    estimatedCost: 400,
    aiConfidence: 95,
    isNewOrUnverifiedSupplier: false,
  });
  console.log(`Low Risk Case -> Score: ${riskLow.riskScore} | Level: ${riskLow.riskLevel} | AutoApprove: ${riskLow.autoApprove}`);
  if (riskLow.riskLevel !== 'LOW' || !riskLow.autoApprove) {
    throw new Error('Expected LOW risk and autoApprove = true for small existing supplier order');
  }

  // Case B: High risk order
  const riskHigh = calculateBlastRadiusRiskScore({
    estimatedCost: 3500,
    aiConfidence: 80,
    isNewOrUnverifiedSupplier: true,
  });
  console.log(`High Risk Case -> Score: ${riskHigh.riskScore} | Level: ${riskHigh.riskLevel} | AutoApprove: ${riskHigh.autoApprove}`);
  if (riskHigh.riskLevel !== 'HIGH' || riskHigh.autoApprove) {
    throw new Error('Expected HIGH risk and autoApprove = false for large new supplier order');
  }

  // Case C: Critical risk order
  const riskCritical = calculateBlastRadiusRiskScore({
    estimatedCost: 5000,
    aiConfidence: 60,
    isNewOrUnverifiedSupplier: true,
  });
  console.log(`Critical Risk Case -> Score: ${riskCritical.riskScore} | Level: ${riskCritical.riskLevel} | AutoApprove: ${riskCritical.autoApprove}`);
  if (riskCritical.riskLevel !== 'CRITICAL' || riskCritical.autoApprove) {
    throw new Error('Expected CRITICAL risk for $5k low-confidence order');
  }

  // Test 2: AI Restock Recommendation Generator
  console.log('\nTest 2: Testing AI Restock Recommendation with Context Injection...');
  const mockSuppliers = [
    { id: 'supp-1', name: 'Silicon Logistics', email: 'sales@silicon.com', creditLimit: 75000 },
    { id: 'supp-2', name: 'Global Cloud Hardware', email: 'sales@globalcloud.com', creditLimit: 120000 },
  ];

  const aiRec = await analyzeRestockRecommendation({
    productId: 'test-p1',
    productName: 'Crucial P3 1TB NVMe SSD',
    sku: 'SSD-1TB-CRUCIAL',
    category: 'Storage Components',
    currentStock: 4,
    minSafetyStock: 30,
    unitPrice: 65,
    warehouseBin: 'Zone-A1-Bay04',
    currentSupplier: mockSuppliers[0],
    availableSuppliers: mockSuppliers,
  });

  console.log(`AI Proposed Vendor: ${aiRec.recommendedSupplierName} (ID: ${aiRec.recommendedSupplierId})`);
  console.log(`Recommended Qty: ${aiRec.recommendedQuantity} units | Est Cost: $${aiRec.estimatedCost}`);
  console.log(`Confidence: ${aiRec.confidenceScore}% | Fallback Engine: ${aiRec.isFallback ? 'YES (Smart Heuristic)' : 'NO (Gemini Live)'}`);
  console.log(`Reasoning: ${aiRec.reasoning.slice(0, 100)}...`);

  if (!aiRec.recommendedSupplierId || aiRec.recommendedQuantity < 10 || aiRec.confidenceScore < 70) {
    throw new Error('AI recommendation failed validation criteria');
  }

  // Obtain staff token to run 1-click restock scan
  const staffLogin = await loginHandler(createRequest('/api/auth/login', 'POST', {
    email: 'staff@nexus.com',
    password: 'password123',
  }));
  const staffToken = (await staffLogin.json()).data.token;

  // Test 3: Unauthenticated scan attempt
  console.log('\nTest 3: Unauthenticated /api/ai/restock-scan call (Security Guard)...');
  const res3 = await restockScanHandler(createRequest('/api/ai/restock-scan', 'POST'));
  console.log(`Status: ${res3.status} (Denied correctly)`);
  if (res3.status !== 401) throw new Error('Expected 401 Unauthorized');

  // Test 4: Authenticated 1-Click Warehouse Scan
  console.log('\nTest 4: Triggering 1-Click Warehouse Restock Scan...');
  
  // Ensure at least one product is below safety stock for testing
  const targetProduct = await prisma.product.findFirst({
    where: { sku: 'SSD-1TB-CRUCIAL' },
  });
  if (targetProduct) {
    await prisma.product.update({
      where: { id: targetProduct.id },
      data: { currentStock: 3, minSafetyStock: 30 },
    });
    // Remove any lingering pending tasks for this item to test fresh scan
    await prisma.aIWorkflowTask.deleteMany({
      where: { productId: targetProduct.id, status: 'AWAITING_APPROVAL' },
    });
  }

  const res4 = await restockScanHandler(createRequest('/api/ai/restock-scan', 'POST', undefined, staffToken));
  const data4 = await res4.json();
  console.log(`Status: ${res4.status} | Low Stock Items Found: ${data4.data?.lowStockCount}`);
  console.log(`Auto-Executed Orders: ${data4.data?.autoExecutedCount} | Awaiting Manager Approval: ${data4.data?.awaitingApprovalCount}`);
  console.log(`Message: ${data4.data?.message}`);

  if (res4.status !== 200 || data4.data?.lowStockCount === 0) {
    throw new Error('Expected scan to detect depleted inventory item');
  }

  // Test 5: Duplicate Scan Idempotency Guard
  console.log('\nTest 5: Re-running scan immediately (Duplicate Prevention Guard)...');
  const res5 = await restockScanHandler(createRequest('/api/ai/restock-scan', 'POST', undefined, staffToken));
  const data5 = await res5.json();
  console.log(`Status: ${res5.status} | Skipped existing pending: ${data5.data?.skippedCount}`);
  if (res5.status !== 200 || data5.data?.skippedCount < 1) {
    throw new Error('Duplicate scan did not properly skip existing pending tasks!');
  }

  console.log('\n🎉 ALL 5 AI ENGINE & RESTOCK SCANNER TESTS PASSED WITH 100% SUCCESS!');
}

runAIEngineTests()
  .catch((e) => {
    console.error('AI Engine Test Failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
