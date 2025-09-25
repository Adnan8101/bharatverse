# BharatVerse - Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (https://vercel.com)
2. GitHub repository connected to Vercel
3. All environment variables configured
4. Database hosted on a service like Neon, PlanetScale, or Railway

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database_name?schema=public
DIRECT_URL=postgresql://username:password@host:port/database_name?schema=public
```

### Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
CLERK_ENCRYPTION_KEY=your_clerk_encryption_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Payment Gateway (Razorpay)
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_CURRENCY_SYMBOL=₹
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Email Service (Gmail OAuth2)
```
GMAIL_USER=your-gmail@gmail.com
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_ACCESS_TOKEN=your_gmail_access_token
```

### AI Integration
```
GEMINI_API_KEY=your_gemini_api_key
```

### Real-time Communication
```
NEXT_PUBLIC_SOCKET_URL=https://your-domain.vercel.app
```

## Deployment Steps

### 1. Prepare the Repository

1. Push all changes to your GitHub repository
2. Ensure all dependencies are listed in `package.json`
3. Verify that `vercel.json` configuration is correct

### 2. Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select "Next.js" as the framework preset

### 3. Configure Environment Variables

1. In the Vercel dashboard, go to your project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables listed above
4. Make sure to set the correct values for production

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your application will be available at your Vercel domain

### 5. Database Setup

1. Run database migrations after deployment
2. You can use Vercel CLI or your database provider's interface
3. Make sure your database is accessible from Vercel's servers

## Build Configuration

The project includes:

- `vercel.json` for Vercel-specific configuration
- Updated `next.config.mjs` with production optimizations
- Build scripts that include Prisma generation

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test user authentication (sign up/sign in)
- [ ] Confirm database connectivity
- [ ] Verify API endpoints work
- [ ] Test payment integration
- [ ] Check email functionality
- [ ] Validate store creation and management
- [ ] Test product uploads and management
- [ ] Verify real-time features work

## Monitoring and Maintenance

1. Monitor Vercel Analytics for performance
2. Set up error tracking (consider Sentry integration)
3. Regular database backups
4. Monitor API usage and limits
5. Keep dependencies updated

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check if all dependencies are listed in package.json
2. **Database Connection**: Verify DATABASE_URL and DIRECT_URL are correct
3. **Authentication Issues**: Confirm Clerk keys are set for production
4. **API Errors**: Check function timeouts and memory limits in Vercel settings

### Support Resources:

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma with Vercel: https://www.prisma.io/docs/guides/deployment/deploying-to-vercel

## Performance Optimization

The deployment includes:

- Image optimization enabled
- Automatic static optimization
- API route caching where appropriate
- Database connection pooling
- Gzip compression
- CDN distribution via Vercel Edge Network

## Security Considerations

- All sensitive data stored in environment variables
- CORS headers configured properly
- JWT secrets properly secured
- Database connections encrypted
- HTTPS enforced by default on Vercel

---

For any deployment issues, refer to the Vercel documentation or contact the development team.
