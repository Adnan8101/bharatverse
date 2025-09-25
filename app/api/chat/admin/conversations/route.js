import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const conversations = await prisma.chatConversation.findMany({
      include: {
        store: {
          select: {
            name: true,
            email: true,
            logo: true,
            status: true
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

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            conversationId: conv.id,
            senderType: 'store',
            isRead: false
          }
        });

        return {
          ...conv,
          unreadCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithUnread
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}
