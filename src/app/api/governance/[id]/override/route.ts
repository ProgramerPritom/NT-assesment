import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const overrideSchema = z.object({
  overrideQuantity: z.number().int().positive('Quantity must be greater than zero'),
  reason: z.string().min(3, 'Operational override justification is required'),
});

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
      return errorResponse('Forbidden: Floor staff cannot override AI parameters. Manager or Admin required.', 403);
    }

    const body = await req.json();
    const parsed = overrideSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid override data', 400);
    }

    const { overrideQuantity, reason } = parsed.data;

    const task = await prisma.aIWorkflowTask.findUnique({
      where: { id: params.id },
      include: { product: true },
    });

    if (!task) {
      return errorResponse('Governance task not found', 404);
    }

    if (task.status !== 'AWAITING_APPROVAL' && task.status !== 'QUEUED') {
      return errorResponse(`Cannot modify parameters for task in status ${task.status}`, 400);
    }

    const newEstimatedCost = Math.round(overrideQuantity * task.product.unitPrice * 100) / 100;

    let payloadObj: Record<string, unknown> = {};
    try {
      payloadObj = JSON.parse(task.proposedPayload || '{}');
    } catch {
      // Empty fallback
    }

    payloadObj.originalQuantity = task.suggestedQty;
    payloadObj.quantity = overrideQuantity;
    payloadObj.totalCost = newEstimatedCost;
    payloadObj.overriddenBy = auth.name;
    payloadObj.overrideReason = reason;

    const updatedTask = await prisma.aIWorkflowTask.update({
      where: { id: params.id },
      data: {
        suggestedQty: overrideQuantity,
        estimatedCost: newEstimatedCost,
        aiReasoning: `${task.aiReasoning}\n[Human Override by ${auth.name}]: Quantity adjusted from ${task.suggestedQty} to ${overrideQuantity}. Reason: ${reason}`,
        proposedPayload: JSON.stringify(payloadObj),
      },
    });

    return successResponse({
      task: updatedTask,
      message: `Task restock quantity successfully modified to ${overrideQuantity} units ($${newEstimatedCost})`,
    });
  } catch {
    return errorResponse('Failed to override task parameters', 500);
  }
}
