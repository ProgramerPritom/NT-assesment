import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  unitPrice: z.number().positive().optional(),
  minSafetyStock: z.number().int().min(1).optional(),
  warehouseBin: z.string().min(2).optional(),
  clientId: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            taxNumber: true,
            status: true,
            creditLimit: true,
          },
        },
        movements: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        workflowTasks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    let stockStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (product.currentStock <= Math.max(5, Math.floor(product.minSafetyStock * 0.3))) {
      stockStatus = 'CRITICAL';
    } else if (product.currentStock <= product.minSafetyStock) {
      stockStatus = 'WARNING';
    }

    return successResponse({
      product: {
        ...product,
        stockStatus,
        supplierId: product.client?.id || '',
        supplierName: product.client?.name || 'Unassigned Vendor',
      },
    });
  } catch {
    return errorResponse('Failed to fetch product details', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    if (auth.role === 'STAFF') {
      return errorResponse('Forbidden: Manager or Admin authorization required', 403);
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid product data', 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return errorResponse('Product not found', 404);
    }

    if (parsed.data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
      if (!client) {
        return errorResponse('Assigned supplier/client not found', 404);
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name) updatePayload.name = parsed.data.name;
    if (parsed.data.category) updatePayload.category = parsed.data.category;
    if (parsed.data.unitPrice !== undefined) updatePayload.unitPrice = parsed.data.unitPrice;
    if (parsed.data.minSafetyStock !== undefined) updatePayload.minSafetyStock = parsed.data.minSafetyStock;
    if (parsed.data.warehouseBin) updatePayload.warehouseBin = parsed.data.warehouseBin;
    if (parsed.data.clientId !== undefined) updatePayload.clientId = parsed.data.clientId;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updatePayload,
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse({ product: updated });
  } catch {
    return errorResponse('Failed to update product', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin privilege required to delete inventory catalog items', 403);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return errorResponse('Product not found', 404);
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Product and associated ledger history removed successfully' });
  } catch {
    return errorResponse('Failed to delete product', 500);
  }
}
