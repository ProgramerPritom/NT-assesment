import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { analyzeRestockRecommendation } from '@/services/ai/geminiClient';
import { calculateBlastRadiusRiskScore } from '@/services/governance/riskEngine';
import { ActiveSupplierInfo } from '@/services/ai/aiTypes';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    // 1. Fetch products needing replenishment
    const allProducts = await prisma.product.findMany({
      include: {
        client: true,
      },
    });

    const lowStockProducts = allProducts.filter((p: any) => p.currentStock <= p.minSafetyStock);
    const totalCatalogCount = allProducts.length;

    if (lowStockProducts.length === 0) {
      return successResponse({
        scannedCount: totalCatalogCount,
        lowStockCount: 0,
        tasksCreated: 0,
        autoExecutedCount: 0,
        awaitingApprovalCount: 0,
        message: 'All inventory items are currently above minimum safety thresholds.',
        results: [],
      });
    }

    // 2. Fetch all verified ACTIVE suppliers
    const activeClients = await prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        creditLimit: true,
      },
    });

    const availableSuppliers: ActiveSupplierInfo[] = activeClients.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      creditLimit: c.creditLimit,
    }));

    const results = [];
    let autoExecutedCount = 0;
    let awaitingApprovalCount = 0;
    let skippedCount = 0;

    for (const prod of lowStockProducts) {
      // Check if task is already pending in queue for this product to prevent duplicate ordering
      const existingPending = await prisma.aIWorkflowTask.findFirst({
        where: {
          productId: prod.id,
          status: 'AWAITING_APPROVAL',
        },
      });

      if (existingPending) {
        skippedCount++;
        results.push({
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          action: 'SKIPPED_EXISTING_PENDING_TASK',
          taskId: existingPending.id,
        });
        continue;
      }

      // Format input for AI Restock Analysis
      const currentSupplierInfo = prod.client && prod.client.status === 'ACTIVE' ? {
        id: prod.client.id,
        name: prod.client.name,
        email: prod.client.email,
        creditLimit: prod.client.creditLimit,
      } : null;

      const aiRecommendation = await analyzeRestockRecommendation({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        category: prod.category,
        currentStock: prod.currentStock,
        minSafetyStock: prod.minSafetyStock,
        unitPrice: prod.unitPrice,
        warehouseBin: prod.warehouseBin,
        currentSupplier: currentSupplierInfo,
        availableSuppliers,
      });

      // Calculate Deterministic Blast Radius Risk
      const isNewSupplier = !currentSupplierInfo;
      const risk = calculateBlastRadiusRiskScore({
        estimatedCost: aiRecommendation.estimatedCost,
        aiConfidence: aiRecommendation.confidenceScore,
        isNewOrUnverifiedSupplier: isNewSupplier,
      });

      const payload = {
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        supplierId: aiRecommendation.recommendedSupplierId,
        supplierName: aiRecommendation.recommendedSupplierName,
        quantity: aiRecommendation.recommendedQuantity,
        unitPrice: prod.unitPrice,
        estimatedCost: aiRecommendation.estimatedCost,
        currency: 'USD',
        isFallbackEngine: aiRecommendation.isFallback || false,
      };

      // 4. Automated Decision Routing
      if (risk.autoApprove) {
        // Low/Medium Risk: Auto-executed pipeline
        const taskResult = await prisma.$transaction(async (tx: any) => {
          const task = await tx.aIWorkflowTask.create({
            data: {
              productId: prod.id,
              actionType: 'RESTOCK_PURCHASE_ORDER',
              suggestedQty: aiRecommendation.recommendedQuantity,
              estimatedCost: aiRecommendation.estimatedCost,
              aiConfidence: aiRecommendation.confidenceScore,
              aiReasoning: aiRecommendation.reasoning,
              riskScore: risk.riskScore,
              riskLevel: risk.riskLevel,
              status: 'EXECUTED',
              proposedPayload: JSON.stringify(payload),
            },
          });

          const orderNumber = `PO-AUTO-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;

          const purchaseOrder = await tx.purchaseOrder.create({
            data: {
              orderNumber,
              productId: prod.id,
              supplierId: aiRecommendation.recommendedSupplierId,
              quantity: aiRecommendation.recommendedQuantity,
              totalAmount: aiRecommendation.estimatedCost,
              status: 'CONFIRMED',
              taskId: task.id,
            },
          });

          await tx.product.update({
            where: { id: prod.id },
            data: { currentStock: prod.currentStock + aiRecommendation.recommendedQuantity },
          });

          await tx.stockMovement.create({
            data: {
              productId: prod.id,
              type: 'STOCK_IN',
              quantity: aiRecommendation.recommendedQuantity,
              reason: `Autonomous restock reorder automatically executed (Risk Score: ${risk.riskScore} < 60, PO: ${orderNumber})`,
              userId: auth.userId,
            },
          });

          return { task, purchaseOrder };
        });

        autoExecutedCount++;
        results.push({
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          action: 'AUTO_EXECUTED',
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          taskId: taskResult.task.id,
          poNumber: taskResult.purchaseOrder.orderNumber,
          reorderedQuantity: aiRecommendation.recommendedQuantity,
        });
      } else {
        // High/Critical Risk: Paused in Awaiting Approval queue
        const task = await prisma.aIWorkflowTask.create({
          data: {
            productId: prod.id,
            actionType: 'RESTOCK_PURCHASE_ORDER',
            suggestedQty: aiRecommendation.recommendedQuantity,
            estimatedCost: aiRecommendation.estimatedCost,
            aiConfidence: aiRecommendation.confidenceScore,
            aiReasoning: aiRecommendation.reasoning,
            riskScore: risk.riskScore,
            riskLevel: risk.riskLevel,
            status: 'AWAITING_APPROVAL',
            proposedPayload: JSON.stringify(payload),
          },
        });

        awaitingApprovalCount++;
        results.push({
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          action: 'AWAITING_APPROVAL',
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          taskId: task.id,
          reorderedQuantity: aiRecommendation.recommendedQuantity,
          reason: 'High blast radius risk exceeds autonomous threshold (>= 60). Paused for Human-in-the-Loop manager authorization.',
        });
      }
    }

    return successResponse({
      scannedCount: totalCatalogCount,
      lowStockCount: lowStockProducts.length,
      tasksCreated: autoExecutedCount + awaitingApprovalCount,
      autoExecutedCount,
      awaitingApprovalCount,
      skippedCount,
      results,
      message: `Restock scan completed: ${lowStockProducts.length} low-stock items evaluated. ${autoExecutedCount} low-risk orders auto-executed, ${awaitingApprovalCount} high-risk tasks paused for manager approval.`,
    });
  } catch {
    return errorResponse('Failed to execute AI inventory restock scan', 500);
  }
}
