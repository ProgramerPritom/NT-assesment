import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
});

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const query = searchParams.get('q');

    const whereClause: {
      role?: Role;
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (roleParam && ['ADMIN', 'MANAGER', 'STAFF'].includes(roleParam)) {
      whereClause.role = roleParam as Role;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ users, count: users.length });
  } catch {
    return errorResponse('Failed to fetch users', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin privilege required', 403);
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input data', 400);
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse('A user with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse({ user: newUser }, 201);
  } catch {
    return errorResponse('Failed to create user', 500);
  }
}
