import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  password: z.string().min(6).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user });
  } catch {
    return errorResponse('Failed to fetch user', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin privilege required', 403);
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Invalid input', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    const updateData: {
      name?: string;
      email?: string;
      role?: Role;
      password?: string;
    } = {};

    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.role) updateData.role = parsed.data.role as Role;
    if (parsed.data.email) {
      const emailLower = parsed.data.email.toLowerCase();
      if (emailLower !== existingUser.email) {
        const conflict = await prisma.user.findUnique({ where: { email: emailLower } });
        if (conflict) {
          return errorResponse('Email is already taken by another account', 409);
        }
        updateData.email = emailLower;
      }
    }
    if (parsed.data.password) {
      updateData.password = await bcrypt.hash(parsed.data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse({ user: updatedUser });
  } catch {
    return errorResponse('Failed to update user', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthUser(req);
    if (!auth || auth.role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin privilege required', 403);
    }

    if (auth.userId === params.id) {
      return errorResponse('You cannot delete your own active admin account', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return errorResponse('User not found', 404);
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'User deleted successfully' });
  } catch {
    return errorResponse('Failed to delete user', 500);
  }
}
