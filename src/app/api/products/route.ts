import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const createProductSchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be greater than zero'),
  currentStock: z.number().int().min(0).default(0),
  minSafetyStock: z.number().int().min(1).default(10),
  warehouseBin: z.string().min(2).default('Zone-A1-Bay01'),
  clientId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const query = searchParams.get('q');

    const whereClause: Record<string, unknown> = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { warehouseBin: { contains: query, mode: 'insensitive' } },
      ];
    }

    const rawProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            movements: true,
            purchaseOrders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute stock status & filter if stockStatus query is provided
    let products = rawProducts.map((p) => {
      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
      if (p.currentStock <= Math.max(5, Math.floor(p.minSafetyStock * 0.3))) {
        status = 'CRITICAL';
      } else if (p.currentStock <= p.minSafetyStock) {
        status = 'WARNING';
      }

      return {
        ...p,
        stockStatus: status,
        supplierId: p.client?.id || '',
        supplierName: p.client?.name || 'Unassigned Vendor',
      };
    });

    if (stockStatus && ['HEALTHY', 'WARNING', 'CRITICAL', 'LOW_STOCK'].includes(stockStatus)) {
      if (stockStatus === 'LOW_STOCK') {
        products = products.filter((p) => p.stockStatus === 'CRITICAL' || p.stockStatus === 'WARNING');
      } else {
        products = products.filter((p) => p.stockStatus === stockStatus);
      }
    }

    return successResponse({
      products,
      count: products.length,
      totalInventoryValue: products.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0),
    });
  } catch {
    return errorResponse('Failed to fetch products', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    if (auth.role === 'STAFF') {
      return errorResponse('Forbidden: Manager or Admin authorization required to create products', 403);
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid product data', 400);
    }

    const { sku, name, category, unitPrice, currentStock, minSafetyStock, warehouseBin, clientId } = parsed.data;

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existingSku) {
      return errorResponse(`SKU "${sku.trim().toUpperCase()}" is already assigned to another product`, 409);
    }

    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return errorResponse('Assigned supplier/client not found', 404);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          sku: sku.trim().toUpperCase(),
          name,
          category,
          unitPrice,
          currentStock,
          minSafetyStock,
          warehouseBin,
          clientId: clientId || null,
        },
        include: {
          client: {
            select: { id: true, name: true },
          },
        },
      });

      // Record initial inventory ledger entry if currentStock > 0
      if (currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: newProduct.id,
            type: 'STOCK_IN',
            quantity: currentStock,
            reason: 'Initial catalog intake and warehouse receiving',
            userId: auth.userId,
          },
        });
      }

      return newProduct;
    });

    return successResponse({ product: result }, 201);
  } catch {
    return errorResponse('Failed to create product', 500);
  }
}
