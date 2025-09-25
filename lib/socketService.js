import { Server } from 'socket.io';
import { prisma } from './prisma';
import { sendEmail } from './emailService';

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room based on user type
    socket.on('join-room', async (data) => {
      const { userType, storeId } = data;
      
      if (userType === 'admin') {
        socket.join('admin-room');
        console.log('Admin joined admin-room');
      } else if (userType === 'store' && storeId) {
        socket.join(`store-${storeId}`);
        console.log(`Store ${storeId} joined store-${storeId}`);
        
        // Create conversation if doesn't exist
        await createConversationIfNotExists(storeId);
      }
    });

    // Handle new messages
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, senderId, senderType, message, messageType = 'text' } = data;

        // Save message to database
        const newMessage = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId,
            senderType,
            message,
            messageType,
            isRead: false
          }
        });

        // Update conversation
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: message,
            lastMessageAt: new Date(),
            unreadByAdmin: senderType === 'store',
            unreadByStore: senderType === 'admin'
          }
        });

        // Emit to appropriate rooms
        if (senderType === 'admin') {
          // Send to specific store
          const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
            include: { store: true }
          });
          
          if (conversation) {
            io.to(`store-${conversation.storeId}`).emit('new-message', {
              ...newMessage,
              senderName: 'Admin'
            });

            // Send email notification to store owner
            try {
              await sendEmail(
                conversation.store.email,
                'New Message from Admin - BharatVerse',
                `You have received a new message from Admin on BharatVerse.\n\nMessage: ${message}\n\nPlease log in to your store dashboard to view and reply.`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #7c3aed;">New Message from Admin</h2>
                  <p>Hello ${conversation.store.name},</p>
                  <p>You have received a new message from the BharatVerse Admin:</p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-style: italic;">"${message}"</p>
                  </div>
                  <p>Please <a href="${process.env.NEXTAUTH_URL}/store" style="color: #7c3aed;">log in to your store dashboard</a> to view and reply to this message.</p>
                  <p>Best regards,<br>BharatVerse Team</p>
                </div>
                `
              );
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }
        } else if (senderType === 'store') {
          // Send to admin
          const store = await prisma.store.findUnique({
            where: { id: senderId }
          });
          
          io.to('admin-room').emit('new-message', {
            ...newMessage,
            senderName: store?.name || 'Store Owner'
          });
        }

        // Send confirmation to sender
        socket.emit('message-sent', { messageId: newMessage.id, success: true });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark-read', async (data) => {
      try {
        const { conversationId, userType } = data;

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

        socket.emit('messages-marked-read', { conversationId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, senderType, storeId } = data;
      
      if (senderType === 'admin') {
        io.to(`store-${storeId}`).emit('user-typing', { userType: 'admin' });
      } else {
        io.to('admin-room').emit('user-typing', { userType: 'store', storeId });
      }
    });

    socket.on('stop-typing', (data) => {
      const { conversationId, senderType, storeId } = data;
      
      if (senderType === 'admin') {
        io.to(`store-${storeId}`).emit('user-stop-typing', { userType: 'admin' });
      } else {
        io.to('admin-room').emit('user-stop-typing', { userType: 'store', storeId });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

async function createConversationIfNotExists(storeId) {
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

export function getSocketInstance() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
