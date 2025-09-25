import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get or create conversation
    let conversation = await prisma.chatConversation.findUnique({
      where: { storeId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50 // Limit initial load
        },
        store: {
          select: { name: true }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: { storeId },
        include: {
          messages: true,
          store: {
            select: { name: true }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversation'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { storeId, senderId, senderType, message, messageType = 'text' } = await request.json();

    if (!storeId || !senderId || !senderType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create conversation
    let conversation = await prisma.chatConversation.findUnique({
      where: { storeId }
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: { storeId }
      });
    }

    // Create message
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId,
        senderType,
        message,
        messageType,
        isRead: false
      }
    });

    // Update conversation
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message,
        lastMessageAt: new Date(),
        unreadByAdmin: senderType === 'store',
        unreadByStore: senderType === 'admin'
      }
    });

    return NextResponse.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}
