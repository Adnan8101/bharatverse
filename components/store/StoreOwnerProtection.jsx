'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function StoreOwnerProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if store owner token exists in cookies
        const response = await fetch('/api/store-owner/verify', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && (data.store.status === 'approved' || data.store.status === 'suspended' || data.store.status === 'rejected')) {
          setIsAuthenticated(true);
        } else if (data.success && data.store.status === 'pending') {
          // Redirect to login page which will show pending modal
          router.push('/store-owner-login');
        } else {
          router.push('/store-owner-login');
        }
      } catch (error) {
        router.push('/store-owner-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
