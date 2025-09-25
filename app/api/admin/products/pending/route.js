import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Fetch all pending products for admin approval
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No admin token found' },
        { status: 401 }
      );
    }
    
    // Verify admin JWT token
    jwt.verify(token.value, process.env.JWT_SECRET || 'admin-secret-key');
    
    const pendingProducts = await prisma.product.findMany({
      where: {
        status: 'pending'
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            contact: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      products: pendingProducts,
      count: pendingProducts.length
    });
    
  } catch (error) {
    console.error('Fetch pending products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
