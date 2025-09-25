const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  // Clear existing data
  await prisma.rating.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.store.deleteMany()
  await prisma.address.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleared existing data')

  // Create users
  const users = [
    {
      id: 'user_31dQbH27HVtovbs13X2cmqefddM',
      name: 'GreatStack',
      email: 'greatstack@example.com',
      image: '/assets/gs_logo.jpg',
      cart: {}
    },
    {
      id: 'user_31dOriXqC4TATvc0brIhlYbwwc5',
      name: 'Great Stack',
      email: 'user.greatstack@gmail.com',
      image: '/assets/gs_logo.jpg',
      cart: {}
    },
    {
      id: 'user_kristin',
      name: 'Kristin Watson',
      email: 'kristin@example.com',
      image: '/assets/profile_pic1.jpg',
      cart: {}
    },
    {
      id: 'user_jenny',
      name: 'Jenny Wilson',
      email: 'jenny@example.com',
      image: '/assets/profile_pic2.jpg',
      cart: {}
    },
    {
      id: 'user_bessie',
      name: 'Bessie Cooper',
      email: 'bessie@example.com',
      image: '/assets/profile_pic3.jpg',
      cart: {}
    }
  ]

  for (const userData of users) {
    const user = await prisma.user.create({ data: userData })
    console.log('✅ Created user:', user.name)
  }

  // Create stores
  const stores = [
    {
      id: 'store_1',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
      name: 'Happy Shop',
      description: 'At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you\'re hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we\'ve got it all under one digital roof.',
      username: 'happyshop',
      address: '3rd Floor, Happy Shop Complex, New Building, 123 Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      status: 'approved',
      isActive: true,
      logo: '/assets/happy_store.webp',
      email: 'happyshop@example.com',
      contact: '+91 9876543210'
    },
    {
      id: 'store_2',
      userId: 'user_31dOriXqC4TATvc0brIhlYbwwc5',
      name: 'GreatStack',
      description: 'GreatStack is the education marketplace where you can buy goodies related to coding and tech',
      username: 'greatstack',
      address: '123 Cyber City, Sector 29, Gurgaon, Haryana 122001, India',
      status: 'approved',
      isActive: true,
      logo: '/assets/gs_logo.jpg',
      email: 'greatstack@example.com',
      contact: '+91 9876543210'
    }
  ]

  for (const storeData of stores) {
    const store = await prisma.store.create({ data: storeData })
    console.log('✅ Created store:', store.name)
  }

  // Create products (all 12 products from assets)
  const products = [
    {
      id: 'prod_1',
      name: 'Modern table lamp',
      description: 'Modern table lamp with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 3299,
      price: 2399,
      images: ['/assets/product_img1.png', '/assets/product_img2.png', '/assets/product_img3.png', '/assets/product_img4.png'],
      category: 'Decoration',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_2',
      name: 'Smart speaker gray',
      description: 'Smart speaker with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 4199,
      price: 2399,
      images: ['/assets/product_img2.png'],
      category: 'Speakers',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_3',
      name: 'Smart watch white',
      description: 'Smart watch with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 4999,
      price: 2399,
      images: ['/assets/product_img3.png'],
      category: 'Watch',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_4',
      name: 'Wireless headphones',
      description: 'Wireless headphones with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 5799,
      price: 2399,
      images: ['/assets/product_img4.png'],
      category: 'Headphones',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_5',
      name: 'Smart watch black',
      description: 'Smart watch with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 4099,
      price: 2399,
      images: ['/assets/product_img5.png'],
      category: 'Watch',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_6',
      name: 'Security Camera',
      description: 'Security Camera with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 4899,
      price: 2399,
      images: ['/assets/product_img6.png'],
      category: 'Camera',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_7',
      name: 'Smart Pen for iPad',
      description: 'Smart Pen for iPad with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 7399,
      price: 2399,
      images: ['/assets/product_img7.png'],
      category: 'Pen',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_8',
      name: 'Home Theater',
      description: 'Home Theater with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 8199,
      price: 2399,
      images: ['/assets/product_img8.png'],
      category: 'Theater',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_9',
      name: 'Apple Wireless Earbuds',
      description: 'Apple Wireless Earbuds with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 7399,
      price: 2399,
      images: ['/assets/product_img9.png'],
      category: 'Earbuds',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_10',
      name: 'Apple Smart Watch',
      description: 'Apple Smart Watch with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 14799,
      price: 2399,
      images: ['/assets/product_img10.png'],
      category: 'Watch',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_11',
      name: 'RGB Gaming Mouse',
      description: 'RGB Gaming Mouse with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 3249,
      price: 2399,
      images: ['/assets/product_img11.png'],
      category: 'Mouse',
      storeId: 'store_1',
      inStock: true
    },
    {
      id: 'prod_12',
      name: 'Smart Home Cleaner',
      description: 'Smart Home Cleaner with a sleek design. It\'s perfect for any room. It\'s made of high-quality materials and comes with a lifetime warranty.',
      mrp: 16499,
      price: 2399,
      images: ['/assets/product_img12.png'],
      category: 'Cleaner',
      storeId: 'store_1',
      inStock: true
    }
  ]

  for (const productData of products) {
    const product = await prisma.product.create({ data: productData })
    console.log('✅ Created product:', product.name)
  }

  // Create ratings
  const ratings = [
    {
      id: 'rat_1',
      rating: 4.2,
      review: 'I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it\'s easy to use, and it delivers exactly what was promised.',
      userId: 'user_kristin',
      productId: 'prod_1'
    },
    {
      id: 'rat_2',
      rating: 5.0,
      review: 'This product is great. I love it! You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: 'user_jenny',
      productId: 'prod_2'
    },
    {
      id: 'rat_3',
      rating: 4.1,
      review: 'This product is amazing. I love it! You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: 'user_bessie',
      productId: 'prod_3'
    },
    {
      id: 'rat_4',
      rating: 5.0,
      review: 'This product is great. I love it! You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: 'user_kristin',
      productId: 'prod_4'
    },
    {
      id: 'rat_5',
      rating: 4.3,
      review: 'Overall, I\'m very happy with this purchase. It works as described and feels durable. Still, highly recommend it for anyone looking for a reliable option.',
      userId: 'user_jenny',
      productId: 'prod_5'
    },
    {
      id: 'rat_6',
      rating: 5.0,
      review: 'This product is great. I love it! You made it so simple. My new site is so much faster and easier to work with than my old site.',
      userId: 'user_bessie',
      productId: 'prod_6'
    }
  ]

  for (const ratingData of ratings) {
    const rating = await prisma.rating.create({ data: ratingData })
    console.log('✅ Created rating for product:', ratingData.productId)
  }

  // Create addresses
  const addresses = [
    {
      id: 'addr_1',
      userId: 'user_31dQbH27HVtovbs13X2cmqefddM',
      name: 'John Doe',
      email: 'johndoe@example.com',
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001',
      country: 'India',
      phone: '+91 9876543210'
    }
  ]

  for (const addressData of addresses) {
    const address = await prisma.address.create({ data: addressData })
    console.log('✅ Created address for:', address.name)
  }

  // Create coupons
  const coupons = [
    {
      code: 'NEW20',
      description: '20% Off for New Users',
      discount: 20,
      forNewUser: true,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31')
    },
    {
      code: 'NEW10',
      description: '10% Off for New Users',
      discount: 10,
      forNewUser: true,
      forMember: false,
      isPublic: false,
      expiresAt: new Date('2026-12-31')
    },
    {
      code: 'OFF20',
      description: '20% Off for All Users',
      discount: 20,
      forNewUser: false,
      forMember: false,
      isPublic: true,
      expiresAt: new Date('2026-12-31')
    },
    {
      code: 'OFF10',
      description: '10% Off for All Users',
      discount: 10,
      forNewUser: false,
      forMember: false,
      isPublic: true,
      expiresAt: new Date('2026-12-31')
    },
    {
      code: 'PLUS10',
      description: '10% Off for Members',
      discount: 10,
      forNewUser: false,
      forMember: true,
      isPublic: false,
      expiresAt: new Date('2027-03-06')
    }
  ]

  for (const couponData of coupons) {
    const coupon = await prisma.coupon.create({ data: couponData })
    console.log('✅ Created coupon:', coupon.code)
  }

  console.log('🎉 Comprehensive database seeding completed!')
  
  // Display stats
  const stats = {
    users: await prisma.user.count(),
    stores: await prisma.store.count(),
    products: await prisma.product.count(),
    ratings: await prisma.rating.count(),
    coupons: await prisma.coupon.count(),
    addresses: await prisma.address.count()
  }
  
  console.log('📊 Final database stats:', stats)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
