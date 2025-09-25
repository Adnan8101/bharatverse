const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePaymentMethods() {
  try {
    console.log('Checking for existing STRIPE payment methods...');
    
    // Use raw query to update STRIPE to CARD since enum constraints might prevent regular update
    const result = await prisma.$executeRaw`
      UPDATE "Order" 
      SET "paymentMethod" = 'CARD' 
      WHERE "paymentMethod" = 'STRIPE'
    `;
    
    console.log(`Updated ${result} records from STRIPE to CARD`);
    
    // Check if any STRIPE records still exist
    const remainingStripe = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Order" 
      WHERE "paymentMethod" = 'STRIPE'
    `;
    
    console.log(`Remaining STRIPE records: ${remainingStripe[0].count}`);
    
  } catch (error) {
    console.error('Error updating payment methods:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePaymentMethods();
