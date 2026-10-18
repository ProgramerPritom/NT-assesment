import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const approveSchema = z.object({
  comments: z.string().optional().default('Approved by operations authority via HITL governance review.'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    if (auth.role === 'STAFF') {
      return errorResponse('Forbidden: Floor staff cannot authorize AI autonomous restock tasks. Manager or Admin credentials required.', 403);
    }

    const body = await req.json().catch(() => ({}));
    const parsed = approveSchema.safeParse(body);
    const comments = parsed.success ? parsed.data.comments : 'Approved via governance review.';

    const result = await prisma.$transaction(async (tx: any) => {
      const task = await tx.aIWorkflowTask.findUnique({
        where: { id: params.id },
        include: {
          product: {
            include: { client: true },
          },
        },
      });

      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }

      if (task.status === 'EXECUTED') {
        throw new Error('TASK_ALREADY_EXECUTED');
      }

      if (task.status === 'REJECTED') {
        throw new Error('TASK_ALREADY_REJECTED');
      }

      // Parse payload for supplier info
      let supplierId = task.product.clientId;
      try {
        const payload = JSON.parse(task.proposedPayload || '{}');
        if (payload.supplierId) supplierId = payload.supplierId;
      } catch {
        // Fallback to product clientId
      }

      if (!supplierId) {
        throw new Error('NO_SUPPLIER_ASSIGNED');
      }

      // 1. Update Task status
      const updatedTask = await tx.aIWorkflowTask.update({
        where: { id: params.id },
        data: { status: 'EXECUTED' },
      });

      // 2. Create Approval Decision
      const decision = await tx.approvalDecision.create({
        data: {
          taskId: task.id,
          decision: 'APPROVED',
          comments,
          decidedById: auth.userId,
        },
        include: {
          decidedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      // 3. Generate official Purchase Order
      const orderNumber = `PO-2026-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          productId: task.productId,
          supplierId,
          quantity: task.suggestedQty,
          totalAmount: task.estimatedCost,
          status: 'CONFIRMED',
          taskId: task.id,
        },
      });

      // 4. Update Product Stock and Record Stock Movement
      const updatedProduct = await tx.product.update({
        where: { id: task.productId },
        data: {
          currentStock: task.product.currentStock + task.suggestedQty,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: task.productId,
          type: 'STOCK_IN',
          quantity: task.suggestedQty,
          reason: `Autonomous restock order authorized via governance approval (${orderNumber})`,
          userId: auth.userId,
        },
      });

      return { updatedTask, decision, purchaseOrder, updatedProduct, movement };
    });

    return successResponse({
      task: result.updatedTask,
      decision: result.decision,
      purchaseOrder: result.purchaseOrder,
      product: result.updatedProduct,
      movement: result.movement,
      message: `Task successfully approved. Purchase Order ${result.purchaseOrder.orderNumber} generated and stock updated (+${result.purchaseOrder.quantity} units).`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';

    if (msg === 'TASK_NOT_FOUND') {
      return errorResponse('Governance workflow task not found', 404);
    }
    if (msg === 'TASK_ALREADY_EXECUTED') {
      return errorResponse('This workflow task has already been approved and executed', 400);
    }
    if (msg === 'TASK_ALREADY_REJECTED') {
      return errorResponse('This workflow task was previously rejected and cannot be executed', 400);
    }
    if (msg === 'NO_SUPPLIER_ASSIGNED') {
      return errorResponse('No active supplier could be identified for this restock order', 400);
    }

    return errorResponse('Failed to execute task approval transaction', 500);
  }
}
