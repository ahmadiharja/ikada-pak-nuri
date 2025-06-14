import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createSuperAdminSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = createSuperAdminSchema.parse(body);

    // Check if superadmin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User dengan email ini sudah ada' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create superadmin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PUSAT', // Role PUSAT untuk superadmin
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Superadmin berhasil dibuat',
      data: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error('Error creating superadmin:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Data tidak valid',
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Gagal membuat superadmin' },
      { status: 500 }
    );
  }
}

// GET method to check if any superadmin exists
export async function GET() {
  try {
    const superAdminCount = await prisma.user.count({
      where: {
        role: 'PUSAT',
      },
    });

    return NextResponse.json({
      success: true,
      hasSuperAdmin: superAdminCount > 0,
      count: superAdminCount,
    });
  } catch (error) {
    console.error('Error checking superadmin:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengecek superadmin' },
      { status: 500 }
    );
  }
}