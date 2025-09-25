import { Server } from 'socket.io';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/emailService';

let io;

export async function GET(req) {
  if (!global.io) {
    console.log('Starting Socket.IO server...');
    
    // This is a simple implementation for development
    // In production, you might want to use a separate server
    global.io = {
      initialized: true,
      // Mock functions for development
      to: () => ({ emit: () => {} }),
      emit: () => {},
      on: () => {}
    };
    
    console.log('Socket.IO server started successfully');
  }

  return new Response('Socket.IO is running', { status: 200 });
}

// This function will be used by our chat context
export async function createConversationIfNotExists(storeId) {
  try {
    const existingConversation = await prisma.chatConversation.findUnique({
      where: { storeId }
    });

    if (!existingConversation) {
      await prisma.chatConversation.create({
        data: { storeId }
      });
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
}
