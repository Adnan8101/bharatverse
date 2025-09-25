'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Upload, X } from 'lucide-react';
import { useChat } from './ChatContext';
import MediaViewer from './MediaViewer';

export default function StoreChatWindow({ storeId, storeName }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const {
    messages,
    setMessages,
    currentConversation,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    joinRoom,
    typingUsers,
    isConnected
  } = useChat();

  useEffect(() => {
    // Join store room
    joinRoom('store', storeId);
    
    // Fetch conversation and messages
    fetchConversation();
  }, [storeId]);

  useEffect(() => {
    if (autoScroll && !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, autoScroll, isUserScrolling]);

  useEffect(() => {
    // Mark messages as read when conversation loads
    if (currentConversation) {
      markAsRead(currentConversation.id, 'store');
    }
  }, [currentConversation]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      console.log('Fetching conversation for storeId:', storeId);
      const response = await fetch(`/api/chat/conversation?storeId=${storeId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('Conversation response:', data);
      
      if (data.success) {
        setCurrentConversation(data.conversation);
        // Set initial messages from conversation
        if (data.conversation.messages) {
          setMessages(data.conversation.messages);
        }
      } else {
        console.error('Failed to fetch conversation:', data.message);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };  const scrollToBottom = () => {
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

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation.id,
      senderId: storeId,
      senderType: 'store',
      message: messageText,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, tempMessage]);

    // Send via API
    try {
      const response = await sendMessage(currentConversation.id, storeId, 'store', messageText);
      // Don't need to update messages here - polling will handle it
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', currentConversation?.id || '');

        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          uploadedFiles.push(data.file);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }

    return uploadedFiles;
  };

  const handleSendWithMedia = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    if (!currentConversation) return;

    let uploadedFiles = [];
    
    // Upload files first if any
    if (selectedFiles.length > 0) {
      uploadedFiles = await uploadFiles();
    }

    // Send text message if any
    if (message.trim()) {
      await handleSendMessage();
    }

    // Send media messages
    for (const file of uploadedFiles) {
      const mediaMessage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        conversationId: currentConversation.id,
        senderId: storeId,
        senderType: 'store',
        message: file.originalName,
        messageType: 'media',
        mediaUrl: file.url,
        mediaType: file.type,
        mediaSize: file.size,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      setMessages(prev => [...prev, mediaMessage]);
      
      try {
        await sendMessage(currentConversation.id, storeId, 'store', file.originalName, 'media', file.url);
      } catch (error) {
        console.error('Error sending media message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== mediaMessage.id));
      }
    }

    // Clear selected files
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && currentConversation) {
      setIsTyping(true);
      startTyping(currentConversation.id, 'store', storeId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentConversation) {
        stopTyping(currentConversation.id, 'store', storeId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Admin Support</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                  Offline
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-500 text-sm">Send a message to get help from our admin team.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'store' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderType === 'store'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.messageType === 'media' ? (
                  <div>
                    <MediaViewer 
                      file={{
                        url: msg.mediaUrl,
                        originalName: msg.message,
                        type: msg.mediaType,
                        size: msg.mediaSize
                      }}
                      messageId={msg.id}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{msg.message}</p>
                )}
                <p className={`text-xs mt-1 ${
                  msg.senderType === 'store' ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {formatTime(msg.createdAt)}
                  {msg.senderType === 'store' && (
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
        {typingUsers.includes('admin') && (
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
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Selected Files ({selectedFiles.length})
              </span>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <Smile size={18} />
          </button>
          <div className="flex-1">
            <textarea
              value={message}
              onChange={handleTyping}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendWithMedia();
                }
              }}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={uploading}
            />
          </div>
          <button
            onClick={handleSendWithMedia}
            disabled={!message.trim() && selectedFiles.length === 0 || uploading || !isConnected}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">Disconnected. Trying to reconnect...</p>
        )}
      </div>
    </div>
  );
}
