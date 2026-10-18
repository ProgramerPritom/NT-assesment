import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const task = await prisma.aIWorkflowTask.findUnique({
      where: { id: params.id },
      include: {
        product: {
          include: {
            client: true,
          },
        },
        decision: {
          include: {
            decidedBy: {
              select: { id: true, name: true, role: true, email: true },
            },
          },
        },
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!task) {
      return errorResponse('Governance task not found', 404);
    }

    return successResponse({ task });
  } catch {
    return errorResponse('Failed to fetch governance task details', 500);
  }
}
