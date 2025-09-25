'use client';
import { useState } from 'react';
import { MessageCircle, Users, Bell, Store } from 'lucide-react';
import { ChatProvider } from '@/components/chat/ChatContext';
import AdminChatList from '@/components/chat/AdminChatList';
import AdminChatWindow from '@/components/chat/AdminChatWindow';
import AdminStoreToStoreMonitor from '@/components/admin/AdminStoreToStoreMonitor';

export default function AdminLiveChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatList, setShowChatList] = useState(true);
  const [activeTab, setActiveTab] = useState('admin-store'); // 'admin-store' or 'store-store'

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatList(false); // Hide list on mobile when chat is selected
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedConversation(null);
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-6 h-6 text-purple-600 mr-2" />
                  Live Chat Management
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  Admin Panel
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Tab Navigation */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('admin-store')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'admin-store'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    Admin Chats
                  </button>
                  <button
                    onClick={() => setActiveTab('store-store')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'store-store'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Store className="w-4 h-4 inline mr-1" />
                    Store Chats
                  </button>
                </div>
                
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'admin-store' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
              {/* Chat List - Always visible on desktop, conditionally on mobile */}
              <div className={`lg:col-span-1 ${showChatList ? 'block' : 'hidden lg:block'}`}>
                <AdminChatList 
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>

              {/* Chat Window - Always visible on desktop, conditionally on mobile */}
              <div className={`lg:col-span-2 ${!showChatList ? 'block' : 'hidden lg:block'}`}>
                <AdminChatWindow 
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                />
              </div>
            </div>
          ) : (
            <AdminStoreToStoreMonitor />
          )}

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">7</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Stores</p>
                  <p className="text-2xl font-semibold text-gray-900">18</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Messages</p>
                  <p className="text-2xl font-semibold text-gray-900">43</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-gray-900">Broadcast Message</div>
                <div className="text-sm text-gray-600 mt-1">Send announcement to all stores</div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-gray-900">Export Chat History</div>
                <div className="text-sm text-gray-600 mt-1">Download conversation logs</div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-gray-900">Chat Analytics</div>
                <div className="text-sm text-gray-600 mt-1">View detailed chat statistics</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
