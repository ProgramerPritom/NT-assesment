import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type ClientStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED']),
  note: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    if (auth.role === 'STAFF') {
      return errorResponse('Forbidden: Manager or Admin authorization required to alter client status', 403);
    }

    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid status value', 400);
    }

    const { status } = parsed.data;

    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return errorResponse('Client not found', 404);
    }

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        status: status as ClientStatus,
      },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResponse({
      client: updated,
      message: `Client status successfully transitioned to ${status}`,
    });
  } catch {
    return errorResponse('Failed to update client status', 500);
  }
}
