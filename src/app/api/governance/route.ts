import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type TaskStatus = 'QUEUED' | 'ANALYZING' | 'AWAITING_APPROVAL' | 'EXECUTED' | 'REJECTED' | 'FAILED';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const createTaskSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  actionType: z.string().default('RESTOCK_PURCHASE_ORDER'),
  suggestedQty: z.number().int().positive('Quantity must be greater than zero'),
  estimatedCost: z.number().positive(),
  aiConfidence: z.number().int().min(0).max(100),
  aiReasoning: z.string().min(5),
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  proposedPayload: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const riskParam = searchParams.get('riskLevel');
    const query = searchParams.get('q');

    const whereClause: {
      status?: TaskStatus;
      riskLevel?: RiskLevel;
      OR?: Array<{
        aiReasoning?: { contains: string; mode: 'insensitive' };
        product?: {
          OR?: Array<{
            name?: { contains: string; mode: 'insensitive' };
            sku?: { contains: string; mode: 'insensitive' };
          }>;
        };
      }>;
    } = {};

    if (statusParam && statusParam !== 'ALL') {
      whereClause.status = statusParam as TaskStatus;
    }

    if (riskParam && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskParam)) {
      whereClause.riskLevel = riskParam as RiskLevel;
    }

    if (query) {
      whereClause.OR = [
        { aiReasoning: { contains: query, mode: 'insensitive' } },
        {
          product: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const tasks = await prisma.aIWorkflowTask.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            client: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        decision: {
          include: {
            decidedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        purchaseOrder: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingCount = await prisma.aIWorkflowTask.count({
      where: { status: 'AWAITING_APPROVAL' },
    });

    const highRiskCount = await prisma.aIWorkflowTask.count({
      where: {
        status: 'AWAITING_APPROVAL',
        riskLevel: { in: ['HIGH', 'CRITICAL'] },
      },
    });

    return successResponse({
      tasks,
      count: tasks.length,
      metrics: {
        pendingApprovalCount: pendingCount,
        highRiskCount,
      },
    });
  } catch {
    return errorResponse('Failed to fetch governance workflow queue', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid workflow task data', 400);
    }

    const {
      productId,
      actionType,
      suggestedQty,
      estimatedCost,
      aiConfidence,
      aiReasoning,
      riskScore,
      riskLevel,
      proposedPayload,
    } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Referenced product not found', 404);
    }

    const task = await prisma.aIWorkflowTask.create({
      data: {
        productId,
        actionType,
        suggestedQty,
        estimatedCost,
        aiConfidence,
        aiReasoning,
        riskScore,
        riskLevel: riskLevel as RiskLevel,
        status: 'AWAITING_APPROVAL',
        proposedPayload: JSON.stringify(proposedPayload),
      },
      include: {
        product: true,
      },
    });

    return successResponse({ task }, 201);
  } catch {
    return errorResponse('Failed to enqueue AI workflow task', 500);
  }
}
