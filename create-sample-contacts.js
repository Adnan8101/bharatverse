import { prisma } from './lib/prisma.js';

async function createSampleContactForms() {
  console.log('🌱 Creating sample contact forms...');

  const sampleForms = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'Question about product availability',
      message: 'Hi, I wanted to ask about the availability of the Smart Watch Black. Is it currently in stock?',
      type: 'general',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      subject: 'Technical support needed',
      message: 'I\'m having trouble with my order #12345. The tracking information hasn\'t updated in 3 days. Can you please help?',
      type: 'support',
      status: 'replied',
      adminReply: 'Hi Sarah, I\'ve looked into your order and contacted our shipping partner. Your package is currently in transit and should arrive within 2 business days. We apologize for the delay and the lack of tracking updates.',
      repliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      repliedBy: 'BharatVerse Admin',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      subject: 'Business partnership inquiry',
      message: 'Hello, I represent TechGadgets Inc. and we\'re interested in discussing a potential partnership opportunity. Could we schedule a call to discuss wholesale pricing?',
      type: 'business',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      name: 'Emma Chen',
      email: 'emma.chen@example.com',
      subject: 'Website feedback',
      message: 'I love your website design! The checkout process is very smooth. Just wanted to give positive feedback and suggest adding more payment options like cryptocurrency.',
      type: 'feedback',
      status: 'closed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      name: 'David Rodriguez',
      email: 'david.rodriguez@example.com',
      subject: 'Bug report - Cart not updating',
      message: 'I found a bug on your website. When I add items to my cart and refresh the page, sometimes the items disappear. This happens on Chrome browser, version 118.',
      type: 'bug',
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ];

  for (const formData of sampleForms) {
    try {
      const contactForm = await prisma.contactForm.create({ data: formData });
      console.log('✅ Created contact form:', contactForm.subject);
    } catch (error) {
      console.error('❌ Failed to create contact form:', formData.subject, error.message);
    }
  }

  console.log('🎉 Sample contact forms created!');
}

createSampleContactForms()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
