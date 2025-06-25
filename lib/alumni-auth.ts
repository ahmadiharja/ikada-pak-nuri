import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface AlumniTokenPayload {
  id: string;
  email: string;
  fullName: string;
  iat: number;
  exp: number;
}

export async function verifyAlumniToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authorization header is missing or invalid.', status: 401, alumni: null };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Token is missing.', status: 401, alumni: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AlumniTokenPayload;
    
    const alumni = await prisma.alumni.findUnique({
      where: { id: decoded.id },
    });

    if (!alumni) {
      return { error: 'Alumni not found.', status: 404, alumni: null };
    }

    if (alumni.status !== 'VERIFIED') {
        return { error: 'Akun alumni Anda belum terverifikasi.', status: 403, alumni: null };
    }

    return { alumni, error: null, status: 200 };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: `Invalid token: ${error.message}`, status: 401, alumni: null };
    }
    return { error: 'An unexpected error occurred during token verification.', status: 500, alumni: null };
  }
} 