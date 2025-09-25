import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('store-owner-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT and get store ID
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'store-owner-secret-key');
    const storeId = decoded.storeId;

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get store data for context
    const storeData = await getStoreContext(storeId);

    // Create context for Gemini
    const context = `
You are a helpful AI assistant for ${storeData.store.name}, an e-commerce store. 
You have access to the following store information:

STORE DETAILS:
- Store Name: ${storeData.store.name}
- Store Email: ${storeData.store.email}
- Store Status: ${storeData.store.status}
- Total Products: ${storeData.products.length}
- Total Orders: ${storeData.orders.length}

PRODUCTS (${storeData.products.length} total):
${storeData.products.map(p => `- ${p.name} (₹${p.price}) - ${p.category} - Stock: ${p.stockQuantity} - ${p.description.substring(0, 100)}...`).join('\n')}

RECENT ORDERS (${storeData.orders.length} total):
${storeData.orders.slice(0, 5).map(o => `- Order #${o.id} - ₹${o.total} - ${o.status} - ${o.createdAt}`).join('\n')}

STORE STATISTICS:
- Average Order Value: ₹${storeData.stats.avgOrderValue}
- Total Revenue: ₹${storeData.stats.totalRevenue}
- Best Selling Category: ${storeData.stats.topCategory}

You should help answer questions about:
- Store products, inventory, and pricing
- Order status and history
- Store performance and analytics
- Product recommendations
- General store operations
- Customer service inquiries

Always be helpful, professional, and provide accurate information based on the store data above.
If asked about something not in the store data, politely explain that you don't have access to that information.

User Question: ${message}
`;

    // Get response from Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(context);
    const response = await result.response;
    const botReply = response.text();

    return NextResponse.json({
      success: true,
      reply: botReply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chatbot:', error);
    
    // Check if it's a quota exceeded error (429 status or quota in message)
    if (error.status === 429 || 
        (error.message && (error.message.includes('quota') || error.message.includes('429') || error.message.includes('Too Many Requests')))) {
      
      // Extract retry delay if available
      let retryMessage = "Please try again in a few minutes";
      if (error.message && error.message.includes('retry in')) {
        const retryMatch = error.message.match(/retry in ([\d.]+)s/);
        if (retryMatch) {
          const seconds = Math.ceil(parseFloat(retryMatch[1]));
          retryMessage = `Please try again in ${seconds} seconds`;
        }
      }
      
      return NextResponse.json({
        success: true,
        reply: `I apologize, but our AI assistant is temporarily unavailable due to API quota limits. ${retryMessage}, or feel free to contact our support team directly for immediate assistance.`,
        timestamp: new Date().toISOString(),
        isQuotaError: true
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get response from chatbot',
        reply: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team for assistance."
      },
      { status: 500 }
    );
  }
}

async function getStoreContext(storeId) {
  try {
    // Get store information
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    // Get products
    const products = await prisma.product.findMany({
      where: { storeId: storeId },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        stockQuantity: true,
        description: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to recent products
    });

    // Get orders
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              storeId: storeId
            }
          }
        }
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to recent orders
    });

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Get top category
    const categoryCount = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0] || 'No products';

    return {
      store,
      products,
      orders,
      stats: {
        totalRevenue,
        avgOrderValue: Math.round(avgOrderValue),
        topCategory
      }
    };
  } catch (error) {
    console.error('Error getting store context:', error);
    return {
      store: { name: 'Unknown Store', email: '', status: 'unknown' },
      products: [],
      orders: [],
      stats: { totalRevenue: 0, avgOrderValue: 0, topCategory: 'No data' }
    };
  }
}
