const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleContactForms() {
  const sampleForms = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      subject: 'Product Inquiry',
      message: 'Hi, I\'m interested in learning more about your smart watches. Do you have any new models coming soon?',
      type: 'general',
      status: 'pending'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      subject: 'Technical Support - Login Issue',
      message: 'I\'m having trouble logging into my account. I\'ve tried resetting my password but I\'m not receiving the email. Can you help?',
      type: 'support',
      status: 'pending'
    },
    {
      name: 'Mike Wilson',
      email: 'mike.wilson@business.com',
      subject: 'Partnership Opportunity',
      message: 'Hello, I represent TechCorp and we\'re interested in discussing a potential business partnership. We sell complementary electronics and would like to explore collaboration opportunities.',
      type: 'business',
      status: 'replied',
      adminReply: 'Thank you for your interest in partnering with BharatVerse. We\'d be happy to discuss this opportunity. I\'ll have our business development team reach out to you within the next 2 business days.',
      repliedBy: 'BharatVerse Admin',
      repliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      name: 'Lisa Chen',
      email: 'lisa.chen@email.com',
      subject: 'Website Feedback',
      message: 'I love the new design of your website! The navigation is much easier now. Just wanted to share some positive feedback.',
      type: 'feedback',
      status: 'closed'
    },
    {
      name: 'David Brown',
      email: 'david.brown@test.com',
      subject: 'Bug Report - Cart Issue',
      message: 'I found a bug where items in my cart disappear when I refresh the page. This happened multiple times. Browser: Chrome Version 120.0.6099.216',
      type: 'bug',
      status: 'pending'
    }
  ];

  console.log('🔧 Creating sample contact forms...');
  
  for (const formData of sampleForms) {
    const form = await prisma.contactForm.create({ data: formData });
    console.log(`✅ Created contact form: ${form.subject}`);
  }
  
  console.log('🎉 Sample contact forms created successfully!');
}

createSampleContactForms()
  .catch((e) => {
    console.error('❌ Error creating sample contact forms:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
