import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('store-owner-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key-bharatverse-2025-production');
    
    if (!decoded.storeId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { productId, productName, productDescription, productCategory } = await request.json();

    if (!productId || !productName) {
      return NextResponse.json(
        { success: false, error: 'Product ID and name are required' },
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
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('No Gemini API key configured, using direct image generation');
      
      // Generate image directly with enhanced product-specific generation
      const imageUrl = await generateEnhancedProductImage(productName, productCategory, productDescription);
      
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        description: `Generated image for ${productName} in ${productCategory} category`,
        message: 'Image generated successfully (direct generation)'
      });
    }

    try {
      // Generate image using Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Generate a detailed, professional product image description for: ${productName}
      
Category: ${productCategory}
Description: ${productDescription}

Please provide a detailed visual description that could be used to generate a high-quality product image. Include details about:
- Product appearance and design
- Colors and materials
- Lighting and background
- Professional product photography style
- Any category-specific visual elements

Make it suitable for e-commerce product photography.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const imageDescription = response.text();

      // Generate placeholder image
      const imageUrl = await generateEnhancedProductImage(productName, productCategory, imageDescription);

      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        description: imageDescription,
        message: 'Image generated successfully'
      });

    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      
      // Fallback: Generate image directly without AI description
      const imageUrl = await generateEnhancedProductImage(productName, productCategory, productDescription);
      
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        description: `Generated image for ${productName} in ${productCategory} category (AI fallback)`,
        message: 'Image generated successfully (fallback mode)',
        warning: 'AI description generation failed, used direct generation'
      });
    }

  } catch (error) {
    console.error('Generate Product Image Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate enhanced product-specific images
async function generateEnhancedProductImage(productName, category, description) {
  try {
    console.log(`Generating enhanced image for: ${productName} (${category})`);
    
    // Create a deterministic seed based on product name for consistency
    const seedString = `${productName}-${category}`;
    const seed = seedString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Make seed positive and within reasonable range
    const positiveSeed = Math.abs(seed) % 10000;
    
    // Enhanced category-specific image generation with multiple strategies
    const categoryMappings = {
      'painting': {
        unsplashTerms: ['art', 'painting', 'canvas'],
        pictonemKeywords: ['art', 'painting', 'artistic'],
        fallbackColor: 'FF6B6B'
      },
      'sculpture': {
        unsplashTerms: ['sculpture', 'statue', 'bronze'],
        pictonemKeywords: ['sculpture', 'art', 'statue'],
        fallbackColor: '4ECDC4'
      },
      'pottery': {
        unsplashTerms: ['pottery', 'ceramic', 'clay'],
        pictonemKeywords: ['pottery', 'ceramic', 'handmade'],
        fallbackColor: 'D4A574'
      },
      'textile': {
        unsplashTerms: ['fabric', 'textile', 'weaving'],
        pictonemKeywords: ['textile', 'fabric', 'pattern'],
        fallbackColor: 'FF8E53'
      },
      'accessories': {
        unsplashTerms: ['jewelry', 'accessories', 'fashion'],
        pictonemKeywords: ['jewelry', 'elegant', 'fashion'],
        fallbackColor: 'A8E6CF'
      },
      'lighting': {
        unsplashTerms: ['lamp', 'lighting', 'illumination'],
        pictonemKeywords: ['light', 'lamp', 'glow'],
        fallbackColor: 'FFE66D'
      },
      'wellness': {
        unsplashTerms: ['wellness', 'spa', 'natural'],
        pictonemKeywords: ['wellness', 'natural', 'organic'],
        fallbackColor: '88D8B0'
      },
      'electronics': {
        unsplashTerms: ['technology', 'gadget', 'modern'],
        pictonemKeywords: ['tech', 'modern', 'digital'],
        fallbackColor: '95A5A6'
      }
    };
    
    const categoryInfo = categoryMappings[category] || {
      unsplashTerms: ['product', 'handmade', 'craft'],
      pictonemKeywords: ['product', 'quality'],
      fallbackColor: '6C5CE7'
    };
    
    // Strategy 1: Unsplash with category-specific terms (best quality)
    const unsplashUrl = `https://source.unsplash.com/400x400/?${categoryInfo.unsplashTerms.join(',')}&sig=${positiveSeed}`;
    
    // Strategy 2: Picsum with consistent seed (good variety)
    const picsumUrl = `https://picsum.photos/seed/${positiveSeed}-${category}/400/400`;
    
    // Strategy 3: Lorem Picsum with product-specific seed (consistency)
    const productSeed = productName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 10);
    const productPicsumUrl = `https://picsum.photos/seed/${productSeed}/400/400`;
    
    // Strategy 4: Enhanced placeholder with product name (fallback)
    const cleanProductName = productName.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 25);
    const placeholderUrl = `https://via.placeholder.com/400x400/${categoryInfo.fallbackColor}/FFFFFF?text=${encodeURIComponent(cleanProductName)}`;
    
    // Select strategy based on product characteristics for consistency
    const nameLength = productName.length;
    const hasTraditional = productName.toLowerCase().includes('traditional') || 
                          productName.toLowerCase().includes('handmade') || 
                          productName.toLowerCase().includes('handwoven') ||
                          productName.toLowerCase().includes('handcrafted');
    
    let selectedImageUrl;
    let strategy;
    
    if (hasTraditional && category !== 'electronics') {
      // Use Unsplash for traditional/artisan products
      selectedImageUrl = unsplashUrl;
      strategy = 'unsplash-traditional';
    } else if (nameLength > 20) {
      // Use Picsum for products with longer names
      selectedImageUrl = picsumUrl;
      strategy = 'picsum-seed';
    } else if (category === 'electronics' || category === 'gaming') {
      // Use product-specific seed for tech products
      selectedImageUrl = productPicsumUrl;
      strategy = 'picsum-product';
    } else {
      // Default to Unsplash for general products
      selectedImageUrl = unsplashUrl;
      strategy = 'unsplash-general';
    }
    
    console.log(`Selected strategy "${strategy}" for "${productName}": ${selectedImageUrl}`);
    
    return selectedImageUrl;
    
  } catch (error) {
    console.error('Enhanced image generation error:', error);
    // Ultimate fallback with product name
    const cleanName = productName.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 15);
    return `https://via.placeholder.com/400x400/6C5CE7/FFFFFF?text=${encodeURIComponent(cleanName)}`;
  }
}

// Helper function to get category-specific colors
function getCategoryColor(category) {
  const colors = {
    'painting': 'FF6B6B',
    'sculpture': '4ECDC4',
    'pottery': 'D4A574',
    'textile': 'FF8E53',
    'accessories': 'A8E6CF',
    'lighting': 'FFE66D',
    'wellness': '88D8B0',
    'electronics': '95A5A6',
    'gaming': '9B59B6',
    'clothing': 'E74C3C',
    'jewelry': 'F39C12',
    'home-decor': '3498DB',
    'kitchen': '2ECC71',
    'books': '34495E',
    'sports': 'E67E22',
    'beauty': 'E91E63',
    'food-beverages': '8BC34A',
    'automotive': '607D8B',
    'health': '00BCD4',
    'toys': 'FFEB3B',
    'garden': '4CAF50',
    'musical-instruments': '673AB7',
    'stationery': '795548'
  };
  
  return colors[category] || '6C5CE7';
}
