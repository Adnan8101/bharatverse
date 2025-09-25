import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalMessages = await prisma.chatMessage.count({
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
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { conversationId, userType } = await request.json();

    if (!conversationId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderType: userType === 'admin' ? 'store' : 'admin'
      },
      data: { isRead: true }
    });

    // Update conversation read status
    const updateData = userType === 'admin' 
      ? { unreadByAdmin: false }
      : { unreadByStore: false };

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: updateData
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark messages as read'
    }, { status: 500 });
  }
}
