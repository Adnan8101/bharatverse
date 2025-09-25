import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all store-to-store conversations for admin monitoring
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, unread, active

    let whereClause = {};
    
    if (filter === 'unread') {
      whereClause.unreadByAdmin = true;
    } else if (filter === 'active') {
      whereClause.lastMessageAt = {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      };
    }

    const conversations = await prisma.storeToStoreConversation.findMany({
      where: whereClause,
      include: {
        store1: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
            email: true
          }
        },
        store2: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true,
            email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                name: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Add message count for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await prisma.storeToStoreMessage.count({
          where: { conversationId: conv.id }
        });

        const unreadByStore1 = await prisma.storeToStoreMessage.count({
          where: {
            conversationId: conv.id,
            senderId: conv.store2Id, // Messages from store2 unread by store1
            isRead: false
          }
        });

        const unreadByStore2 = await prisma.storeToStoreMessage.count({
          where: {
            conversationId: conv.id,
            senderId: conv.store1Id, // Messages from store1 unread by store2
            isRead: false
          }
        });

        return {
          ...conv,
          messageCount,
          unreadByStore1,
          unreadByStore2
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithCounts
    });

  } catch (error) {
    console.error('Error fetching store conversations for admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

// Mark conversation as read by admin
export async function PUT(request) {
  try {
    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    await prisma.storeToStoreConversation.update({
      where: { id: conversationId },
      data: { unreadByAdmin: false }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking conversation as read by admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark as read'
    }, { status: 500 });
  }
}
