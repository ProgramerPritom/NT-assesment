import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { CriticalItem, DashboardMetrics, StockMovement } from '@/types/dashboard';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    // 1. Fetch Products
    const products = await prisma.product.findMany({
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    // 2. Compute Inventory Values & Stock Thresholds
    let totalInventoryValue = 0;
    let criticalStockCount = 0;
    const criticalItems: CriticalItem[] = [];

    for (const p of products) {
      totalInventoryValue += p.currentStock * p.unitPrice;

      const isCritical = p.currentStock <= Math.max(5, Math.floor(p.minSafetyStock * 0.3));
      if (isCritical) {
        criticalStockCount++;
        criticalItems.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.currentStock,
          minSafetyStock: p.minSafetyStock,
          unitPrice: p.unitPrice,
          supplier: p.client?.name || 'Unassigned Vendor',
        });
      }
    }

    // 3. Count Active Suppliers
    const activeSuppliersCount = await prisma.client.count({
      where: { status: 'ACTIVE' },
    });

    // 4. Count Pending Approvals
    const pendingApprovalsCount = await prisma.aIWorkflowTask.count({
      where: { status: 'AWAITING_APPROVAL' },
    });

    // 5. Fetch Recent Stock Movements
    const rawMovements = await prisma.stockMovement.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const recentMovements: StockMovement[] = rawMovements.map((m) => ({
      id: m.id,
      productName: m.product.name,
      sku: m.product.sku,
      type: m.type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT',
      quantity: m.quantity,
      reason: m.reason,
      performedBy: m.user?.name || 'Floor Staff',
      timestamp: m.createdAt.toISOString(),
    }));

    const metrics: DashboardMetrics = {
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      inventoryGrowth: 8.4,
      criticalStockCount,
      activeSuppliersCount,
      pendingApprovalsCount,
    };

    return successResponse({
      metrics,
      recentMovements,
      criticalItems,
      totalCatalogProducts: products.length,
    });
  } catch {
    return errorResponse('Failed to calculate dashboard statistics', 500);
  }
}
