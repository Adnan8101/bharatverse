'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { useStoreToStoreChat } from './StoreToStoreChatContext';

export default function StoreToStoreChatWindow({ 
  conversation, 
  currentStoreId, 
  onBack 
}) {
  const [message, setMessage] = useState('');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastScrollTop = useRef(0);
  const scrollCheckTimeout = useRef(null);
  
  const {
    messages,
    currentConversation,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    fetchMessages
  } = useStoreToStoreChat();

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
      fetchMessages(conversation.id);
      markAsRead(conversation.id, currentStoreId);
    }
  }, [conversation]);

  // Enhanced scroll management
  useEffect(() => {
    if (autoScroll && !isUserScrolling && messagesEndRef.current) {
      scrollToBottom();
    }
  }, [messages, autoScroll, isUserScrolling]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

    try {
      await sendMessage(currentConversation.id, currentStoreId, messageText);
      // The context will handle refreshing messages
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error toast
    }
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

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Select a conversation to start chatting</p>
          <p className="text-gray-500 text-sm mt-2">Choose from your existing chats or start a new one</p>
        </div>
      </div>
    );
  }

  const otherStore = conversation.otherStore;
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {otherStore?.logo ? (
            <img
              src={otherStore.logo}
              alt={otherStore.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">
                {otherStore?.name?.charAt(0).toUpperCase() || 'S'}
              </span>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherStore?.name || 'Unknown Store'}
            </h3>
            <p className="text-sm text-gray-500">
              @{otherStore?.username || 'unknown'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        onScroll={handleScroll}
      >
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>
            
            {/* Messages for this date */}
            {dateMessages.map((msg, index) => {
              const isOwn = msg.senderId === currentStoreId;
              const showAvatar = !isOwn && (index === 0 || dateMessages[index - 1].senderId !== msg.senderId);
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    {!isOwn && showAvatar && (
                      <div className="flex-shrink-0">
                        {otherStore?.logo ? (
                          <img
                            src={otherStore.logo}
                            alt={otherStore.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-semibold">
                              {otherStore?.name?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-6"></div>}
                    
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
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
      <div className="p-4 border-t bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${otherStore?.name || 'store'}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows="1"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-lg transition-colors ${
              message.trim()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
