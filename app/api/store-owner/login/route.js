import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Find store by email
    const store = await prisma.store.findFirst({
      where: {
        email: email
      }
    });
    
    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if store has a password set
    if (!store.password) {
      return NextResponse.json(
        { success: false, message: 'This store was created before the login system. Please contact admin to set up your password.' },
        { status: 401 }
      );
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, store.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create JWT token for store owner session
    const token = jwt.sign(
      { 
        role: 'store-owner', 
        storeId: store.id,
        email: store.email,
        status: store.status
      },
      process.env.JWT_SECRET || 'store-owner-secret-key',
      { expiresIn: '24h' }
    );
    
    const response = NextResponse.json({
      success: true,
      message: 'Store owner login successful',
      store: {
        id: store.id,
        name: store.name,
        status: store.status,
        email: store.email
      }
    });
    
    // Set HTTP-only cookie
    response.cookies.set('store-owner-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });
    
    return response;
    
  } catch (error) {
    console.error('Store owner login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
