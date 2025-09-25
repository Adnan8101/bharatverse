'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const StoreToStoreChatContext = createContext();

export function StoreToStoreChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [availableStores, setAvailableStores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Polling interval for checking new messages
  useEffect(() => {
    let interval;
    
    if (currentConversation) {
      // Initial fetch
      fetchMessages(currentConversation.id);
      
      // Set up polling
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/chat/store-to-store/messages?conversationId=${currentConversation.id}&page=1&limit=50`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            setMessages(data.messages);
          }
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentConversation]);

  const fetchConversations = async (storeId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/store-to-store/conversations?storeId=${storeId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
        
        // Update unread counts
        const unreadData = {};
        data.conversations.forEach(conv => {
          unreadData[conv.id] = conv.unreadCount || 0;
        });
        setUnreadCounts(unreadData);
      }
    } catch (error) {
      console.error('Error fetching store conversations:', error);
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

  const fetchAvailableStores = async (currentStoreId, search = '') => {
    try {
      const params = new URLSearchParams();
      if (currentStoreId) params.append('currentStoreId', currentStoreId);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/chat/store-to-store/available-stores?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setAvailableStores(data.stores);
      }
    } catch (error) {
      console.error('Error fetching available stores:', error);
    }
  };

  const createOrGetConversation = async (store1Id, store2Id) => {
    try {
      const response = await fetch('/api/chat/store-to-store/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          store1Id,
          store2Id
        })
      });

      const data = await response.json();
      if (data.success) {
        return data.conversation;
      } else {
        throw new Error(data.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const sendMessage = async (conversationId, senderId, message, messageType = 'text') => {
    try {
      const response = await fetch('/api/chat/store-to-store/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          senderId,
          message,
          messageType
        })
      });

      const data = await response.json();
      if (data.success) {
        // Immediately fetch updated messages
        await fetchMessages(conversationId);
        return data;
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (conversationId, storeId) => {
    try {
      await fetch('/api/chat/store-to-store/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          storeId
        })
      });
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const value = {
    conversations,
    setConversations,
    currentConversation,
    setCurrentConversation,
    messages,
    setMessages,
    unreadCounts,
    setUnreadCounts,
    availableStores,
    setAvailableStores,
    loading,
    fetchConversations,
    fetchMessages,
    fetchAvailableStores,
    createOrGetConversation,
    sendMessage,
    markAsRead
  };

  return (
    <StoreToStoreChatContext.Provider value={value}>
      {children}
    </StoreToStoreChatContext.Provider>
  );
}

export function useStoreToStoreChat() {
  const context = useContext(StoreToStoreChatContext);
  if (!context) {
    throw new Error('useStoreToStoreChat must be used within a StoreToStoreChatProvider');
  }
  return context;
}
