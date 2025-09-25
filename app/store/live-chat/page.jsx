'use client';
import { useEffect, useState } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatProvider } from '@/components/chat/ChatContext';
import StoreChatWindow from '@/components/chat/StoreChatWindow';

export default function StoreLiveChatPage() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      console.log('Fetching store info...');
      // Always fetch from API to ensure fresh data
      const response = await fetch('/api/store-owner/verify', {
        credentials: 'include'
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.store) {
        setStoreInfo(data.store);
        console.log('Store info set:', data.store);
      } else {
        console.error('Store verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access live chat</p>
          <Link
            href="/store-owner-login"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/store"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  <span className="font-medium">Back to Dashboard</span>
                </Link>
                
                {/* Show store status badge if suspended/rejected */}
                {(storeInfo.status === 'suspended' || storeInfo.status === 'rejected') && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    storeInfo.status === 'suspended' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    Store {storeInfo.status === 'suspended' ? 'Suspended' : 'Rejected'}
                  </span>
                )}
                <div className="h-6 border-l border-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-6 h-6 text-purple-600 mr-2" />
                  Live Chat Support
                </h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{storeInfo.name}</p>
                  <p className="text-xs text-gray-500">{storeInfo.email}</p>
                </div>
                {storeInfo.logo ? (
                  <img
                    src={storeInfo.logo}
                    alt={storeInfo.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {storeInfo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Chat with Admin Support</h3>
                  <p className="text-sm text-gray-600">
                    Get help with your store, products, orders, and more. Our admin team is here to help!
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Window */}
            {storeInfo.id ? (
              <StoreChatWindow 
                storeId={storeInfo.id} 
                storeName={storeInfo.name}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading chat...</p>
                  <p className="text-xs text-gray-500 mt-2">Store ID: {storeInfo?.id || 'Not found'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Help Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-sm text-gray-600">
                Our admin team typically responds within 30 minutes during business hours.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-sm text-gray-600">
                You'll receive an email notification when the admin replies to your message.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Available</h3>
              <p className="text-sm text-gray-600">
                Send messages anytime. We'll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
