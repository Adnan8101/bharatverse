'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true); // Simulate connection
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);

  // Polling interval for checking new messages (optimized)
  useEffect(() => {
    let interval;
    
    if (currentConversation) {
      console.log('Setting up polling for conversation:', currentConversation.id);
      // Initial fetch
      fetchMessages();
      
      // Set up polling only when conversation is active
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/chat/messages?conversationId=${currentConversation.id}&page=1&limit=50`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            setMessages(data.messages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }, 5000); // Reduced frequency to 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentConversation?.id]); // Only depend on conversation ID

  // Separate function for fetching messages
  const fetchMessages = async () => {
    if (!currentConversation) return;
    
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${currentConversation.id}&page=1&limit=50`, {
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

  const joinRoom = (userType, storeId = null) => {
    console.log(`Joined room: ${userType}${storeId ? `-${storeId}` : ''}`);
    setIsConnected(true);
  };

  const sendMessage = async (conversationId, senderId, senderType, message, messageType = 'text', mediaUrl = null) => {
    try {
      const response = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          storeId: currentConversation?.storeId,
          senderId,
          senderType,
          message,
          messageType,
          mediaUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        // Trigger immediate message refresh instead of waiting for polling
        setTimeout(() => fetchMessages(), 100);
        return data;
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (conversationId, userType) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          userType
        })
      });
      
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const startTyping = (conversationId, senderType, storeId = null) => {
    // Simulate typing indicator
    const key = senderType === 'admin' ? 'admin' : `store-${storeId}`;
    setTypingUsers(prev => prev.includes(key) ? prev : [...prev, key]);
  };

  const stopTyping = (conversationId, senderType, storeId = null) => {
    const key = senderType === 'admin' ? 'admin' : `store-${storeId}`;
    setTypingUsers(prev => prev.filter(user => user !== key));
  };

  const value = {
    isConnected,
    messages,
    setMessages,
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    unreadCounts,
    setUnreadCounts,
    typingUsers,
    joinRoom,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
