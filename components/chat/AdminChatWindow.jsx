'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useChat } from './ChatContext';

export default function AdminChatWindow({ conversation, onBack }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const {
    messages,
    setMessages,
    currentConversation,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    typingUsers
  } = useChat();

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
      fetchMessages(conversation.id);
      // Mark as read
      markAsRead(conversation.id, 'admin');
    }
  }, [conversation]);

  useEffect(() => {
    if (autoScroll && !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, autoScroll, isUserScrolling]);

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const lastScrollTop = useRef(0);
  const scrollCheckTimeout = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10;
    
    // Clear any existing timeout
    if (scrollCheckTimeout.current) {
      clearTimeout(scrollCheckTimeout.current);
    }
    
    // Check if user is actively scrolling
    const isScrollingUp = scrollTop < lastScrollTop.current;
    const hasScrolledSignificantly = Math.abs(scrollTop - lastScrollTop.current) > 5;
    
    if (isScrollingUp && hasScrolledSignificantly) {
      setIsUserScrolling(true);
      setAutoScroll(false);
    } else if (isAtBottom) {
      setIsUserScrolling(false);
      setAutoScroll(true);
    }
    
    lastScrollTop.current = scrollTop;
    
    // Set a timeout to reset user scrolling state if they stop scrolling
    scrollCheckTimeout.current = setTimeout(() => {
      if (isAtBottom) {
        setIsUserScrolling(false);
        setAutoScroll(true);
      }
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation) return;

    const messageText = message.trim();
    setMessage('');
    stopTyping(currentConversation.id, 'admin', currentConversation.storeId);

    // Add message to local state immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.id,
      senderId: 'admin',
      senderType: 'admin',
      message: messageText,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    sendMessage(currentConversation.id, 'admin', 'admin', messageText);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && currentConversation) {
      setIsTyping(true);
      startTyping(currentConversation.id, 'admin', currentConversation.storeId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentConversation) {
        stopTyping(currentConversation.id, 'admin', currentConversation.storeId);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-purple-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <ArrowLeft size={18} />
          </button>
          
          {conversation.store.logo ? (
            <img
              src={conversation.store.logo}
              alt={conversation.store.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {conversation.store.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.store.name}</h3>
            <p className="text-sm text-gray-500">{conversation.store.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            conversation.store.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : conversation.store.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {conversation.store.status}
          </span>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Phone size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Video size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm">Start a conversation with {conversation.store.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderType === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderType === 'admin' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {formatTime(msg.createdAt)}
                  {msg.senderType === 'admin' && (
                    <span className="ml-1">
                      {msg.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.includes(`store-${conversation.storeId}`) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Show scroll to bottom button when user is scrolling */}
      {isUserScrolling && (
        <div className="absolute bottom-20 right-6">
          <button
            onClick={() => {
              setAutoScroll(true);
              setIsUserScrolling(false);
              scrollToBottom();
            }}
            className="bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Smile size={18} />
          </button>
          <div className="flex-1">
            <textarea
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${conversation.store.name}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
