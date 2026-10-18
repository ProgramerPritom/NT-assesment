import { GET as getProductsHandler, POST as createProductHandler } from '../app/api/products/route';
import { GET as getProductHandler, PUT as updateProductHandler, DELETE as deleteProductHandler } from '../app/api/products/[id]/route';
import { POST as recordMovementHandler } from '../app/api/products/[id]/movement/route';
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

async function runPhase4Tests() {
  console.log('=== Running Backend Phase 4 (Products & Stock Ledger) DoD Tests ===\n');

  // Obtain tokens for Manager, Staff, Admin
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

  // Test 1: GET /api/products
  console.log('Test 1: Fetching all products and inventory value...');
  const res1 = await getProductsHandler(createRequest('/api/products', 'GET', undefined, staffToken));
  const data1 = await res1.json();
  console.log(`Status: ${res1.status} | Total Products: ${data1.data?.count} | Value: $${data1.data?.totalInventoryValue}`);
  if (res1.status !== 200 || data1.data?.count < 10) {
    throw new Error('Expected at least 10 seeded products');
  }

  // Test 2: Filter by CRITICAL stock
  console.log('\nTest 2: Querying CRITICAL low-stock products...');
  const res2 = await getProductsHandler(createRequest('/api/products?stockStatus=CRITICAL', 'GET', undefined, staffToken));
  const data2 = await res2.json();
  console.log(`Status: ${res2.status} | Critical count: ${data2.data?.count}`);
  const criticalSkus = data2.data.products.map((p: { sku: string }) => p.sku);
  console.log('Critical items:', criticalSkus.join(', '));
  if (!criticalSkus.includes('SSD-1TB-CRUCIAL')) {
    throw new Error('Crucial SSD must be marked as CRITICAL low stock');
  }

  // Test 3: Staff attempting to POST product (Role Guard)
  console.log('\nTest 3: Staff attempting to add new product (Role Guard)...');
  const res3 = await createProductHandler(createRequest('/api/products', 'POST', {
    sku: 'UNAUTH-SKU-01',
    name: 'Unauthorized Item',
    category: 'Peripherals',
    unitPrice: 50,
  }, staffToken));
  console.log(`Status: ${res3.status} (Staff denied correctly)`);
  if (res3.status !== 403) throw new Error('Expected 403 Forbidden for Staff');

  // Test 4: Duplicate SKU Check
  console.log('\nTest 4: Registering duplicate SKU (Conflict Check)...');
  const res4 = await createProductHandler(createRequest('/api/products', 'POST', {
    sku: 'SSD-1TB-CRUCIAL', // Already exists!
    name: 'Duplicate Crucial SSD',
    category: 'Storage',
    unitPrice: 65,
  }, managerToken));
  const data4 = await res4.json();
  console.log(`Status: ${res4.status} | Conflict Message: ${data4.error}`);
  if (res4.status !== 409) throw new Error('Expected 409 Conflict for duplicate SKU');

  // Test 5: Manager creating new product with initial stock 10
  console.log('\nTest 5: Manager creating valid new product with initial stock 10...');
  const res5 = await createProductHandler(createRequest('/api/products', 'POST', {
    sku: 'GPU-RTX4080-16G',
    name: 'ASUS ROG Strix GeForce RTX 4080 16GB',
    category: 'Computing & Graphics',
    unitPrice: 1199.99,
    currentStock: 10,
    minSafetyStock: 5,
    warehouseBin: 'Zone-A3-Bay07',
  }, managerToken));
  const data5 = await res5.json();
  const createdProductId = data5.data?.product?.id;
  console.log(`Status: ${res5.status} | Created ID: ${createdProductId} | Stock: ${data5.data?.product?.currentStock}`);
  if (res5.status !== 201 || !createdProductId) throw new Error('Failed to create new product');

  // Test 6: GET product details with ledger history
  console.log('\nTest 6: Checking product details and initial stock ledger entry...');
  const res6 = await getProductHandler(createRequest(`/api/products/${createdProductId}`, 'GET', undefined, staffToken), {
    params: { id: createdProductId },
  });
  const data6 = await res6.json();
  const initialMovements = data6.data?.product?.movements;
  console.log(`Status: ${res6.status} | Ledger movements count: ${initialMovements?.length}`);
  if (res6.status !== 200 || initialMovements?.length < 1) {
    throw new Error('Initial stock movement was not recorded in ledger!');
  }

  // Test 7: Insufficient stock error guard
  console.log('\nTest 7: Attempting STOCK_OUT of 15 units when only 10 available (Negative Stock Guard)...');
  const res7 = await recordMovementHandler(createRequest(`/api/products/${createdProductId}/movement`, 'POST', {
    type: 'STOCK_OUT',
    quantity: 15,
    reason: 'Client wholesale bulk order #BULK-9901',
  }, staffToken), { params: { id: createdProductId } });
  const data7 = await res7.json();
  console.log(`Status: ${res7.status} | Insufficient Stock Error: ${data7.error}`);
  if (res7.status !== 400 || data7.code !== 'INSUFFICIENT_STOCK') {
    throw new Error('Expected 400 INSUFFICIENT_STOCK error');
  }

  // Test 8: Valid STOCK_OUT of 3 units
  console.log('\nTest 8: Staff executing valid STOCK_OUT of 3 units...');
  const res8 = await recordMovementHandler(createRequest(`/api/products/${createdProductId}/movement`, 'POST', {
    type: 'STOCK_OUT',
    quantity: 3,
    reason: 'Order fulfillment pack station #4',
  }, staffToken), { params: { id: createdProductId } });
  const data8 = await res8.json();
  console.log(`Status: ${res8.status} | Remaining Stock: ${data8.data?.product?.currentStock}`);
  if (res8.status !== 200 || data8.data?.product?.currentStock !== 7) {
    throw new Error('Expected current stock to be exactly 7 units (10 - 3)');
  }

  // Test 9: Valid STOCK_IN of 5 units
  console.log('\nTest 9: Staff executing STOCK_IN of 5 units...');
  const res9 = await recordMovementHandler(createRequest(`/api/products/${createdProductId}/movement`, 'POST', {
    type: 'STOCK_IN',
    quantity: 5,
    reason: 'Supplier replenishment dock receiving',
  }, staffToken), { params: { id: createdProductId } });
  const data9 = await res9.json();
  console.log(`Status: ${res9.status} | Updated Stock: ${data9.data?.product?.currentStock}`);
  if (res9.status !== 200 || data9.data?.product?.currentStock !== 12) {
    throw new Error('Expected current stock to be exactly 12 units (7 + 5)');
  }

  // Test 10: Admin deleting created test product
  console.log('\nTest 10: Admin deleting created test product...');
  const res10 = await deleteProductHandler(createRequest(`/api/products/${createdProductId}`, 'DELETE', undefined, adminToken), {
    params: { id: createdProductId },
  });
  console.log(`Status: ${res10.status} | Deleted successfully`);
  if (res10.status !== 200) throw new Error('Failed to delete test product');

  console.log('\n🎉 ALL 10 BACKEND PHASE 4 TESTS PASSED WITH 100% SUCCESS!');
}

runPhase4Tests().catch((e) => {
  console.error('Phase 4 Test Failure:', e);
  process.exit(1);
});
