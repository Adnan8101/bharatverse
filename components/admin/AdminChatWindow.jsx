'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Download } from 'lucide-react';
import MediaViewer from '../chat/MediaViewer';

export default function AdminChatWindow({ conversation, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/messages?conversationId=${conversation.id}&page=1&limit=50`);
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
        formData.append('conversationId', conversation.id);

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

  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    let uploadedFiles = [];
    
    // Upload files first if any
    if (selectedFiles.length > 0) {
      uploadedFiles = await uploadFiles();
    }

    // Send text message if any
    if (message.trim()) {
      try {
        const response = await fetch('/api/chat/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            conversationId: conversation.id,
            senderId: 'admin',
            senderType: 'admin',
            message: message,
            messageType: 'text'
          })
        });

        if (response.ok) {
          setMessage('');
          fetchMessages(); // Refresh messages
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }

    // Send media messages
    for (const file of uploadedFiles) {
      try {
        const response = await fetch('/api/chat/conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            conversationId: conversation.id,
            senderId: 'admin',
            senderType: 'admin',
            message: file.originalName,
            messageType: 'media',
            mediaUrl: file.url,
            mediaType: file.type,
            mediaSize: file.size
          })
        });

        if (response.ok) {
          fetchMessages(); // Refresh messages
        }
      } catch (error) {
        console.error('Error sending media message:', error);
      }
    }

    // Clear selected files
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            ←
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {conversation.store?.name?.charAt(0).toUpperCase() || 'S'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.store?.name || 'Store Owner'}</h3>
            <p className="text-sm text-gray-500">{conversation.store?.email}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
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
                    ? 'bg-blue-600 text-white'
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
                  msg.senderType === 'admin' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={uploading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && selectedFiles.length === 0 || uploading}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
