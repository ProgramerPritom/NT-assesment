import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const movementSchema = z.object({
  type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1 unit'),
  reason: z.string().min(3, 'Detailed operational reason is required for audit traceability'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized: Authentication required', 401);
    }

    const body = await req.json();
    const parsed = movementSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input data', 400);
    }

    const { type, quantity, reason } = parsed.data;

    // Execute atomic transaction for stock mutation and ledger immutability
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: params.id },
      });

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      let newStock = product.currentStock;

      if (type === 'STOCK_IN') {
        newStock = product.currentStock + quantity;
      } else if (type === 'STOCK_OUT') {
        if (product.currentStock < quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.currentStock}`);
        }
        newStock = product.currentStock - quantity;
      } else if (type === 'ADJUSTMENT') {
        // Physical count reconciliation
        newStock = quantity;
      }

      // Update product current stock
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: { currentStock: newStock },
      });

      // Insert immutable ledger log
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          type,
          quantity,
          reason,
          userId: auth.userId,
        },
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return { updatedProduct, movement };
    });

    return successResponse({
      product: result.updatedProduct,
      movement: result.movement,
      message: `Stock movement recorded: ${type} ${quantity} units (New total: ${result.updatedProduct.currentStock})`,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : '';

    if (errMessage === 'PRODUCT_NOT_FOUND') {
      return errorResponse('Product not found in inventory catalog', 404);
    }

    if (errMessage.startsWith('INSUFFICIENT_STOCK:')) {
      const available = errMessage.split(':')[1];
      return errorResponse(
        `Insufficient stock for dispatch. Available units: ${available}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    return errorResponse('Failed to record stock movement transaction', 500);
  }
}
