// Load environment variables
require('dotenv').config()

// Test script to verify our integrations
console.log('🧪 Testing Razorpay integration...')

// Test 1: Check if environment variables are set
console.log('📋 Environment Variables:')
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing')
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing')

// Test 2: Check Razorpay package
try {
  const Razorpay = require('razorpay')
  console.log('📦 Razorpay package: ✅ Installed')
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  console.log('🔗 Razorpay instance: ✅ Created')
} catch (error) {
  console.log('📦 Razorpay package: ❌ Error -', error.message)
}

console.log('✨ Test completed!')
