import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('store-owner-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key-bharatverse-2025-production');
    
    // Get store information - always fetch fresh data from database
    const store = await prisma.store.findUnique({
      where: {
        id: decoded.storeId
      }
    });
    
    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store status has changed and token needs refresh
    if (decoded.status !== store.status) {
      // Store status has changed, create new token with current status
      const newToken = jwt.sign(
        { 
          role: 'store-owner', 
          storeId: store.id,
          email: store.email,
          status: store.status
        },
        process.env.JWT_SECRET || 'store-owner-secret-key-bharatverse-2025-production',
        { expiresIn: '24h' }
      );

      const response = NextResponse.json({
        success: true,
        store: {
          id: store.id,
          name: store.name,
          status: store.status,
          email: store.email,
          isActive: store.isActive
        }
      });

      // Update cookie with new token
      response.cookies.set('store-owner-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 // 24 hours
      });

      return response;
    }
    
    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        status: store.status,
        email: store.email,
        isActive: store.isActive
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}
