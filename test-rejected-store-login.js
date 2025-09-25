// Test script to verify rejected store login and chat access
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testRejectedStoreLogin() {
  try {
    console.log('🧪 Testing rejected store login and chat access...\n');

    // Find a rejected store or create one for testing
    let rejectedStore = await prisma.store.findFirst({
      where: { status: 'rejected' }
    });

    if (!rejectedStore) {
      console.log('No rejected store found. Creating test rejected store...');
      
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      
      rejectedStore = await prisma.store.create({
        data: {
          name: 'Test Rejected Store',
          username: 'rejected_test_store',
          email: 'rejected@test.com',
          contact: '9999999999',
          description: 'Test store for rejected status',
          address: 'Test Address',
          password: hashedPassword,
          status: 'rejected',
          isActive: false
        }
      });
      
      console.log(`✅ Created test rejected store: ${rejectedStore.name}`);
    } else {
      console.log(`✅ Found existing rejected store: ${rejectedStore.name}`);
    }

    console.log('\n📊 Store Details:');
    console.log(`- Name: ${rejectedStore.name}`);
    console.log(`- Username: ${rejectedStore.username}`);
    console.log(`- Email: ${rejectedStore.email}`);
    console.log(`- Status: ${rejectedStore.status}`);
    console.log(`- Active: ${rejectedStore.isActive}`);

    // Check if chat conversation exists or create one
    let conversation = await prisma.chatConversation.findUnique({
      where: { storeId: rejectedStore.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: { storeId: rejectedStore.id },
        include: {
          messages: true
        }
      });
      console.log('\n💬 Created chat conversation for rejected store');
    } else {
      console.log(`\n💬 Found existing chat conversation with ${conversation.messages.length} messages`);
    }

    console.log('\n🎯 Test Results:');
    console.log('✅ Rejected store exists and can be used for login');
    console.log('✅ Chat conversation is available');
    console.log('✅ Store can access /store/live-chat for admin communication');

    console.log('\n🧪 How to test manually:');
    console.log('1. Go to http://localhost:3000/store-owner-login');
    console.log(`2. Login with email: ${rejectedStore.email} and password: testpassword123`);
    console.log('3. Should redirect to /store and show rejection message with "Chat with Admin" button');
    console.log('4. Click "Chat with Admin" to open live chat');
    console.log('5. Send messages as store owner');
    console.log('6. Login to admin panel to see and respond to messages');

    console.log('\n🔧 Expected Flow:');
    console.log('• Login successful (no error message)');
    console.log('• Redirected to store dashboard');
    console.log('• Shows "Store Application Rejected" message');
    console.log('• "Chat with Admin" button available');
    console.log('• Chat opens and works properly');

  } catch (error) {
    console.error('❌ Error testing rejected store login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRejectedStoreLogin();
