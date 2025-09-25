import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all store-to-store conversations for a specific store
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get all conversations where this store is involved
    const conversations = await prisma.storeToStoreConversation.findMany({
      where: {
        OR: [
          { store1Id: storeId },
          { store2Id: storeId }
        ]
      },
      include: {
        store1: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        },
        store2: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.storeToStoreMessage.count({
          where: {
            conversationId: conv.id,
            senderId: { not: storeId },
            isRead: false
          }
        });

        // Determine the other store
        const otherStore = conv.store1Id === storeId ? conv.store2 : conv.store1;

        return {
          ...conv,
          otherStore,
          unreadCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithUnread
    });

  } catch (error) {
    console.error('Error fetching store conversations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

// Create or get a conversation between two stores
export async function POST(request) {
  try {
    const { store1Id, store2Id } = await request.json();

    if (!store1Id || !store2Id) {
      return NextResponse.json({ error: 'Both store IDs required' }, { status: 400 });
    }

    if (store1Id === store2Id) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 });
    }

    // Ensure consistent ordering (smaller ID first)
    const [firstStoreId, secondStoreId] = [store1Id, store2Id].sort();

    // Check if conversation already exists
    let conversation = await prisma.storeToStoreConversation.findUnique({
      where: {
        store1Id_store2Id: {
          store1Id: firstStoreId,
          store2Id: secondStoreId
        }
      },
      include: {
        store1: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        },
        store2: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        }
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.storeToStoreConversation.create({
        data: {
          store1Id: firstStoreId,
          store2Id: secondStoreId
        },
        include: {
          store1: {
            select: {
              id: true,
              name: true,
              username: true,
              logo: true
            }
          },
          store2: {
            select: {
              id: true,
              name: true,
              username: true,
              logo: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create conversation'
    }, { status: 500 });
  }
}
