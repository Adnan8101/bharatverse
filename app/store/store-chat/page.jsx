'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { StoreToStoreChatProvider, useStoreToStoreChat } from '@/components/chat/StoreToStoreChatContext';
import StoreConversationList from '@/components/chat/StoreConversationList';
import StoreToStoreChatWindow from '@/components/chat/StoreToStoreChatWindow';
import StoreSelectionModal from '@/components/chat/StoreSelectionModal';

function StoreToStoreChatContent() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatList, setShowChatList] = useState(true);
  const [showStoreSelection, setShowStoreSelection] = useState(false);

  const { createOrGetConversation } = useStoreToStoreChat();

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch('/api/store-owner/verify', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.store) {
        setStoreInfo(data.store);
      } else {
        console.error('Store verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedConversation(null);
  };

  const handleNewConversation = () => {
    setShowStoreSelection(true);
  };

  const handleSelectStore = async (store) => {
    try {
      const conversation = await createOrGetConversation(storeInfo.id, store.id);
      
      // Add the otherStore info to the conversation object
      conversation.otherStore = store;
      
      setSelectedConversation(conversation);
      setShowChatList(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store chat...</p>
        </div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in as a store owner to access chat.</p>
          <Link 
            href="/store-owner-login"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/store"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <MessageCircle className="w-6 h-6 text-purple-600 mr-2" />
                Store Chat
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{storeInfo.name}</span>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
          {/* Conversation List - Always visible on desktop, conditionally on mobile */}
          <div className={`lg:col-span-1 ${showChatList ? 'block' : 'hidden lg:block'}`}>
            <StoreConversationList
              currentStoreId={storeInfo.id}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window - Always visible on desktop, conditionally on mobile */}
          <div className={`lg:col-span-2 ${!showChatList ? 'block' : 'hidden lg:block'} relative`}>
            <StoreToStoreChatWindow
              conversation={selectedConversation}
              currentStoreId={storeInfo.id}
              onBack={handleBackToList}
            />
          </div>
        </div>
      </div>

      {/* Store Selection Modal */}
      <StoreSelectionModal
        isOpen={showStoreSelection}
        onClose={() => setShowStoreSelection(false)}
        currentStoreId={storeInfo.id}
        onSelectStore={handleSelectStore}
      />
    </div>
  );
}

export default function StoreToStoreChatPage() {
  return (
    <StoreToStoreChatProvider>
      <StoreToStoreChatContent />
    </StoreToStoreChatProvider>
  );
}
