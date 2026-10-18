import { GET as getTasksHandler, POST as createTaskHandler } from '../app/api/governance/route';
import { GET as getTaskHandler } from '../app/api/governance/[id]/route';
import { POST as approveHandler } from '../app/api/governance/[id]/approve/route';
import { POST as rejectHandler } from '../app/api/governance/[id]/reject/route';
import { PUT as overrideHandler } from '../app/api/governance/[id]/override/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';

function createRequest(url: string, method: string, body?: Record<string, unknown>, token?: string): NextRequest {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function runPhase5Tests() {
  console.log('=== Running Backend Phase 5 (Governance & HITL Workflow) DoD Tests ===\n');

  // Obtain tokens
  const managerLogin = await loginHandler(createRequest('/api/auth/login', 'POST', {
    email: 'manager@nexus.com',
    password: 'password123',
  }));
  const managerToken = (await managerLogin.json()).data.token;

  const staffLogin = await loginHandler(createRequest('/api/auth/login', 'POST', {
    email: 'staff@nexus.com',
    password: 'password123',
  }));
  const staffToken = (await staffLogin.json()).data.token;

  // Test 1: GET /api/governance
  console.log('Test 1: Fetching AI workflow queue...');
  let res1 = await getTasksHandler(createRequest('/api/governance', 'GET', undefined, managerToken));
  let data1 = await res1.json();

  let pendingTask = data1.data?.tasks?.find((t: { status: string }) => t.status === 'AWAITING_APPROVAL');

  // If no pending task exists, create one for testing
  if (!pendingTask) {
    const product = await prisma.product.findFirst({ include: { client: true } });
    if (!product) throw new Error('No product found to create task');
    const createdRes = await createTaskHandler(createRequest('/api/governance', 'POST', {
      productId: product.id,
      actionType: 'RESTOCK_PURCHASE_ORDER',
      suggestedQty: 50,
      estimatedCost: product.unitPrice * 50,
      aiConfidence: 92,
      aiReasoning: 'Automated test task for HITL governance pipeline verification.',
      riskScore: 72,
      riskLevel: 'HIGH',
      proposedPayload: { supplierId: product.clientId },
    }, managerToken));
    const createdData = await createdRes.json();
    pendingTask = createdData.data.task;
    res1 = await getTasksHandler(createRequest('/api/governance', 'GET', undefined, managerToken));
    data1 = await res1.json();
  }

  console.log(`Status: ${res1.status} | Total Tasks: ${data1.data?.count} | Pending: ${data1.data?.metrics?.pendingApprovalCount}`);

  // Test 2: Staff attempting to approve task (Role Guard)
  console.log('\nTest 2: Staff attempting to approve AI task (Role Guard test)...');
  const res2 = await approveHandler(createRequest(`/api/governance/${pendingTask.id}/approve`, 'POST', {
    comments: 'Unauthorized staff approval attempt',
  }, staffToken), { params: { id: pendingTask.id } });
  console.log(`Status: ${res2.status} (Staff denied correctly)`);
  if (res2.status !== 403) throw new Error('Expected 403 Forbidden for Staff approving task');

  // Test 3: Staff attempting to reject task (Role Guard)
  console.log('\nTest 3: Staff attempting to reject AI task (Role Guard test)...');
  const res3 = await rejectHandler(createRequest(`/api/governance/${pendingTask.id}/reject`, 'POST', {
    reason: 'Unauthorized staff rejection attempt',
  }, staffToken), { params: { id: pendingTask.id } });
  console.log(`Status: ${res3.status} (Staff denied correctly)`);
  if (res3.status !== 403) throw new Error('Expected 403 Forbidden for Staff rejecting task');

  // Test 4: Manager overriding quantity from 50 to 45
  console.log('\nTest 4: Manager adjusting recommended quantity (Human Override)...');
  const res4 = await overrideHandler(createRequest(`/api/governance/${pendingTask.id}/override`, 'PUT', {
    overrideQuantity: 45,
    reason: 'Warehouse shelf Bay04 capacity constraint limits max intake to 45 units.',
  }, managerToken), { params: { id: pendingTask.id } });
  const data4 = await res4.json();
  console.log(`Status: ${res4.status} | New Qty: ${data4.data?.task?.suggestedQty} | New Cost: $${data4.data?.task?.estimatedCost}`);
  if (res4.status !== 200 || data4.data?.task?.suggestedQty !== 45) {
    throw new Error('Failed to update task suggested quantity');
  }

  // Record initial stock of product before approval
  const prodBefore = await prisma.product.findUnique({ where: { id: pendingTask.productId } });
  const stockBefore = prodBefore?.currentStock || 0;
  console.log(`Initial stock before approval: ${stockBefore}`);

  // Test 5: Manager approving task -> creates PO and updates stock atomically
  console.log('\nTest 5: Manager approving task (Executing HITL Governance pipeline)...');
  const res5 = await approveHandler(createRequest(`/api/governance/${pendingTask.id}/approve`, 'POST', {
    comments: 'Authorized urgent restock under contract #SL-2026.',
  }, managerToken), { params: { id: pendingTask.id } });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status} | Generated PO: ${data5.data?.purchaseOrder?.orderNumber} | Total: $${data5.data?.purchaseOrder?.totalAmount}`);
  console.log(`New Stock: ${data5.data?.product?.currentStock} (Expected: ${stockBefore + 45})`);
  if (res5.status !== 200 || data5.data?.task?.status !== 'EXECUTED' || !data5.data?.purchaseOrder?.orderNumber) {
    throw new Error('Failed to approve task and create PO');
  }
  if (data5.data?.product?.currentStock !== stockBefore + 45) {
    throw new Error('Stock was not incremented correctly upon task approval!');
  }

  // Test 6: Re-approving already executed task should fail safely
  console.log('\nTest 6: Re-approving already executed task (Idempotency Safety)...');
  const res6 = await approveHandler(createRequest(`/api/governance/${pendingTask.id}/approve`, 'POST', {}, managerToken), {
    params: { id: pendingTask.id },
  });
  console.log(`Status: ${res6.status} (Safely rejected duplicate execution)`);
  if (res6.status !== 400) throw new Error('Expected 400 bad request for re-executing task');

  // Test 7: Enqueue a second task to test rejection
  console.log('\nTest 7: Enqueueing a new task for rejection test...');
  const res7 = await createTaskHandler(createRequest('/api/governance', 'POST', {
    productId: pendingTask.productId,
    actionType: 'RESTOCK_PURCHASE_ORDER',
    suggestedQty: 100,
    estimatedCost: 6500,
    aiConfidence: 75,
    aiReasoning: 'Speculative demand spike detected for next quarter.',
    riskScore: 85,
    riskLevel: 'HIGH',
    proposedPayload: { supplierId: pendingTask.product.clientId },
  }, managerToken));
  const data7 = await res7.json();
  const rejectTaskId = data7.data?.task?.id;
  console.log(`Status: ${res7.status} | Enqueued Task ID: ${rejectTaskId}`);
  if (res7.status !== 201 || !rejectTaskId) throw new Error('Failed to create new task');

  // Test 8: Manager rejecting the task
  console.log('\nTest 8: Manager rejecting the task with compliance reasoning...');
  const res8 = await rejectHandler(createRequest(`/api/governance/${rejectTaskId}/reject`, 'POST', {
    reason: 'Rejected: Q4 budget allocation exceeded and inventory holding cost too high.',
  }, managerToken), { params: { id: rejectTaskId } });
  const data8 = await res8.json();
  console.log(`Status: ${res8.status} | Decision: ${data8.data?.decision?.decision} | Comments: ${data8.data?.decision?.comments}`);
  if (res8.status !== 200 || data8.data?.task?.status !== 'REJECTED') {
    throw new Error('Failed to reject task');
  }

  // Verify no purchase order was created for rejected task
  const poCheck = await prisma.purchaseOrder.findUnique({ where: { taskId: rejectTaskId } });
  console.log(`Purchase order for rejected task: ${poCheck ? 'ERROR: PO Exists' : 'NONE (Safe)'}`);
  if (poCheck) throw new Error('Purchase order should not exist for rejected task!');

  console.log('\n🎉 ALL 8 BACKEND PHASE 5 TESTS PASSED WITH 100% SUCCESS!');
}

runPhase5Tests()
  .catch((e) => {
    console.error('Phase 5 Test Failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
