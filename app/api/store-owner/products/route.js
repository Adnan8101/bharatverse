import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
import { uploadImages } from '@/lib/imageUpload';

// GET - Fetch all products for the store owner
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
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    
    // Get store information
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
    
    // Get all products for this store
    const products = await prisma.product.findMany({
      where: {
        storeId: decoded.storeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      products: products
    });
    
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new product
export async function POST(request) {
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
    
    // Get store information
    const store = await prisma.store.findUnique({
      where: {
        id: decoded.storeId
      }
    });
    
    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Store not found.' },
        { status: 404 }
      );
    }
    
    const formData = await request.formData();
    
    // Extract product data
    const name = formData.get('name');
    const description = formData.get('description');
    const mrp = parseFloat(formData.get('mrp'));
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const stockQuantity = parseInt(formData.get('stockQuantity')) || 0;
    
    console.log('Received form data:', { name, description, mrp, price, category, stockQuantity });
    
    // Validate required fields
    if (!name || !description || isNaN(mrp) || isNaN(price) || !category || isNaN(stockQuantity)) {
      console.log('Validation failed:', { name: !!name, description: !!description, mrp, price, category, stockQuantity });
      return NextResponse.json(
        { success: false, message: 'All fields are required, prices must be valid numbers, and stock quantity must be specified' },
        { status: 400 }
      );
    }
    
    if (mrp < 0 || price < 0 || stockQuantity < 0) {
      return NextResponse.json(
        { success: false, message: 'Prices and stock quantity must be positive numbers' },
        { status: 400 }
      );
    }
    
    // Handle image uploads
    const imageFiles = [];
    for (let i = 1; i <= 4; i++) {
      const imageFile = formData.get(`image${i}`);
      if (imageFile && imageFile.size > 0) {
        imageFiles.push(imageFile);
      }
    }
    
    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one product image is required' },
        { status: 400 }
      );
    }
    
    // Upload images to local storage
    const images = await uploadImages(imageFiles, 'products');
    
    // Create the product with proper stock logic and pending approval status
    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images,
        storeId: decoded.storeId,
        inStock: stockQuantity > 0, // Only mark as inStock if stockQuantity > 0
        stockQuantity: Math.max(0, stockQuantity), // Ensure non-negative stock
        status: 'pending' // Products need admin approval before going live
      }
    });
    
    console.log(`Product created: ${product.name} - Stock: ${product.stockQuantity}, InStock: ${product.inStock}, Status: ${product.status}`);
    
    return NextResponse.json({
      success: true,
      product,
      message: 'Product submitted for admin approval. It will be live once approved.'
    });
    
  } catch (error) {
    console.error('Add product API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update product (toggle stock, etc.)
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
    
    const { productId, updateData } = await request.json();
    
    // Verify store exists
    const store = await prisma.store.findUnique({
      where: {
        id: decoded.storeId
      }
    });
    
    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Store not found.' },
        { status: 404 }
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
    
    // Apply proper stock logic when updating
    let finalUpdateData = { ...updateData };
    
    // If updating stock quantity, ensure inStock is properly set
    if ('stockQuantity' in updateData) {
      finalUpdateData.stockQuantity = Math.max(0, updateData.stockQuantity);
      finalUpdateData.inStock = finalUpdateData.stockQuantity > 0;
    }
    
    // If manually setting inStock status, ensure it's consistent with stock quantity
    if ('inStock' in updateData && !('stockQuantity' in updateData)) {
      // If setting to inStock but current stockQuantity is 0, don't allow it
      if (updateData.inStock && product.stockQuantity === 0) {
        return NextResponse.json(
          { success: false, message: 'Cannot mark product as in stock when stock quantity is 0. Please update stock quantity first.' },
          { status: 400 }
        );
      }
    }
    
    console.log(`Updating product ${product.name}:`, finalUpdateData);
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: finalUpdateData
    });
    
    console.log(`Product updated: ${updatedProduct.name} - Stock: ${updatedProduct.stockQuantity}, InStock: ${updatedProduct.inStock}`);
    
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Product update API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request) {
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
        { success: false, message: 'Store not approved or not active. Cannot delete products.' },
        { status: 403 }
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
    
    // Delete the product
    await prisma.product.delete({
      where: {
        id: productId
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Product delete API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
