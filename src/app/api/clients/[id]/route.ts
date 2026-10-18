import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type ClientStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  taxNumber: z.string().min(3).optional(),
  creditLimit: z.number().min(0).optional(),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED']).optional(),
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

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            currentStock: true,
            minSafetyStock: true,
            unitPrice: true,
            warehouseBin: true,
          },
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!client) {
      return errorResponse('Client not found', 404);
    }

    return successResponse({ client });
  } catch {
    return errorResponse('Failed to fetch client details', 500);
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
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input data', 400);
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existingClient) {
      return errorResponse('Client not found', 404);
    }

    // Check unique conflicts if email or taxNumber changed
    if (parsed.data.email && parsed.data.email.toLowerCase() !== existingClient.email) {
      const emailConflict = await prisma.client.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (emailConflict) {
        return errorResponse('Email is already registered to another client', 409);
      }
    }

    if (parsed.data.taxNumber && parsed.data.taxNumber.trim() !== existingClient.taxNumber) {
      const taxConflict = await prisma.client.findUnique({
        where: { taxNumber: parsed.data.taxNumber.trim() },
      });
      if (taxConflict) {
        return errorResponse('Tax number is already registered to another client', 409);
      }
    }

    const updatePayload: {
      name?: string;
      email?: string;
      taxNumber?: string;
      creditLimit?: number;
      status?: ClientStatus;
    } = {};

    if (parsed.data.name) updatePayload.name = parsed.data.name;
    if (parsed.data.email) updatePayload.email = parsed.data.email.toLowerCase();
    if (parsed.data.taxNumber) updatePayload.taxNumber = parsed.data.taxNumber.trim();
    if (parsed.data.creditLimit !== undefined) updatePayload.creditLimit = parsed.data.creditLimit;
    if (parsed.data.status) updatePayload.status = parsed.data.status as ClientStatus;

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: updatePayload,
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    return successResponse({ client: updated });
  } catch {
    return errorResponse('Failed to update client', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin privilege required', 403);
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!existingClient) {
      return errorResponse('Client not found', 404);
    }

    if (existingClient._count.products > 0 || existingClient._count.purchaseOrders > 0) {
      return errorResponse(
        `Cannot delete client with active records (${existingClient._count.products} products, ${existingClient._count.purchaseOrders} purchase orders). Suspend the client instead.`,
        400
      );
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Client removed successfully' });
  } catch {
    return errorResponse('Failed to delete client', 500);
  }
}
