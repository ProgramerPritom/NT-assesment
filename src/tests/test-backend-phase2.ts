import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as meHandler } from '../app/api/auth/me/route';
import { GET as getUsersHandler, POST as createUserHandler } from '../app/api/users/route';
import { GET as getUserHandler, PUT as updateUserHandler, DELETE as deleteUserHandler } from '../app/api/users/[id]/route';
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

async function runPhase2Tests() {
  console.log('=== Running Backend Phase 2 DoD Tests ===\n');

  // Test 1: Invalid login
  console.log('Test 1: Login with invalid password...');
  const req1 = createRequest('/api/auth/login', 'POST', {
    email: 'admin@nexus.com',
    password: 'wrong_password_123',
  });
  const res1 = await loginHandler(req1);
  const data1 = await res1.json();
  console.log(`Status: ${res1.status} | Error: ${data1.error}`);
  if (res1.status !== 401) throw new Error('Expected 401 for invalid credentials');

  // Test 2: Valid Admin login
  console.log('\nTest 2: Login with valid admin credentials...');
  const req2 = createRequest('/api/auth/login', 'POST', {
    email: 'admin@nexus.com',
    password: 'password123',
  });
  const res2 = await loginHandler(req2);
  const data2 = await res2.json();
  const adminToken = data2.data?.token;
  console.log(`Status: ${res2.status} | User: ${data2.data?.user?.email} | Role: ${data2.data?.user?.role}`);
  if (res2.status !== 200 || !adminToken) throw new Error('Expected 200 and token for valid login');

  // Also login as Staff
  console.log('\nLogging in as Staff...');
  const reqStaff = createRequest('/api/auth/login', 'POST', {
    email: 'staff@nexus.com',
    password: 'password123',
  });
  const resStaff = await loginHandler(reqStaff);
  const dataStaff = await resStaff.json();
  const staffToken = dataStaff.data?.token;

  // Test 3: /api/auth/me
  console.log('\nTest 3: Fetching /api/auth/me session with Admin token...');
  const req3 = createRequest('/api/auth/me', 'GET', undefined, adminToken);
  const res3 = await meHandler(req3);
  const data3 = await res3.json();
  console.log(`Status: ${res3.status} | Session User: ${data3.data?.user?.email}`);
  if (res3.status !== 200 || data3.data?.user?.email !== 'admin@nexus.com') {
    throw new Error('Failed to retrieve active session');
  }

  // Test 4: Non-admin trying to create user
  console.log('\nTest 4: Staff trying to create user (Role Guard test)...');
  const req4 = createRequest('/api/users', 'POST', {
    name: 'Unauthorized User',
    email: 'unauth@nexus.com',
    password: 'password123',
    role: 'STAFF',
  }, staffToken);
  const res4 = await createUserHandler(req4);
  console.log(`Status: ${res4.status}`);
  if (res4.status !== 403) throw new Error('Expected 403 Forbidden for Staff creating user');

  // Test 5: Admin creating user
  console.log('\nTest 5: Admin creating new user (test_user@nexus.com)...');
  const req5 = createRequest('/api/users', 'POST', {
    name: 'Test Technician',
    email: 'test_tech@nexus.com',
    password: 'password123',
    role: 'STAFF',
  }, adminToken);
  const res5 = await createUserHandler(req5);
  const data5 = await res5.json();
  const createdUserId = data5.data?.user?.id;
  console.log(`Status: ${res5.status} | Created ID: ${createdUserId}`);
  if (res5.status !== 201 || !createdUserId) throw new Error('Failed to create user as Admin');

  // Test 6: Admin updating user
  console.log('\nTest 6: Admin promoting user to MANAGER...');
  const req6 = createRequest(`/api/users/${createdUserId}`, 'PUT', {
    role: 'MANAGER',
  }, adminToken);
  const res6 = await updateUserHandler(req6, { params: { id: createdUserId } });
  const data6 = await res6.json();
  console.log(`Status: ${res6.status} | New Role: ${data6.data?.user?.role}`);
  if (res6.status !== 200 || data6.data?.user?.role !== 'MANAGER') {
    throw new Error('Failed to update user role');
  }

  // Test 7: Admin trying to delete own account
  console.log('\nTest 7: Admin trying to delete own account...');
  const req7 = createRequest(`/api/users/${data2.data.user.id}`, 'DELETE', undefined, adminToken);
  const res7 = await deleteUserHandler(req7, { params: { id: data2.data.user.id } });
  console.log(`Status: ${res7.status} (Self-deletion prevention verified)`);
  if (res7.status !== 400) throw new Error('Expected 400 for self-deletion');

  // Test 8: Admin deleting created user
  console.log('\nTest 8: Admin deleting test user...');
  const req8 = createRequest(`/api/users/${createdUserId}`, 'DELETE', undefined, adminToken);
  const res8 = await deleteUserHandler(req8, { params: { id: createdUserId } });
  console.log(`Status: ${res8.status} | Deleted successfully`);
  if (res8.status !== 200) throw new Error('Failed to delete user');

  console.log('\n🎉 ALL 8 BACKEND PHASE 2 TESTS PASSED WITH 100% SUCCESS!');
}

runPhase2Tests().catch((e) => {
  console.error('Phase 2 Test Failure:', e);
  process.exit(1);
});
