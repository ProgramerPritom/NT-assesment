import { PrismaClient, Role, ClientStatus, MovementType, RiskLevel, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NexusWMS database...');

  // Clean existing tables (in order of relations)
  await prisma.approvalDecision.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.aIWorkflowTask.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexus.com',
      password: passwordHash,
      name: 'Alex Rivera (Admin)',
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@nexus.com',
      password: passwordHash,
      name: 'Sarah Chen (Ops Manager)',
      role: Role.MANAGER,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@nexus.com',
      password: passwordHash,
      name: 'Marcus Brody (Floor Lead)',
      role: Role.STAFF,
    },
  });

  console.log('Created 3 demo users.');

  // 2. Create Clients / Suppliers
  const client1 = await prisma.client.create({
    data: {
      name: 'Silicon Logistics',
      email: 'contact@siliconlogistics.com',
      taxNumber: 'TAX-SL-90812',
      status: ClientStatus.ACTIVE,
      creditLimit: 75000,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Global Cloud Hardware',
      email: 'supply@globalcloudhw.com',
      taxNumber: 'TAX-GC-44102',
      status: ClientStatus.ACTIVE,
      creditLimit: 120000,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'FastTrack Cargo',
      email: 'billing@fasttrackcargo.io',
      taxNumber: 'TAX-FT-11920',
      status: ClientStatus.PENDING_VERIFICATION,
      creditLimit: 25000,
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: 'Shady Tech Ltd',
      email: 'disputed@shadytech.biz',
      taxNumber: 'TAX-ST-00341',
      status: ClientStatus.SUSPENDED,
      creditLimit: 5000,
    },
  });

  console.log('Created 4 suppliers.');

  // 3. Create Warehouse Products
  const productsData = [
    {
      sku: 'SSD-1TB-CRUCIAL',
      name: 'Crucial P3 1TB NVMe PCIe M.2 SSD',
      category: 'Storage Components',
      unitPrice: 65.0,
      currentStock: 4, // Critical stock!
      minSafetyStock: 30,
      warehouseBin: 'Zone-A1-Bay04',
      clientId: client1.id,
    },
    {
      sku: 'SCANNER-BAR-ZEBRA',
      name: 'Zebra TC26 Handheld Barcode Scanner',
      category: 'Warehouse Equipment',
      unitPrice: 320.0,
      currentStock: 6, // Low stock!
      minSafetyStock: 20,
      warehouseBin: 'Zone-A2-Bay01',
      clientId: client2.id,
    },
    {
      sku: 'RAM-DDR5-32GB',
      name: 'Corsair Vengeance 32GB DDR5 5600MHz',
      category: 'Memory & Computing',
      unitPrice: 98.0,
      currentStock: 145,
      minSafetyStock: 25,
      warehouseBin: 'Zone-B1-Bay12',
      clientId: client1.id,
    },
    {
      sku: 'SW-CAT6-1000FT',
      name: 'Cat6 UTP Solid Bulk Ethernet Cable (1000ft)',
      category: 'Networking Infrastructure',
      unitPrice: 110.0,
      currentStock: 85,
      minSafetyStock: 15,
      warehouseBin: 'Zone-B2-Bay08',
      clientId: client2.id,
    },
    {
      sku: 'PSU-850W-GOLD',
      name: 'EVGA SuperNOVA 850W 80+ Gold Modular PSU',
      category: 'Power Systems',
      unitPrice: 140.0,
      currentStock: 42,
      minSafetyStock: 10,
      warehouseBin: 'Zone-C1-Bay03',
      clientId: client1.id,
    },
    {
      sku: 'THERMAL-LBL-4X6',
      name: 'Direct Thermal Shipping Labels (4x6, 1000/roll)',
      category: 'Packaging & Labels',
      unitPrice: 18.5,
      currentStock: 320,
      minSafetyStock: 50,
      warehouseBin: 'Zone-C2-Bay15',
      clientId: client3.id,
    },
    {
      sku: 'ROUTER-CISCO-8P',
      name: 'Cisco Business 250 Series 8-Port Gigabit Switch',
      category: 'Networking Infrastructure',
      unitPrice: 215.0,
      currentStock: 28,
      minSafetyStock: 12,
      warehouseBin: 'Zone-D1-Bay02',
      clientId: client2.id,
    },
    {
      sku: 'PALLET-WRAP-18IN',
      name: 'Industrial Heavy Duty Stretch Wrap Film (18 inch)',
      category: 'Warehouse Equipment',
      unitPrice: 24.0,
      currentStock: 180,
      minSafetyStock: 40,
      warehouseBin: 'Zone-D2-Bay09',
      clientId: client3.id,
    },
    {
      sku: 'UPS-SMART-1500VA',
      name: 'APC Smart-UPS 1500VA LCD Rack-Mount 2U',
      category: 'Power Systems',
      unitPrice: 620.0,
      currentStock: 14,
      minSafetyStock: 8,
      warehouseBin: 'Zone-E1-Bay01',
      clientId: client2.id,
    },
    {
      sku: 'TOOLKIT-PRECISION-IFIX',
      name: 'iFixit Pro Tech Electronic Repair Toolkit',
      category: 'Maintenance & Tools',
      unitPrice: 75.0,
      currentStock: 55,
      minSafetyStock: 15,
      warehouseBin: 'Zone-E2-Bay05',
      clientId: client1.id,
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const prod = await prisma.product.create({ data: item });
    createdProducts.push(prod);
  }

  console.log(`Created ${createdProducts.length} warehouse products.`);

  // 4. Initial Stock Movements
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[0].id,
      type: MovementType.STOCK_OUT,
      quantity: 26,
      reason: 'Fulfillment order batch #ORD-9821 dispatch',
      userId: staff.id,
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[1].id,
      type: MovementType.STOCK_OUT,
      quantity: 14,
      reason: 'Deployment to Zone-B packing stations',
      userId: staff.id,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[2].id,
      type: MovementType.STOCK_IN,
      quantity: 50,
      reason: 'Restock shipment received from Silicon Logistics',
      userId: manager.id,
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  // 5. Initial AI Workflow Task & Governance Records
  const urgentTask = await prisma.aIWorkflowTask.create({
    data: {
      productId: createdProducts[0].id, // Crucial SSD (4 in stock)
      actionType: 'RESTOCK_PURCHASE_ORDER',
      suggestedQty: 50,
      estimatedCost: 3250.0,
      aiConfidence: 94,
      aiReasoning: 'Inventory dropped to 4 units (critical safety threshold: 30). Lead time is 3 days. Recommend ordering 50 units immediately from verified supplier Silicon Logistics to prevent stockout.',
      riskScore: 78,
      riskLevel: RiskLevel.HIGH,
      status: TaskStatus.AWAITING_APPROVAL,
      proposedPayload: JSON.stringify({
        sku: createdProducts[0].sku,
        supplierId: client1.id,
        supplierName: client1.name,
        quantity: 50,
        unitPrice: 65.0,
        totalCost: 3250.0,
        currency: 'USD',
      }),
    },
  });

  const executedTask = await prisma.aIWorkflowTask.create({
    data: {
      productId: createdProducts[2].id, // Corsair RAM
      actionType: 'RESTOCK_PURCHASE_ORDER',
      suggestedQty: 50,
      estimatedCost: 4900.0,
      aiConfidence: 98,
      aiReasoning: 'Automated reorder triggered prior to month-end cycle. Verified supplier rate locked at $98/unit.',
      riskScore: 42,
      riskLevel: RiskLevel.MEDIUM,
      status: TaskStatus.EXECUTED,
      proposedPayload: JSON.stringify({
        sku: createdProducts[2].sku,
        supplierId: client1.id,
        supplierName: client1.name,
        quantity: 50,
        unitPrice: 98.0,
        totalCost: 4900.0,
      }),
    },
  });

  await prisma.approvalDecision.create({
    data: {
      taskId: executedTask.id,
      decision: 'APPROVED',
      comments: 'Routine monthly restock authorized under expedited terms.',
      decidedById: manager.id,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00891',
      productId: createdProducts[2].id,
      supplierId: client1.id,
      quantity: 50,
      totalAmount: 4900.0,
      status: 'CONFIRMED',
      taskId: executedTask.id,
    },
  });

  console.log('Seeded initial AI tasks, audit logs, and purchase orders.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
