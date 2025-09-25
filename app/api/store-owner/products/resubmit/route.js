import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PATCH - Resubmit rejected product for approval
export async function PATCH(request) {
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
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Verify store is still approved and active
    const store = await prisma.store.findUnique({
      where: {
        id: decoded.storeId
      }
    });
    
    if (!store || store.status !== 'approved' || !store.isActive) {
      return NextResponse.json(
        { success: false, message: 'Store not approved or not active. Cannot resubmit products.' },
        { status: 403 }
      );
    }
    
    // Verify the product belongs to this store and is rejected
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: decoded.storeId,
        status: 'rejected'
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found, unauthorized, or not rejected' },
        { status: 404 }
      );
    }
    
    // Resubmit product for approval
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        status: 'pending',
        adminNote: null,      // Clear previous admin note
        reviewedBy: null,     // Clear previous reviewer
        reviewedAt: null      // Clear previous review date
      }
    });
    
    console.log(`Product resubmitted for approval: ${product.name} (Store: ${store.name})`);
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product resubmitted for admin approval'
    });
    
  } catch (error) {
    console.error('Product resubmit API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
