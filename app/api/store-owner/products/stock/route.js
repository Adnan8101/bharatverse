import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PUT - Update product stock quantity
export async function PUT(request) {
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
    
    const { productId, quantity, operation } = await request.json();
    
    if (!productId || !quantity || !operation) {
      return NextResponse.json(
        { success: false, message: 'Product ID, quantity, and operation are required' },
        { status: 400 }
      );
    }
    
    if (!['add', 'subtract'].includes(operation)) {
      return NextResponse.json(
        { success: false, message: 'Operation must be either "add" or "subtract"' },
        { status: 400 }
      );
    }
    
    // Verify the product belongs to this store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: decoded.storeId
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // For now, we'll just manage the inStock boolean
    // In a full implementation, you'd have a stock quantity field
    let updateData = {};
    
    if (operation === 'subtract' && quantity > 0) {
      // If we're subtracting stock and it's a purchase, we might want to mark as out of stock
      // This is simplified - in reality you'd track actual quantities
      updateData.inStock = product.inStock; // Keep current status for now
    } else if (operation === 'add') {
      // Adding stock back (returns, restocking)
      updateData.inStock = true;
    }
    
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Stock updated successfully'
    });
    
  } catch (error) {
    console.error('Stock update API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
