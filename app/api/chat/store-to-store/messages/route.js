import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get messages for a store-to-store conversation
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.storeToStoreMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalMessages = await prisma.storeToStoreMessage.count({
      where: { conversationId }
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: skip + limit < totalMessages
      }
    });

  } catch (error) {
    console.error('Error fetching store messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

// Send a message in store-to-store conversation
export async function POST(request) {
  try {
    const { conversationId, senderId, message, messageType = 'text' } = await request.json();

    if (!conversationId || !senderId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the conversation exists and sender is part of it
    const conversation = await prisma.storeToStoreConversation.findUnique({
      where: { id: conversationId },
      include: {
        store1: true,
        store2: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.store1Id !== senderId && conversation.store2Id !== senderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create the message
    const newMessage = await prisma.storeToStoreMessage.create({
      data: {
        conversationId,
        senderId,
        message,
        messageType,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        }
      }
    });

    // Update conversation
    const updateData = {
      lastMessage: message,
      lastMessageAt: new Date(),
      unreadByAdmin: true // Admin should know about new messages
    };

    // Set read status for the other store
    if (conversation.store1Id === senderId) {
      updateData.unreadByStore2 = true;
      updateData.unreadByStore1 = false;
    } else {
      updateData.unreadByStore1 = true;
      updateData.unreadByStore2 = false;
    }

    await prisma.storeToStoreConversation.update({
      where: { id: conversationId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Error sending store message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}

// Mark messages as read
export async function PUT(request) {
  try {
    const { conversationId, storeId } = await request.json();

    if (!conversationId || !storeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mark messages as read
    await prisma.storeToStoreMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: storeId },
        isRead: false
      },
      data: { isRead: true }
    });

    // Update conversation read status
    const conversation = await prisma.storeToStoreConversation.findUnique({
      where: { id: conversationId }
    });

    if (conversation) {
      const updateData = {};
      if (conversation.store1Id === storeId) {
        updateData.unreadByStore1 = false;
      } else if (conversation.store2Id === storeId) {
        updateData.unreadByStore2 = false;
      }

      await prisma.storeToStoreConversation.update({
        where: { id: conversationId },
        data: updateData
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking store messages as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark messages as read'
    }, { status: 500 });
  }
}
