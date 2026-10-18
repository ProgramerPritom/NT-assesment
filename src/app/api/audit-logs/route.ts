import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AuditLogItem } from '@/types/audit';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const query = searchParams.get('q');

    // Fetch movements (Category: STOCK)
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Fetch approval decisions (Category: GOVERNANCE)
    const decisions = await prisma.approvalDecision.findMany({
      include: {
        task: {
          include: { product: true },
        },
        decidedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Fetch clients (Category: CLIENT)
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    const logs: AuditLogItem[] = [];

    // Map Stock Movements
    for (const m of movements) {
      const isCritical = m.type === 'STOCK_OUT' && m.quantity > 20;
      const hash = crypto.createHash('sha256').update(`${m.id}:${m.productId}:${m.quantity}:${m.createdAt.toISOString()}`).digest('hex').slice(0, 16);

      logs.push({
        id: `aud-mov-${m.id}`,
        actionType: m.type === 'STOCK_IN' ? 'STOCK_IN' : m.type === 'STOCK_OUT' ? 'STOCK_OUT' : 'STOCK_ADJUSTMENT',
        category: 'STOCK',
        actionTitle: `${m.type === 'STOCK_IN' ? 'Stock Intake' : m.type === 'STOCK_OUT' ? 'Stock Dispatch' : 'Physical Adjustment'}: ${m.quantity} units`,
        entityType: 'Product SKU',
        entityName: m.product.name,
        entityId: m.product.sku,
        performedBy: {
          name: m.user?.name || 'Warehouse Operator',
          email: m.user?.email || 'ops@nexus.com',
          role: m.user?.role || 'STAFF',
        },
        details: m.reason,
        ipAddress: '10.14.0.82',
        auditHash: `0x${hash}`,
        timestamp: m.createdAt.toISOString(),
        severity: isCritical ? 'WARNING' : 'NORMAL',
      });
    }

    // Map Governance Decisions
    for (const d of decisions) {
      const isApproved = d.decision === 'APPROVED';
      const hash = crypto.createHash('sha256').update(`${d.id}:${d.taskId}:${d.decision}:${d.createdAt.toISOString()}`).digest('hex').slice(0, 16);

      logs.push({
        id: `aud-gov-${d.id}`,
        actionType: isApproved ? 'AI_TASK_APPROVED' : 'AI_TASK_REJECTED',
        category: 'GOVERNANCE',
        actionTitle: isApproved ? 'AI Restock Recommendation Authorized' : 'AI Restock Recommendation Rejected',
        entityType: 'AI Workflow Task',
        entityName: d.task.product?.name || 'Autonomous Restock Pipeline',
        entityId: d.taskId,
        performedBy: {
          name: d.decidedBy?.name || 'Ops Manager',
          email: d.decidedBy?.email || 'manager@nexus.com',
          role: d.decidedBy?.role || 'MANAGER',
        },
        details: d.comments || (isApproved ? 'Approved via HITL review' : 'Rejected via operations review'),
        ipAddress: '192.168.1.105',
        auditHash: `0x${hash}`,
        timestamp: d.createdAt.toISOString(),
        severity: isApproved ? 'NORMAL' : 'WARNING',
      });
    }

    // Map Client status/creations
    for (const c of clients) {
      const hash = crypto.createHash('sha256').update(`${c.id}:${c.status}:${c.updatedAt.toISOString()}`).digest('hex').slice(0, 16);

      let actionType: 'CLIENT_ACTIVATED' | 'CLIENT_SUSPENDED' | 'CLIENT_REGISTERED' = 'CLIENT_REGISTERED';
      let sev: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';

      if (c.status === 'ACTIVE') {
        actionType = 'CLIENT_ACTIVATED';
      } else if (c.status === 'SUSPENDED') {
        actionType = 'CLIENT_SUSPENDED';
        sev = 'CRITICAL';
      }

      logs.push({
        id: `aud-cli-${c.id}`,
        actionType,
        category: 'CLIENT',
        actionTitle: `Vendor Partner Record: ${c.name} (${c.status})`,
        entityType: 'Supplier Account',
        entityName: c.name,
        entityId: c.taxNumber,
        performedBy: {
          name: 'Compliance Officer',
          email: 'compliance@nexus.com',
          role: 'ADMIN',
        },
        details: `Vendor EIN: ${c.taxNumber} with credit terms $${c.creditLimit.toLocaleString()}`,
        ipAddress: '172.16.4.12',
        auditHash: `0x${hash}`,
        timestamp: c.updatedAt.toISOString(),
        severity: sev,
      });
    }

    // Sort chronologically descending
    let sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply Filters
    if (category && category !== 'ALL') {
      sortedLogs = sortedLogs.filter((l) => l.category === category);
    }

    if (severity && severity !== 'ALL') {
      sortedLogs = sortedLogs.filter((l) => l.severity === severity);
    }

    if (query) {
      const q = query.toLowerCase();
      sortedLogs = sortedLogs.filter(
        (l) =>
          l.actionTitle.toLowerCase().includes(q) ||
          l.entityName.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          l.performedBy.name.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }

    return successResponse({
      logs: sortedLogs,
      count: sortedLogs.length,
      categories: ['ALL', 'STOCK', 'GOVERNANCE', 'CLIENT', 'SECURITY'],
    });
  } catch {
    return errorResponse('Failed to fetch audit log trail', 500);
  }
}
