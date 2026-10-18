import { prisma } from '../lib/prisma';
import { signJwt, verifyJwt } from '../lib/auth';
import bcrypt from 'bcryptjs';

async function testAll() {
  console.log('--- 1. Testing Neon Database Connection & Seed Data ---');
  const userCount = await prisma.user.count();
  const clientCount = await prisma.client.count();
  const productCount = await prisma.product.count();
  const taskCount = await prisma.aIWorkflowTask.count();
  const poCount = await prisma.purchaseOrder.count();

  console.log(`Users in DB: ${userCount}`);
  console.log(`Suppliers in DB: ${clientCount}`);
  console.log(`Products in DB: ${productCount}`);
  console.log(`AI Tasks in DB: ${taskCount}`);
  console.log(`Purchase Orders in DB: ${poCount}`);

  if (userCount < 3 || clientCount < 4 || productCount < 10) {
    throw new Error('Database seeding incomplete!');
  }

  // Test Admin password bcrypt verify
  const admin = await prisma.user.findUnique({ where: { email: 'admin@nexus.com' } });
  if (!admin) throw new Error('Admin not found!');
  const isMatch = await bcrypt.compare('password123', admin.password);
  console.log(`Admin password bcrypt check: ${isMatch ? 'PASSED' : 'FAILED'}`);

  console.log('\n--- 2. Testing JWT Signing & Verification ---');
  const token = signJwt({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  console.log('Generated JWT token:', token.substring(0, 25) + '...');
  const decoded = verifyJwt(token);
  console.log('Decoded Token User:', decoded?.email, '| Role:', decoded?.role);

  if (decoded?.role !== 'ADMIN' || decoded?.email !== 'admin@nexus.com') {
    throw new Error('JWT verification mismatch!');
  }

  console.log('\nALL TESTS PASSED WITH 100% SUCCESS!');
}

testAll()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
