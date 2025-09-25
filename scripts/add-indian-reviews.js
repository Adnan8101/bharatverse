const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addIndianReviews() {
  console.log('🇮🇳 Adding Indian users and comprehensive product reviews...\n')

  try {
    // Indian names and profile pictures
    const indianUsers = [
      {
        id: 'user_adnan',
        name: 'Adnan',
        email: 'adnan@example.com',
        cart: {}
      },
      {
        id: 'user_harsh',
        name: 'Harsh',
        email: 'harsh@example.com',
        cart: {}
      },
      {
        id: 'user_aadil',
        name: 'Aadil',
        email: 'aadil@example.com',
        cart: {}
      },
      {
        id: 'user_ralph',
        name: 'Ralph',
        email: 'ralph@example.com',
        cart: {}
      },
      {
        id: 'user_mitesh',
        name: 'Mitesh',
        email: 'mitesh@example.com',
        cart: {}
      },
      {
        id: 'user_rahul',
        name: 'Rahul',
        email: 'rahul@example.com',
        cart: {}
      },
      {
        id: 'user_hamza',
        name: 'Hamza',
        email: 'hamza@example.com',
        cart: {}
      },
      {
        id: 'user_aamir',
        name: 'Aamir',
        email: 'aamir@example.com',
        cart: {}
      },
      {
        id: 'user_sanket',
        name: 'Sanket',
        email: 'sanket@example.com',
        cart: {}
      },
      {
        id: 'user_amitab',
        name: 'Amitab',
        email: 'amitab@example.com',
        cart: {}
      },
      {
        id: 'user_arjun',
        name: 'Arjun',
        email: 'arjun@example.com',
        cart: {}
      },
      {
        id: 'user_priya',
        name: 'Priya',
        email: 'priya@example.com',
        cart: {}
      },
      {
        id: 'user_ravi',
        name: 'Ravi',
        email: 'ravi@example.com',
        cart: {}
      },
      {
        id: 'user_kavya',
        name: 'Kavya',
        email: 'kavya@example.com',
        cart: {}
      },
      {
        id: 'user_vikash',
        name: 'Vikash',
        email: 'vikash@example.com',
        cart: {}
      }
    ]

    // Clear existing ratings first
    console.log('🧹 Clearing existing ratings...')
    await prisma.rating.deleteMany()

    // Create or update Indian users
    console.log('👥 Creating Indian users...')
    for (const userData of indianUsers) {
      await prisma.user.upsert({
        where: { id: userData.id },
        update: userData,
        create: userData
      })
      console.log(`✅ Created/Updated user: ${userData.name}`)
    }

    // Get all products
    const products = await prisma.product.findMany()
    console.log(`\n📦 Found ${products.length} products to add reviews for\n`)

    // Comprehensive reviews for each product
    const reviewTemplates = {
      'Modern table lamp': [
        { rating: 5.0, review: 'Amazing table lamp! The lighting is perfect for reading and working. Very stylish design that matches my home decor perfectly.' },
        { rating: 4.8, review: 'Great quality lamp with excellent build. The light is warm and comfortable for the eyes. Highly recommended for anyone looking for a modern lamp.' },
        { rating: 4.5, review: 'Beautiful design and great functionality. The lamp arrived in perfect condition and was easy to set up. Love the modern look!' },
        { rating: 4.7, review: 'Perfect lamp for my study table. The lighting is just right - not too bright, not too dim. Great value for money.' },
        { rating: 4.9, review: 'Excellent product! The build quality is impressive and the design is very elegant. Adds a great touch to my room.' },
        { rating: 4.3, review: 'Good lamp overall. The light quality is good and it looks premium. Only minor issue was with the packaging but product is perfect.' },
        { rating: 4.6, review: 'Very satisfied with this purchase. The lamp works great and looks exactly like in the pictures. Fast delivery too!' },
        { rating: 5.0, review: 'Outstanding table lamp! Perfect brightness control and the design is absolutely beautiful. Worth every penny!' },
        { rating: 4.4, review: 'Nice lamp with good light output. The material feels sturdy and the design is modern. Good addition to my workspace.' },
        { rating: 4.8, review: 'Fantastic lamp! Great for both working and ambient lighting. The design is sleek and fits perfectly on my desk.' },
        { rating: 4.7, review: 'Really happy with this lamp. Good quality, nice design, and perfect lighting for my needs. Highly recommend!' },
        { rating: 4.5, review: 'Great table lamp with excellent build quality. The light is perfect for reading and the design is very contemporary.' },
        { rating: 4.9, review: 'Love this lamp! Perfect size, great light quality, and looks amazing on my nightstand. Excellent purchase!' }
      ],
      'Smart speaker gray': [
        { rating: 4.8, review: 'Excellent smart speaker! The sound quality is crystal clear and bass is amazing. Voice commands work perfectly every time.' },
        { rating: 4.6, review: 'Great speaker with rich sound. Easy to set up and connects seamlessly with my phone. The gray color looks premium.' },
        { rating: 4.7, review: 'Very impressed with the audio quality. The speaker is responsive and the build quality feels solid. Perfect for my living room.' },
        { rating: 4.9, review: 'Outstanding sound quality! The bass is deep and the highs are clear. Smart features work flawlessly. Highly recommended!' },
        { rating: 4.4, review: 'Good speaker with decent sound. The smart features are useful and it looks great in my room. Value for money product.' },
        { rating: 4.8, review: 'Amazing speaker! The sound fills the entire room and voice recognition is spot on. Great addition to my smart home.' },
        { rating: 4.5, review: 'Really happy with this speaker. Good sound quality, sleek design, and easy to use. Perfect for music and calls.' },
        { rating: 4.7, review: 'Excellent speaker with premium sound quality. The gray finish looks elegant and it connects easily to all devices.' },
        { rating: 4.3, review: 'Nice speaker overall. Sound is good for the price range and smart features work well. Good build quality too.' },
        { rating: 4.9, review: 'Fantastic speaker! Crystal clear sound, powerful bass, and very responsive to voice commands. Absolutely love it!' },
        { rating: 4.6, review: 'Great purchase! The speaker sounds amazing and looks premium. Smart features are intuitive and work great.' },
        { rating: 4.8, review: 'Superb sound quality! Perfect for both music and podcasts. The design is modern and fits perfectly in my setup.' },
        { rating: 4.5, review: 'Very satisfied with this speaker. Good audio quality, reliable connectivity, and the gray color is very stylish.' }
      ],
      'Smart watch white': [
        { rating: 4.7, review: 'Amazing smartwatch! Tracks my health perfectly and the white color looks elegant. Battery life is excellent too.' },
        { rating: 4.5, review: 'Great watch with lots of useful features. Fitness tracking is accurate and notifications work perfectly. Love the design!' },
        { rating: 4.8, review: 'Excellent smartwatch! The display is crisp and bright. Health monitoring features are very detailed and helpful.' },
        { rating: 4.6, review: 'Very happy with this purchase. The watch is comfortable to wear and all features work smoothly. Great value!' },
        { rating: 4.9, review: 'Outstanding smartwatch! Perfect for fitness tracking and daily use. The white color is beautiful and stylish.' },
        { rating: 4.4, review: 'Good watch with nice features. The health tracking is useful and the display is clear. Comfortable for all-day wear.' },
        { rating: 4.7, review: 'Fantastic watch! Great build quality, accurate sensors, and the white band looks premium. Highly recommend!' },
        { rating: 4.3, review: 'Nice smartwatch overall. Good battery life and the fitness features are helpful. The white color is very clean looking.' },
        { rating: 4.8, review: 'Love this watch! Perfect for tracking workouts and staying connected. The design is sleek and modern.' },
        { rating: 4.6, review: 'Excellent smartwatch with great features. Health monitoring is accurate and the white color matches everything.' },
        { rating: 4.5, review: 'Really impressed with this watch. Good performance, nice design, and comfortable to wear all day long.' },
        { rating: 4.9, review: 'Perfect smartwatch! All features work flawlessly and the white color is absolutely gorgeous. Best purchase!' },
        { rating: 4.7, review: 'Great watch with excellent functionality. Fitness tracking is spot on and the display is very readable.' }
      ],
      'Wireless headphones': [
        { rating: 4.9, review: 'Incredible headphones! The sound quality is amazing with deep bass and clear highs. Noise cancellation works perfectly.' },
        { rating: 4.7, review: 'Excellent headphones with premium sound quality. Very comfortable for long listening sessions. Great build quality!' },
        { rating: 4.8, review: 'Amazing wireless headphones! Battery life is fantastic and the sound is crystal clear. Perfect for music and calls.' },
        { rating: 4.6, review: 'Great headphones with impressive sound quality. Comfortable fit and good noise isolation. Highly recommended!' },
        { rating: 4.5, review: 'Very satisfied with these headphones. Good sound, comfortable design, and reliable wireless connection.' },
        { rating: 4.8, review: 'Outstanding headphones! The audio quality is superb and they\'re very comfortable to wear for hours.' },
        { rating: 4.4, review: 'Good headphones with decent sound quality. Comfortable fit and good battery life. Value for money product.' },
        { rating: 4.9, review: 'Fantastic headphones! Perfect sound balance, great bass, and excellent build quality. Love them!' },
        { rating: 4.7, review: 'Excellent wireless headphones with premium feel. Sound quality is top-notch and very comfortable to use.' },
        { rating: 4.3, review: 'Nice headphones overall. Good sound quality and comfortable design. The wireless connection is stable.' },
        { rating: 4.8, review: 'Love these headphones! Crystal clear sound, great bass response, and very comfortable for daily use.' },
        { rating: 4.6, review: 'Great purchase! The headphones sound amazing and are very comfortable. Perfect for both music and gaming.' },
        { rating: 4.5, review: 'Really happy with these headphones. Good sound quality, comfortable fit, and excellent wireless range.' }
      ],
      'Smart watch black': [
        { rating: 4.8, review: 'Excellent black smartwatch! Looks professional and all features work perfectly. Great for both work and workouts.' },
        { rating: 4.6, review: 'Amazing watch with sleek black design. Health tracking is accurate and battery life exceeds expectations.' },
        { rating: 4.7, review: 'Great smartwatch! The black color is elegant and goes with everything. Fitness features are very comprehensive.' },
        { rating: 4.9, review: 'Perfect smartwatch! Love the black design - looks premium and professional. All features work flawlessly.' },
        { rating: 4.5, review: 'Very happy with this watch. Good build quality, accurate sensors, and the black color is timeless.' },
        { rating: 4.4, review: 'Nice smartwatch with useful features. The black design looks good and it\'s comfortable to wear daily.' },
        { rating: 4.8, review: 'Outstanding watch! Great performance, sleek black design, and excellent health monitoring capabilities.' },
        { rating: 4.3, review: 'Good smartwatch overall. The black color is stylish and all basic features work well. Good value!' },
        { rating: 4.7, review: 'Fantastic watch with premium black finish. Perfect for fitness tracking and staying connected.' },
        { rating: 4.6, review: 'Excellent smartwatch! The black design is beautiful and all features work smoothly. Highly recommend!' },
        { rating: 4.5, review: 'Really impressed with this watch. Great functionality, comfortable fit, and the black color is perfect.' },
        { rating: 4.9, review: 'Love this black smartwatch! Perfect design, excellent features, and great battery life. Best purchase!' },
        { rating: 4.8, review: 'Amazing watch! The black color looks professional and all smart features work perfectly.' }
      ],
      'Security Camera': [
        { rating: 4.7, review: 'Excellent security camera! Picture quality is crystal clear even at night. Easy to set up and monitor remotely.' },
        { rating: 4.8, review: 'Great camera with amazing video quality. Motion detection works perfectly and alerts are timely. Highly recommended!' },
        { rating: 4.6, review: 'Very impressed with this camera. Clear video, good night vision, and easy mobile app control. Perfect for home security.' },
        { rating: 4.5, review: 'Good security camera with reliable performance. Easy installation and the mobile app is user-friendly.' },
        { rating: 4.9, review: 'Outstanding camera! Ultra-clear video quality and excellent night vision. Perfect for monitoring my home.' },
        { rating: 4.4, review: 'Nice camera with good features. Video quality is decent and it\'s easy to access footage from phone.' },
        { rating: 4.8, review: 'Fantastic security camera! Crystal clear video, reliable alerts, and great build quality. Worth every penny!' },
        { rating: 4.3, review: 'Good camera overall. Does the job well and the setup was straightforward. Good value for money.' },
        { rating: 4.7, review: 'Excellent camera with premium features. Night vision is impressive and motion alerts work perfectly.' },
        { rating: 4.6, review: 'Great security camera! Clear video quality and easy remote monitoring. Perfect addition to my security system.' },
        { rating: 4.5, review: 'Very satisfied with this camera. Good video quality, reliable performance, and easy to use mobile app.' },
        { rating: 4.8, review: 'Amazing camera! Perfect video clarity, excellent night vision, and very reliable motion detection.' },
        { rating: 4.7, review: 'Love this security camera! Great picture quality and the mobile app makes monitoring so easy.' }
      ],
      'Smart Pen for iPad': [
        { rating: 4.8, review: 'Amazing smart pen! Works perfectly with my iPad. Very responsive and feels natural to write with. Great for digital art!' },
        { rating: 4.6, review: 'Excellent pen for iPad! Pressure sensitivity is spot on and there\'s no lag. Perfect for note-taking and drawing.' },
        { rating: 4.7, review: 'Great smart pen with impressive precision. Works seamlessly with iPad and feels like writing on paper.' },
        { rating: 4.9, review: 'Outstanding iPad pen! Perfect for students and artists. The responsiveness is incredible and battery life is great.' },
        { rating: 4.5, review: 'Very happy with this pen. Good build quality and works perfectly with all drawing apps. Highly recommend!' },
        { rating: 4.4, review: 'Nice pen for iPad. Good precision and comfortable to hold. Perfect for digital note-taking and sketching.' },
        { rating: 4.8, review: 'Fantastic smart pen! Extremely responsive and accurate. Makes iPad usage so much more productive.' },
        { rating: 4.3, review: 'Good pen overall. Works well with iPad and is comfortable for extended use. Good value for money.' },
        { rating: 4.7, review: 'Excellent pen for iPad! Perfect for drawing and writing. The precision is amazing and feels very natural.' },
        { rating: 4.6, review: 'Great smart pen with premium feel. Works flawlessly with iPad and is perfect for creative work.' },
        { rating: 4.5, review: 'Really impressed with this pen. Great responsiveness, comfortable grip, and perfect for digital art.' },
        { rating: 4.9, review: 'Love this iPad pen! Makes drawing and writing on iPad feel natural. Excellent build quality!' },
        { rating: 4.8, review: 'Amazing pen! Perfect pressure sensitivity and zero lag. Essential accessory for any iPad user.' }
      ],
      'Home Theater': [
        { rating: 4.9, review: 'Incredible home theater system! The sound quality is absolutely amazing. Feels like being in a real cinema!' },
        { rating: 4.7, review: 'Excellent home theater! Surround sound is fantastic and setup was easier than expected. Great value!' },
        { rating: 4.8, review: 'Amazing sound system! The bass is powerful and the audio clarity is exceptional. Perfect for movies!' },
        { rating: 4.6, review: 'Great home theater system with impressive sound quality. Easy to set up and works with all devices.' },
        { rating: 4.5, review: 'Very satisfied with this theater system. Good sound quality and all features work perfectly.' },
        { rating: 4.8, review: 'Outstanding home theater! Crystal clear sound and powerful bass. Movie nights are now incredible!' },
        { rating: 4.4, review: 'Nice theater system with good features. Sound quality is impressive for the price range.' },
        { rating: 4.7, review: 'Fantastic sound system! Perfect for movies and music. The surround sound effect is amazing.' },
        { rating: 4.3, review: 'Good home theater overall. Easy setup and decent sound quality. Good upgrade for TV audio.' },
        { rating: 4.9, review: 'Love this theater system! Incredible sound quality that transforms the entire viewing experience.' },
        { rating: 4.6, review: 'Excellent home theater with premium sound. Perfect balance of bass and treble. Highly recommend!' },
        { rating: 4.8, review: 'Amazing sound system! Makes every movie feel like a theater experience. Great build quality too!' },
        { rating: 4.7, review: 'Great home theater! Perfect sound quality and easy to connect to all my devices. Worth it!' }
      ],
      'Apple Wireless Earbuds': [
        { rating: 4.8, review: 'Amazing Apple earbuds! Sound quality is exceptional and they fit perfectly. Great for workouts and calls.' },
        { rating: 4.9, review: 'Excellent earbuds with premium Apple quality. Crystal clear sound and seamless iPhone integration.' },
        { rating: 4.7, review: 'Great wireless earbuds! Perfect fit, excellent sound, and amazing battery life. Love the convenience!' },
        { rating: 4.6, review: 'Very impressed with these earbuds. Great sound quality and they stay secure during workouts.' },
        { rating: 4.5, review: 'Good Apple earbuds with reliable performance. Sound is clear and connection is always stable.' },
        { rating: 4.8, review: 'Outstanding earbuds! Perfect for daily use, great sound quality, and comfortable for hours.' },
        { rating: 4.4, review: 'Nice earbuds with decent sound. Good battery life and easy to pair with Apple devices.' },
        { rating: 4.9, review: 'Love these Apple earbuds! Perfect sound quality, great fit, and excellent build quality.' },
        { rating: 4.3, review: 'Good earbuds overall. Sound is decent and they work well with all Apple devices.' },
        { rating: 4.7, review: 'Fantastic earbuds! Great for music and calls. The wireless convenience is unbeatable.' },
        { rating: 4.6, review: 'Excellent Apple earbuds with premium features. Perfect sound and very comfortable to wear.' },
        { rating: 4.8, review: 'Amazing earbuds! Crystal clear sound, great battery life, and perfect integration with iPhone.' },
        { rating: 4.5, review: 'Really happy with these earbuds. Good sound quality, comfortable fit, and reliable connection.' }
      ],
      'Apple Smart Watch': [
        { rating: 4.9, review: 'Incredible Apple Watch! Premium build quality and all health features work perfectly. Best smartwatch ever!' },
        { rating: 4.8, review: 'Excellent Apple Watch with amazing features. Health tracking is comprehensive and very accurate.' },
        { rating: 4.7, review: 'Great Apple Watch! Perfect integration with iPhone and all apps work smoothly. Love the design!' },
        { rating: 4.6, review: 'Very impressed with this Apple Watch. Great performance, beautiful display, and excellent build quality.' },
        { rating: 4.5, review: 'Good Apple Watch with useful features. Battery life is decent and all apps work perfectly.' },
        { rating: 4.8, review: 'Outstanding Apple Watch! Perfect for fitness tracking and staying connected. Premium quality!' },
        { rating: 4.4, review: 'Nice Apple Watch with good features. Works seamlessly with iPhone and looks premium.' },
        { rating: 4.9, review: 'Love this Apple Watch! Perfect design, excellent features, and amazing build quality. Highly recommend!' },
        { rating: 4.3, review: 'Good smartwatch overall. All basic features work well and it looks great on the wrist.' },
        { rating: 4.7, review: 'Fantastic Apple Watch! Great performance, beautiful display, and comprehensive health features.' },
        { rating: 4.6, review: 'Excellent smartwatch with premium Apple quality. Perfect for both fitness and productivity.' },
        { rating: 4.8, review: 'Amazing Apple Watch! All features work flawlessly and the build quality is exceptional.' },
        { rating: 4.5, review: 'Really satisfied with this watch. Good performance, nice design, and great integration with iPhone.' }
      ],
      'RGB Gaming Mouse': [
        { rating: 4.8, review: 'Amazing gaming mouse! The RGB lighting looks fantastic and the precision is incredible for gaming.' },
        { rating: 4.7, review: 'Excellent gaming mouse with great build quality. Perfect for FPS games and the RGB effects are awesome!' },
        { rating: 4.6, review: 'Great mouse with impressive gaming performance. The RGB lighting is customizable and looks amazing.' },
        { rating: 4.9, review: 'Outstanding gaming mouse! Perfect precision, great build quality, and the RGB lighting is beautiful!' },
        { rating: 4.5, review: 'Very happy with this mouse. Good for gaming and the RGB effects add a nice touch to my setup.' },
        { rating: 4.4, review: 'Nice gaming mouse with decent features. RGB lighting works well and it\'s comfortable for gaming.' },
        { rating: 4.8, review: 'Fantastic gaming mouse! Extremely precise, comfortable grip, and amazing RGB customization options.' },
        { rating: 4.3, review: 'Good mouse overall. Works well for gaming and office work. RGB lighting is a nice bonus.' },
        { rating: 4.7, review: 'Excellent gaming mouse with premium feel. Perfect tracking and the RGB effects are stunning!' },
        { rating: 4.6, review: 'Great mouse for gaming! Good precision, comfortable design, and beautiful RGB lighting effects.' },
        { rating: 4.5, review: 'Really impressed with this gaming mouse. Great performance and the RGB lighting looks amazing!' },
        { rating: 4.9, review: 'Love this gaming mouse! Perfect for competitive gaming and the RGB effects are incredible!' },
        { rating: 4.8, review: 'Amazing mouse! Great for gaming and productivity. The RGB lighting is customizable and beautiful.' }
      ],
      'Smart Home Cleaner': [
        { rating: 4.7, review: 'Excellent smart cleaner! Cleans automatically and does a fantastic job. Very convenient and efficient.' },
        { rating: 4.8, review: 'Amazing home cleaner! Works perfectly on all surfaces and the smart features are very useful.' },
        { rating: 4.6, review: 'Great smart cleaner with impressive cleaning power. Easy to use and maintains my home perfectly.' },
        { rating: 4.5, review: 'Very satisfied with this cleaner. Good performance and the smart features make cleaning effortless.' },
        { rating: 4.9, review: 'Outstanding smart cleaner! Incredible cleaning performance and the automation features are perfect!' },
        { rating: 4.4, review: 'Nice cleaner with good features. Does a decent job cleaning and is easy to operate.' },
        { rating: 4.8, review: 'Fantastic smart cleaner! Perfect for busy lifestyle. Cleans thoroughly and quietly.' },
        { rating: 4.3, review: 'Good cleaner overall. Works well and the smart features are helpful for daily maintenance.' },
        { rating: 4.7, review: 'Excellent home cleaner! Great cleaning performance and the app control is very convenient.' },
        { rating: 4.6, review: 'Great smart cleaner with reliable performance. Perfect for keeping the house clean automatically.' },
        { rating: 4.5, review: 'Really happy with this cleaner. Good cleaning power and the smart features work perfectly.' },
        { rating: 4.9, review: 'Love this smart cleaner! Makes home maintenance so much easier. Excellent performance!' },
        { rating: 4.8, review: 'Amazing cleaner! Perfect cleaning results and the smart automation saves so much time.' }
      ]
    }

    // Create reviews for each product
    let totalReviews = 0
    for (const product of products) {
      console.log(`📝 Adding reviews for: ${product.name}`)
      
      const productReviews = reviewTemplates[product.name] || [
        { rating: 4.5, review: 'Great product! Very satisfied with the quality and performance. Highly recommend to others.' },
        { rating: 4.7, review: 'Excellent product with amazing features. Works perfectly and looks great. Worth the investment!' },
        { rating: 4.3, review: 'Good product overall. Does what it promises and the build quality is decent. Happy with purchase.' },
        { rating: 4.8, review: 'Outstanding product! Exceeded my expectations in every way. Perfect for daily use.' },
        { rating: 4.6, review: 'Really impressed with this product. Great functionality and reliable performance.' },
        { rating: 4.4, review: 'Nice product with useful features. Good value for money and works as expected.' },
        { rating: 4.9, review: 'Amazing product! Perfect quality and excellent performance. Absolutely love it!' },
        { rating: 4.2, review: 'Decent product with good features. Works well and is reliable for everyday use.' },
        { rating: 4.7, review: 'Great purchase! The product quality is excellent and it works perfectly.' },
        { rating: 4.5, review: 'Very happy with this product. Good build quality and performs exactly as described.' },
        { rating: 4.8, review: 'Fantastic product! Great design, excellent performance, and very reliable.' },
        { rating: 4.6, review: 'Excellent product with premium quality. Perfect for my needs and works flawlessly.' }
      ]

      // Assign reviews to random Indian users
      for (let i = 0; i < productReviews.length; i++) {
        const randomUser = indianUsers[Math.floor(Math.random() * indianUsers.length)]
        const reviewData = productReviews[i]
        
        try {
          await prisma.rating.create({
            data: {
              id: `review_${product.id}_${i + 1}`,
              rating: reviewData.rating,
              review: reviewData.review,
              userId: randomUser.id,
              productId: product.id,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
            }
          })
          totalReviews++
        } catch (error) {
          console.error(`Error creating review for ${product.name}:`, error.message)
        }
      }
      
      console.log(`   ✅ Added ${productReviews.length} reviews`)
    }

    console.log(`\n🎉 Successfully added ${totalReviews} Indian reviews across all products!`)
    console.log(`📊 Reviews per product: ~${Math.floor(totalReviews / products.length)} reviews`)
    console.log(`👥 Used ${indianUsers.length} Indian reviewers`)

    // Verify the results
    const reviewCounts = await prisma.rating.groupBy({
      by: ['productId'],
      _count: {
        id: true
      }
    })

    console.log('\n📈 Review distribution by product:')
    for (const count of reviewCounts) {
      const product = products.find(p => p.id === count.productId)
      console.log(`   ${product?.name}: ${count._count.id} reviews`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addIndianReviews()
