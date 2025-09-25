import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/profile(.*)'
  // Removed '/store(.*)' - store routes use their own authentication
]);

// Define admin routes that should be excluded from Clerk protection
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/admin-login(.*)',
  '/api/admin(.*)'
]);

// Define store owner routes that should be excluded from Clerk protection
const isStoreOwnerRoute = createRouteMatcher([
  '/store-owner-login(.*)',
  '/api/store-owner(.*)'
]);

// Define Clerk sign-in routes that should be excluded from protection
const isClerkAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip all processing for admin, store owner, and clerk auth routes
  if (isAdminRoute(req) || isStoreOwnerRoute(req) || isClerkAuthRoute(req)) {
    return;
  }
  
  // Handle store routes separately (they should use store owner auth, not Clerk)
  if (req.nextUrl.pathname.startsWith('/store')) {
    // Let the store layout handle authentication
    return;
  }
  
  // Only protect other specific routes with Clerk
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Redirect to Clerk sign-in for regular user routes
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
