#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * Checks if all required environment variables are properly loaded
 */

const requiredEnvVars = [
  // Database
  'DATABASE_URL',
  'DIRECT_URL',
  
  // Authentication
  'JWT_SECRET',
  
  // Payment
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  
  // App Configuration
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_CURRENCY_SYMBOL',
  
  // AI
  'GEMINI_API_KEY',
  
  // Real-time
  'NEXT_PUBLIC_SOCKET_URL'
];

const optionalEnvVars = [
  // Clerk (if using clerk auth)
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  
  // Email (if using email features)
  'GMAIL_USER',
  'GMAIL_CLIENT_ID',
  'GMAIL_CLIENT_SECRET'
];

console.log('🔍 Verifying Environment Variables...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

let missingRequired = [];
let missingOptional = [];
let validRequired = [];
let validOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    validRequired.push(varName);
  } else {
    missingRequired.push(varName);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    validOptional.push(varName);
  } else {
    missingOptional.push(varName);
  }
});

// Report results
console.log('✅ Required Variables Found:');
validRequired.forEach(varName => {
  console.log(`   ${varName}: ${process.env[varName] ? 'SET' : 'NOT SET'}`);
});

if (missingRequired.length > 0) {
  console.log('\n❌ Missing Required Variables:');
  missingRequired.forEach(varName => {
    console.log(`   ${varName}: MISSING`);
  });
}

console.log('\n📋 Optional Variables:');
validOptional.forEach(varName => {
  console.log(`   ✅ ${varName}: SET`);
});

if (missingOptional.length > 0) {
  missingOptional.forEach(varName => {
    console.log(`   ⚪ ${varName}: NOT SET (optional)`);
  });
}

// Final status
console.log('\n🎯 Environment Status:');
if (missingRequired.length === 0) {
  console.log('✅ All required environment variables are configured!');
  console.log('🚀 Platform is ready to run!');
  process.exit(0);
} else {
  console.log(`❌ Missing ${missingRequired.length} required environment variables`);
  console.log('📝 Please check .env.local file and add missing variables');
  process.exit(1);
}
