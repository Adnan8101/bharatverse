import { prisma } from './lib/prisma.js';

async function createSampleStoreCoupons() {
  console.log('🌱 Creating sample store coupons...');

  // First, get some stores
  const stores = await prisma.store.findMany({
    where: { status: 'approved' },
    take: 3
  });

  if (stores.length === 0) {
    console.log('❌ No approved stores found. Please create and approve some stores first.');
    return;
  }

  const sampleCoupons = [
    {
      code: 'STORE10OFF',
      description: '10% off on all electronics from our store',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 500,
      minOrderAmount: 299,
      forNewUser: false,
      forMember: false,
      usageLimit: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      storeId: stores[0].id,
      status: 'pending'
    },
    {
      code: 'WELCOME50',
      description: 'Welcome offer: ₹50 off on first purchase',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 199,
      forNewUser: true,
      forMember: false,
      usageLimit: 50,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      storeId: stores[1].id,
      status: 'pending'
    },
    {
      code: 'MEMBER15',
      description: 'Exclusive 15% off for premium members',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 1000,
      minOrderAmount: 499,
      forNewUser: false,
      forMember: true,
      usageLimit: 200,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      storeId: stores[2].id,
      status: 'approved', // This one is pre-approved
      isActive: true,
      reviewedBy: 'admin@bharatverse.com',
      reviewedAt: new Date(),
      adminNote: 'Approved for premium member exclusive offer'
    }
  ];

  for (const couponData of sampleCoupons) {
    try {
      const coupon = await prisma.storeCoupon.create({ data: couponData });
      console.log(`✅ Created store coupon: ${coupon.code} for store: ${stores.find(s => s.id === coupon.storeId)?.name}`);
    } catch (error) {
      console.error('❌ Failed to create store coupon:', couponData.code, error.message);
    }
  }

  console.log('🎉 Sample store coupons created!');
}

createSampleStoreCoupons()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
