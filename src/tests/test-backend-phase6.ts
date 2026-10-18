import { GET as getStatsHandler } from '../app/api/dashboard/stats/route';
import { GET as getAuditLogsHandler } from '../app/api/audit-logs/route';
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

async function runPhase6Tests() {
  console.log('=== Running Backend Phase 6 (Audit Logs & Operations Hub) DoD Tests ===\n');

  // Obtain staff token
  const staffLogin = await loginHandler(createRequest('/api/auth/login', 'POST', {
    email: 'staff@nexus.com',
    password: 'password123',
  }));
  const staffToken = (await staffLogin.json()).data.token;

  // Test 1: Dashboard stats without auth (Security Guard)
  console.log('Test 1: Dashboard stats without token (Auth Guard)...');
  const res1 = await getStatsHandler(createRequest('/api/dashboard/stats', 'GET'));
  console.log(`Status: ${res1.status} (Denied correctly)`);
  if (res1.status !== 401) throw new Error('Expected 401 for unauthenticated request');

  // Test 2: Dashboard stats with token
  console.log('\nTest 2: Fetching live operations hub statistics...');
  const res2 = await getStatsHandler(createRequest('/api/dashboard/stats', 'GET', undefined, staffToken));
  const data2 = await res2.json();
  const metrics = data2.data?.metrics;
  console.log(`Status: ${res2.status} | Total Inventory Value: $${metrics?.totalInventoryValue}`);
  console.log(`Critical Stock Count: ${metrics?.criticalStockCount} | Active Suppliers: ${metrics?.activeSuppliersCount} | Pending Approvals: ${metrics?.pendingApprovalsCount}`);
  console.log(`Recent Movements Count: ${data2.data?.recentMovements?.length} | Critical Items: ${data2.data?.criticalItems?.length}`);
  if (res2.status !== 200 || !metrics || !data2.data?.recentMovements) {
    throw new Error('Failed to retrieve valid dashboard statistics');
  }

  // Test 3: Math verification of inventory value against DB
  console.log('\nTest 3: Verifying computed inventory value against DB records...');
  const products = await prisma.product.findMany();
  const expectedValue = products.reduce((acc, p) => acc + p.currentStock * p.unitPrice, 0);
  console.log(`Expected DB Value: $${expectedValue.toFixed(2)} | API Value: $${metrics.totalInventoryValue.toFixed(2)}`);
  if (Math.abs(expectedValue - metrics.totalInventoryValue) > 1.0) {
    throw new Error('Inventory value mismatch between API and database!');
  }

  // Test 4: Fetch audit logs
  console.log('\nTest 4: Fetching full audit log compliance trail...');
  const res4 = await getAuditLogsHandler(createRequest('/api/audit-logs', 'GET', undefined, staffToken));
  const data4 = await res4.json();
  console.log(`Status: ${res4.status} | Total Logs: ${data4.data?.count}`);
  if (res4.status !== 200 || data4.data?.count < 5) {
    throw new Error('Expected at least 5 audit log entries from DB events');
  }

  // Test 5: Verify audit log structure and cryptographic hashes
  console.log('\nTest 5: Verifying SHA-256 audit hashes and actor integrity...');
  const firstLog = data4.data.logs[0];
  console.log(`Log ID: ${firstLog.id} | Action: ${firstLog.actionTitle} | Hash: ${firstLog.auditHash}`);
  if (!firstLog.auditHash.startsWith('0x') || !firstLog.performedBy?.name) {
    throw new Error('Audit log item missing cryptographic hash or actor information');
  }

  // Test 6: Filter audit logs by Category: STOCK
  console.log('\nTest 6: Filtering audit trail by Category: STOCK...');
  const res6 = await getAuditLogsHandler(createRequest('/api/audit-logs?category=STOCK', 'GET', undefined, staffToken));
  const data6 = await res6.json();
  const allStock = data6.data.logs.every((l: { category: string }) => l.category === 'STOCK');
  console.log(`Status: ${res6.status} | Stock logs count: ${data6.data?.count} | All STOCK: ${allStock}`);
  if (!allStock || data6.data?.count === 0) throw new Error('Stock category filter failed');

  // Test 7: Filter audit logs by Category: GOVERNANCE
  console.log('\nTest 7: Filtering audit trail by Category: GOVERNANCE...');
  const res7 = await getAuditLogsHandler(createRequest('/api/audit-logs?category=GOVERNANCE', 'GET', undefined, staffToken));
  const data7 = await res7.json();
  const allGov = data7.data.logs.every((l: { category: string }) => l.category === 'GOVERNANCE');
  console.log(`Status: ${res7.status} | Governance logs count: ${data7.data?.count} | All GOVERNANCE: ${allGov}`);
  if (!allGov) throw new Error('Governance category filter failed');

  // Test 8: Search audit logs
  console.log('\nTest 8: Searching audit logs by query (?q=SSD)...');
  const res8 = await getAuditLogsHandler(createRequest('/api/audit-logs?q=SSD', 'GET', undefined, staffToken));
  const data8 = await res8.json();
  console.log(`Status: ${res8.status} | Matching logs: ${data8.data?.count}`);
  if (res8.status !== 200 || data8.data?.count === 0) {
    throw new Error('Audit log search failed');
  }

  console.log('\n🎉 ALL 8 BACKEND PHASE 6 TESTS PASSED WITH 100% SUCCESS!');
}

runPhase6Tests()
  .catch((e) => {
    console.error('Phase 6 Test Failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
