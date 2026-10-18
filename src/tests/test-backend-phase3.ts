import { GET as getClientsHandler, POST as createClientHandler } from '../app/api/clients/route';
import { GET as getClientHandler, PUT as updateClientHandler, DELETE as deleteClientHandler } from '../app/api/clients/[id]/route';
import { PATCH as updateClientStatusHandler } from '../app/api/clients/[id]/status/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { NextRequest } from 'next/server';

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

async function runPhase3Tests() {
  console.log('=== Running Backend Phase 3 (Client Management) DoD Tests ===\n');

  // Obtain tokens for Manager and Staff
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

  const adminLogin = await loginHandler(createRequest('/api/auth/login', 'POST', {
    email: 'admin@nexus.com',
    password: 'password123',
  }));
  const adminToken = (await adminLogin.json()).data.token;

  // Test 1: GET /api/clients
  console.log('Test 1: Manager fetching all clients...');
  const res1 = await getClientsHandler(createRequest('/api/clients', 'GET', undefined, managerToken));
  const data1 = await res1.json();
  console.log(`Status: ${res1.status} | Clients count: ${data1.data?.count}`);
  if (res1.status !== 200 || data1.data?.count < 4) {
    throw new Error('Expected at least 4 seeded clients');
  }

  // Find FastTrack Cargo (PENDING_VERIFICATION)
  const pendingClient = data1.data.clients.find((c: { taxNumber: string }) => c.taxNumber === 'TAX-FT-11920');
  const activeClient = data1.data.clients.find((c: { taxNumber: string }) => c.taxNumber === 'TAX-SL-90812');

  // Test 2: Staff attempting to POST client (Role Guard)
  console.log('\nTest 2: Staff attempting to register a client (Role Guard test)...');
  const res2 = await createClientHandler(createRequest('/api/clients', 'POST', {
    name: 'Unauthorized Supply Co',
    email: 'unauth@supply.com',
    taxNumber: 'TAX-UNAUTH-01',
  }, staffToken));
  console.log(`Status: ${res2.status} (Staff denied correctly)`);
  if (res2.status !== 403) throw new Error('Expected 403 Forbidden for Staff');

  // Test 3: Duplicate Tax Number Conflict Check
  console.log('\nTest 3: Manager attempting duplicate Tax Number registration...');
  const res3 = await createClientHandler(createRequest('/api/clients', 'POST', {
    name: 'Duplicate Tax Co',
    email: 'duplicate@taxco.com',
    taxNumber: 'TAX-SL-90812', // Already belongs to Silicon Logistics
  }, managerToken));
  const data3 = await res3.json();
  console.log(`Status: ${res3.status} | Conflict Error: ${data3.error}`);
  if (res3.status !== 409) throw new Error('Expected 409 Conflict for duplicate taxNumber');

  // Test 4: Manager successfully creating a new client
  console.log('\nTest 4: Manager registering valid new client (Apex Components)...');
  const res4 = await createClientHandler(createRequest('/api/clients', 'POST', {
    name: 'Apex Components Inc',
    email: 'procure@apexcomp.io',
    taxNumber: 'TAX-APEX-9988',
    creditLimit: 50000,
    status: 'PENDING_VERIFICATION',
  }, managerToken));
  const data4 = await res4.json();
  const createdClientId = data4.data?.client?.id;
  console.log(`Status: ${res4.status} | Created ID: ${createdClientId}`);
  if (res4.status !== 201 || !createdClientId) throw new Error('Failed to create new client');

  // Test 5: GET single client details
  console.log('\nTest 5: Fetching single client details with product count...');
  const res5 = await getClientHandler(createRequest(`/api/clients/${activeClient.id}`, 'GET', undefined, managerToken), {
    params: { id: activeClient.id },
  });
  const data5 = await res5.json();
  console.log(`Status: ${res5.status} | Client: ${data5.data?.client?.name} | Products: ${data5.data?.client?.products?.length}`);
  if (res5.status !== 200 || !data5.data?.client?.products) throw new Error('Failed to get client details');

  // Test 6: Staff attempting to update client status (Role Guard)
  console.log('\nTest 6: Staff attempting to update client status (Role Guard test)...');
  const res6 = await updateClientStatusHandler(createRequest(`/api/clients/${pendingClient.id}/status`, 'PATCH', {
    status: 'ACTIVE',
  }, staffToken), { params: { id: pendingClient.id } });
  console.log(`Status: ${res6.status} (Staff denied status alteration)`);
  if (res6.status !== 403) throw new Error('Expected 403 Forbidden for Staff');

  // Test 7: Manager transitioning client from PENDING_VERIFICATION to ACTIVE
  console.log('\nTest 7: Manager activating FastTrack Cargo (State Machine Transition)...');
  const res7 = await updateClientStatusHandler(createRequest(`/api/clients/${pendingClient.id}/status`, 'PATCH', {
    status: 'ACTIVE',
    note: 'KYC verified and business tax documentation approved.',
  }, managerToken), { params: { id: pendingClient.id } });
  const data7 = await res7.json();
  console.log(`Status: ${res7.status} | New Status: ${data7.data?.client?.status}`);
  if (res7.status !== 200 || data7.data?.client?.status !== 'ACTIVE') {
    throw new Error('Failed to transition client status to ACTIVE');
  }

  // Test 8: Manager suspending client
  console.log('\nTest 8: Manager transitioning Apex Components to SUSPENDED...');
  const res8 = await updateClientStatusHandler(createRequest(`/api/clients/${createdClientId}/status`, 'PATCH', {
    status: 'SUSPENDED',
    note: 'Compliance audit hold.',
  }, managerToken), { params: { id: createdClientId } });
  const data8 = await res8.json();
  console.log(`Status: ${res8.status} | Status: ${data8.data?.client?.status}`);
  if (res8.status !== 200 || data8.data?.client?.status !== 'SUSPENDED') {
    throw new Error('Failed to transition status to SUSPENDED');
  }

  // Test 9: Deleting client with products (Safety check)
  console.log('\nTest 9: Attempting to delete client with active products (Safety Guard)...');
  const res9 = await deleteClientHandler(createRequest(`/api/clients/${activeClient.id}`, 'DELETE', undefined, adminToken), {
    params: { id: activeClient.id },
  });
  console.log(`Status: ${res9.status} (Prevented deletion of active supplier)`);
  if (res9.status !== 400) throw new Error('Expected 400 bad request for deleting client with active products');

  // Test 10: Admin deleting newly created empty client
  console.log('\nTest 10: Admin deleting created empty client...');
  const res10 = await deleteClientHandler(createRequest(`/api/clients/${createdClientId}`, 'DELETE', undefined, adminToken), {
    params: { id: createdClientId },
  });
  console.log(`Status: ${res10.status} | Removed successfully`);
  if (res10.status !== 200) throw new Error('Failed to delete empty client');

  console.log('\n🎉 ALL 10 BACKEND PHASE 3 TESTS PASSED WITH 100% SUCCESS!');
}

runPhase3Tests().catch((e) => {
  console.error('Phase 3 Test Failure:', e);
  process.exit(1);
});
