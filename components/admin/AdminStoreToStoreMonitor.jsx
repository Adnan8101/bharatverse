'use client';
import { useState, useEffect } from 'react';
import { Users, MessageCircle, Eye, Filter, Search } from 'lucide-react';

export default function AdminStoreToStoreMonitor() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsReadByAdmin(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/store-to-store/admin?filter=${filter}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`/api/chat/store-to-store/messages?conversationId=${conversationId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsReadByAdmin = async (conversationId) => {
    try {
      await fetch('/api/chat/store-to-store/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ conversationId })
      });
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadByAdmin: false }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.store1.name.toLowerCase().includes(searchLower) ||
      conv.store2.name.toLowerCase().includes(searchLower) ||
      conv.store1.username.toLowerCase().includes(searchLower) ||
      conv.store2.username.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-6 h-6 text-purple-600 mr-2" />
            Store-to-Store Chat Monitor
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Conversations</option>
              <option value="unread">Unread by Admin</option>
              <option value="active">Active (24h)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Conversations List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${conversation.unreadByAdmin ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {/* Store 1 Avatar */}
                      {conversation.store1.logo ? (
                        <img
                          src={conversation.store1.logo}
                          alt={conversation.store1.name}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-semibold">
                            {conversation.store1.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Store 2 Avatar */}
                      {conversation.store2.logo ? (
                        <img
                          src={conversation.store2.logo}
                          alt={conversation.store2.name}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-green-600 text-xs font-semibold">
                            {conversation.store2.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {conversation.unreadByAdmin && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      {conversation.unreadByStore1 > 0 && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-1 rounded">
                          {conversation.unreadByStore1}
                        </span>
                      )}
                      {conversation.unreadByStore2 > 0 && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-1 rounded">
                          {conversation.unreadByStore2}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {conversation.messageCount} messages
                  </span>
                </div>
                
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {conversation.store1.name} ↔ {conversation.store2.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    @{conversation.store1.username} ↔ @{conversation.store2.username}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  )}
                  {conversation.lastMessageAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last activity: {formatTime(conversation.lastMessageAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages View */}
        <div className="border rounded-lg">
          {selectedConversation ? (
            <div className="h-96 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900">
                  {selectedConversation.store1.name} ↔ {selectedConversation.store2.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {messages.length} messages
                </p>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {date}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    {dateMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        {/* Sender avatar */}
                        <div className="flex-shrink-0">
                          {message.sender.logo ? (
                            <img
                              src={message.sender.logo}
                              alt={message.sender.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-xs font-semibold">
                                {message.sender.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
