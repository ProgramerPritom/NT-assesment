import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type ClientStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

const createClientSchema = z.object({
  name: z.string().min(2, 'Company/Client name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  taxNumber: z.string().min(3, 'Tax identification number is required'),
  creditLimit: z.number().min(0).default(10000),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED']).default('PENDING_VERIFICATION'),
});

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const query = searchParams.get('q');

    const whereClause: {
      status?: ClientStatus;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        taxNumber?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (statusParam && ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED'].includes(statusParam)) {
      whereClause.status = statusParam as ClientStatus;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { taxNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: true,
            purchaseOrders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ clients, count: clients.length });
  } catch {
    return errorResponse('Failed to fetch clients', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    if (auth.role === 'STAFF') {
      return errorResponse('Forbidden: Manager or Admin authorization required', 403);
    }

    const body = await req.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input data', 400);
    }

    const { name, email, taxNumber, creditLimit, status } = parsed.data;

    // Check for duplicate email or taxNumber
    const existing = await prisma.client.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { taxNumber: taxNumber.trim() },
        ],
      },
    });

    if (existing) {
      const field = existing.email.toLowerCase() === email.toLowerCase() ? 'Email' : 'Tax Number';
      return errorResponse(`${field} is already registered to another client/supplier`, 409);
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email.toLowerCase(),
        taxNumber: taxNumber.trim(),
        creditLimit,
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

    return successResponse({ client }, 201);
  } catch {
    return errorResponse('Failed to create client', 500);
  }
}
