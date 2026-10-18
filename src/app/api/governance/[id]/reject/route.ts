import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const rejectSchema = z.object({
  reason: z.string().min(3, 'A clear operational rejection reason is mandatory for compliance logs'),
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
      return errorResponse('Forbidden: Floor staff cannot reject AI autonomous tasks. Manager or Admin required.', 403);
    }

    const body = await req.json();
    const parsed = rejectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Rejection reason is required', 400);
    }

    const { reason } = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      const task = await tx.aIWorkflowTask.findUnique({
        where: { id: params.id },
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

      const updatedTask = await tx.aIWorkflowTask.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      });

      const decision = await tx.approvalDecision.create({
        data: {
          taskId: task.id,
          decision: 'REJECTED',
          comments: reason,
          decidedById: auth.userId,
        },
        include: {
          decidedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return { updatedTask, decision };
    });

    return successResponse({
      task: result.updatedTask,
      decision: result.decision,
      message: 'AI restock task rejected. Recorded in compliance audit ledger.',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';

    if (msg === 'TASK_NOT_FOUND') {
      return errorResponse('Governance workflow task not found', 404);
    }
    if (msg === 'TASK_ALREADY_EXECUTED') {
      return errorResponse('Cannot reject a task that has already been executed', 400);
    }
    if (msg === 'TASK_ALREADY_REJECTED') {
      return errorResponse('This workflow task was already rejected', 400);
    }

    return errorResponse('Failed to record task rejection', 500);
  }
}
