import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Gmail OAuth2 Configuration
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  try {
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Email Templates
const emailTemplates = {
  orderCreated: ({ order, user, store }) => ({
    subject: `🎉 Order Confirmation - #${order.id.slice(-8)}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .order-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🛍️ Order Confirmed!</h1>
            <p>Thank you for your purchase, ${user.name}!</p>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> #${order.id.slice(-8)}</p>
              <p><strong>Store:</strong> ${store.name}</p>
              <p><strong>Total Amount:</strong> ₹${order.total}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <h3>Items Ordered:</h3>
            ${order.orderItems.map(item => `
              <div class="order-item">
                <p><strong>${item.product?.name || 'Product'}</strong></p>
                <p>Quantity: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}</p>
              </div>
            `).join('')}
            <p>We'll send you updates about your order status. Thank you for shopping with us!</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  newOrderAlert: ({ order, user, store }) => ({
    subject: `🔔 New Order Alert - ${store.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-details { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .order-item { border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
            <p>You have a new order for ${store.name}</p>
          </div>
          <div class="content">
            <h2>Order Information</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> #${order.id.slice(-8)}</p>
              <p><strong>Customer:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Total Amount:</strong> ₹${order.total}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <h3>Items Ordered:</h3>
            ${order.orderItems.map(item => `
              <div class="order-item">
                <p><strong>${item.product?.name || 'Product'}</strong></p>
                <p>Quantity: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}</p>
              </div>
            `).join('')}
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store/orders" class="btn">
              View Order Details
            </a>
            <p>Please process this order promptly to ensure customer satisfaction.</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse Store Management</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  orderStatusUpdate: ({ order, user, store, newStatus }) => ({
    subject: `📦 Order Update - #${order.id.slice(-8)} is now ${newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-update { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
            <p>Your order status has been updated!</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <div class="status-update">
              <h3>Order #${order.id.slice(-8)} Status Update</h3>
              <p><strong>New Status:</strong> ${newStatus}</p>
              <p><strong>Store:</strong> ${store.name}</p>
              <p><strong>Total Amount:</strong> ₹${order.total}</p>
              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${newStatus === 'DELIVERED' ? `
              <p>🎉 Your order has been delivered! We hope you love your purchase.</p>
              <p>Please consider leaving a review to help other customers.</p>
            ` : newStatus === 'SHIPPED' ? `
              <p>📦 Great news! Your order is on its way to you.</p>
              <p>You should receive it within the estimated delivery time.</p>
            ` : newStatus === 'PROCESSING' ? `
              <p>⚡ Your order is being processed and will be shipped soon.</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  storeApplicationApproved: (store) => ({
    subject: `🎉 Congratulations! Your store "${store.name}" has been approved!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .approval-notice { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 Store Approved!</h1>
            <p>Welcome to the BharatVerse marketplace!</p>
          </div>
          <div class="content">
            <div class="approval-notice">
              <h2>Congratulations!</h2>
              <p>Your store "<strong>${store.name}</strong>" has been successfully approved and is now live on BharatVerse!</p>
              <p><strong>Store Username:</strong> ${store.username}</p>
              <p><strong>Store Email:</strong> ${store.email}</p>
            </div>
            <h3>What's next?</h3>
            <ul>
              <li>Log in to your store dashboard</li>
              <li>Add your first products</li>
              <li>Customize your store profile</li>
              <li>Start receiving orders!</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store-owner-login" class="btn">
              Access Store Dashboard
            </a>
            <p>We're excited to have you as part of our marketplace family!</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>Need help? Contact our support team anytime.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  storeApplicationRejected: ({ store, reason }) => ({
    subject: `❌ Store Application Update - ${store.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .rejection-notice { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Store Application Update</h1>
            <p>Regarding your store application</p>
          </div>
          <div class="content">
            <div class="rejection-notice">
              <h2>Application Status Update</h2>
              <p>Unfortunately, your store application for "<strong>${store.name}</strong>" could not be approved at this time.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <h3>What can you do?</h3>
            <ul>
              <li>Review our store guidelines</li>
              <li>Make necessary improvements</li>
              <li>Submit a new application</li>
              <li>Contact our support team for guidance</li>
            </ul>
            <p>We encourage you to apply again once you've addressed the requirements.</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>Contact support: support@bharatverse.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  forgotPasswordOTP: ({ storeName, otp, email }) => ({
    subject: `🔐 Password Reset Code for ${storeName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .otp-section { background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #8b5cf6; }
          .otp-code { font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 5px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Reset your store password</p>
          </div>
          <div class="content">
            <h2>Hello ${storeName},</h2>
            <p>You requested to reset your password for your BharatVerse store account.</p>
            
            <div class="otp-section">
              <h3>Your verification code is:</h3>
              <div class="otp-code">${otp}</div>
              <p>Enter this code to verify your identity and reset your password.</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="text-align: left; margin: 10px 0;">
                <li>This code expires in 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any concerns, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordResetSuccess: ({ storeName }) => ({
    subject: `✅ Password Reset Successful - ${storeName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .success-notice { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Your password has been updated</p>
          </div>
          <div class="content">
            <div class="success-notice">
              <h2>Password Updated Successfully!</h2>
              <p>Your password for store "<strong>${storeName}</strong>" has been successfully reset.</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>You can now log in to your store dashboard with your new password.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store-owner-login" class="btn">
              Login to Dashboard
            </a>
            <p>If you didn't perform this action, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  contactFormConfirmation: ({ name, subject }) => ({
    subject: `✅ We received your message - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .confirmation-notice { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>📧 Message Received</h1>
            <p>Thank you for contacting BharatVerse</p>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <div class="confirmation-notice">
              <h3>✅ Your message has been received!</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Thank you for reaching out to us. We've received your message and our team will review it shortly.</p>
            <p>You can expect a response from our team within 24-48 hours during business days.</p>
            <p>If your inquiry is urgent, you can also reach us at:</p>
            <ul>
              <li>📞 Phone: 8433654302</li>
              <li>📧 Email: adnanqureshi8101@gmail.com</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>Mumbai, Maharashtra, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  contactReply: ({ name, originalSubject, reply, adminName }) => ({
    subject: `💬 Reply to: ${originalSubject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .reply-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .original-subject { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
          .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>💬 Reply from BharatVerse Team</h1>
            <p>Response to your inquiry</p>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for your patience. Here's our response to your inquiry:</p>
            
            <div class="original-subject">
              <strong>Original Subject:</strong> ${originalSubject}
            </div>

            <div class="reply-box">
              <h3>Our Response:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${reply}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p><strong>Best regards,</strong><br>
              ${adminName}<br>
              BharatVerse Support Team</p>
            </div>

            <p>If you have any additional questions or need further assistance, please don't hesitate to contact us again.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contact" class="btn">
              Contact Us Again
            </a>

            <p><strong>Contact Information:</strong></p>
            <ul>
              <li>📞 Phone: 8433654302</li>
              <li>📧 Email: adnanqureshi8101@gmail.com</li>
              <li>🕒 Business Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 BharatVerse. All rights reserved.</p>
            <p>Mumbai, Maharashtra, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Email sending functions
export const sendEmail = async (to, templateName, templateData) => {
  try {
    const transporter = await createTransporter();
    
    // Get the correct template function and call it with the template data
    const templateFunction = emailTemplates[templateName];
    if (!templateFunction) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    const template = templateFunction(templateData);
    
    const mailOptions = {
      from: `"BharatVerse" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions for different events
export const sendOrderConfirmation = async (order, user, store) => {
  return await sendEmail(user.email, 'orderCreated', { order, user, store });
};

export const sendNewOrderAlert = async (order, user, store) => {
  return await sendEmail(store.email, 'newOrderAlert', { order, user, store });
};

export const sendOrderStatusUpdate = async (order, user, store, newStatus) => {
  return await sendEmail(user.email, 'orderStatusUpdate', { order, user, store, newStatus });
};

export const sendStoreApprovalEmail = async (store) => {
  return await sendEmail(store.email, 'storeApplicationApproved', store);
};

export const sendStoreRejectionEmail = async (store, reason) => {
  return await sendEmail(store.email, 'storeApplicationRejected', { store, reason });
};

export const sendForgotPasswordOTP = async (email, storeName, otp) => {
  return await sendEmail(email, 'forgotPasswordOTP', { storeName, otp, email });
};

export const sendPasswordResetSuccess = async (email, storeName) => {
  return await sendEmail(email, 'passwordResetSuccess', { storeName });
};

export const sendContactFormConfirmation = async (email, name, subject) => {
  return await sendEmail(email, 'contactFormConfirmation', { name, subject });
};

export const sendContactReply = async (email, name, originalSubject, reply, adminName) => {
  return await sendEmail(email, 'contactReply', { name, originalSubject, reply, adminName });
};
