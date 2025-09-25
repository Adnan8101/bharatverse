// Test script to create sample stores and test store-to-store chat
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStoreToStoreChat() {
  try {
    console.log('🧪 Testing Store-to-Store Chat System...\n');

    // Check if we have at least 2 approved stores
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        status: 'approved'
      },
      take: 3
    });

    console.log(`Found ${stores.length} active stores:`);
    stores.forEach(store => {
      console.log(`- ${store.name} (${store.username}) - ID: ${store.id}`);
    });

    if (stores.length < 2) {
      console.log('\n❌ Need at least 2 active stores to test chat system');
      console.log('Creating test stores...\n');

      // Create test stores if needed
      const testStores = [
        {
          name: 'TechStore Pro',
          username: 'techstore_pro',
          email: 'tech@example.com',
          contact: '9876543210',
          description: 'Professional tech equipment store',
          address: 'Mumbai, Maharashtra',
          password: '$2a$10$example', // hashed password
          status: 'approved',
          isActive: true
        },
        {
          name: 'Fashion Hub',
          username: 'fashion_hub',
          email: 'fashion@example.com',
          contact: '9876543211',
          description: 'Latest fashion trends and accessories',
          address: 'Delhi, India',
          password: '$2a$10$example2', // hashed password
          status: 'approved',
          isActive: true
        }
      ];

      for (const storeData of testStores) {
        const existingStore = await prisma.store.findUnique({
          where: { username: storeData.username }
        });

        if (!existingStore) {
          await prisma.store.create({ data: storeData });
          console.log(`✅ Created store: ${storeData.name}`);
        }
      }
    }

    // Get updated store list
    const updatedStores = await prisma.store.findMany({
      where: {
        isActive: true,
        status: 'approved'
      },
      take: 3
    });

    if (updatedStores.length >= 2) {
      console.log('\n🎯 Testing Store-to-Store Conversation Creation...');
      
      const store1 = updatedStores[0];
      const store2 = updatedStores[1];
      
      console.log(`Creating conversation between: ${store1.name} and ${store2.name}`);

      // Ensure consistent ordering (smaller ID first)
      const [firstStoreId, secondStoreId] = [store1.id, store2.id].sort();

      // Check if conversation already exists
      let conversation = await prisma.storeToStoreConversation.findUnique({
        where: {
          store1Id_store2Id: {
            store1Id: firstStoreId,
            store2Id: secondStoreId
          }
        }
      });

      if (!conversation) {
        conversation = await prisma.storeToStoreConversation.create({
          data: {
            store1Id: firstStoreId,
            store2Id: secondStoreId
          }
        });
        console.log('✅ Created new conversation');
      } else {
        console.log('✅ Conversation already exists');
      }

      // Test adding messages
      console.log('\n💬 Testing Message Creation...');
      
      const testMessages = [
        {
          conversationId: conversation.id,
          senderId: store1.id,
          message: `Hi ${store2.name}! How's business going?`,
          messageType: 'text'
        },
        {
          conversationId: conversation.id,
          senderId: store2.id,
          message: `Hello ${store1.name}! Business is great, thanks for asking. How about you?`,
          messageType: 'text'
        },
        {
          conversationId: conversation.id,
          senderId: store1.id,
          message: 'Doing well! Would you be interested in cross-promoting our products?',
          messageType: 'text'
        }
      ];

      for (const msgData of testMessages) {
        await prisma.storeToStoreMessage.create({ data: msgData });
        console.log(`✅ Added message from ${msgData.senderId === store1.id ? store1.name : store2.name}`);
      }

      // Update conversation with last message
      await prisma.storeToStoreConversation.update({
        where: { id: conversation.id },
        data: {
          lastMessage: testMessages[testMessages.length - 1].message,
          lastMessageAt: new Date(),
          unreadByAdmin: true
        }
      });

      console.log('\n📊 Testing Data Retrieval...');
      
      // Test getting conversations for store1
      const store1Conversations = await prisma.storeToStoreConversation.findMany({
        where: {
          OR: [
            { store1Id: store1.id },
            { store2Id: store1.id }
          ]
        },
        include: {
          store1: { select: { id: true, name: true, username: true } },
          store2: { select: { id: true, name: true, username: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } }
        }
      });

      console.log(`✅ Found ${store1Conversations.length} conversations for ${store1.name}`);
      
      // Test getting messages
      const messages = await prisma.storeToStoreMessage.findMany({
        where: { conversationId: conversation.id },
        include: {
          sender: { select: { name: true, username: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`✅ Found ${messages.length} messages in conversation`);
      
      console.log('\n💬 Sample conversation:');
      messages.forEach(msg => {
        console.log(`${msg.sender.name}: ${msg.message}`);
      });

      console.log('\n🎉 Store-to-Store Chat System Test Complete!');
      console.log('\n📱 How to test in browser:');
      console.log('1. Go to http://localhost:3000/store-owner-login');
      console.log(`2. Login with ${store1.username} credentials`);
      console.log('3. Navigate to "Store Chat" in sidebar');
      console.log('4. Try starting a conversation with other stores');
      console.log('\n👨‍💼 Admin monitoring:');
      console.log('1. Go to http://localhost:3000/admin-login');
      console.log('2. Navigate to "Live Chat" and switch to "Store Chats" tab');
      console.log('3. View all store-to-store conversations');

    }

  } catch (error) {
    console.error('❌ Error testing store-to-store chat:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStoreToStoreChat();
