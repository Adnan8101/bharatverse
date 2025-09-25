'use client';
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Plus, X } from 'lucide-react';
import { useStoreToStoreChat } from './StoreToStoreChatContext';

export default function StoreSelectionModal({ isOpen, onClose, currentStoreId, onSelectStore }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const {
    availableStores,
    fetchAvailableStores
  } = useStoreToStoreChat();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStores(currentStoreId);
    }
  }, [isOpen, currentStoreId]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchAvailableStores(currentStoreId, searchTerm);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isOpen]);

  const handleSelectStore = async (store) => {
    setLoading(true);
    try {
      await onSelectStore(store);
      onClose();
    } catch (error) {
      console.error('Error selecting store:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-6 h-6 text-purple-600 mr-2" />
            Start New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Store List */}
        <div className="flex-1 overflow-y-auto p-6">
          {availableStores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No stores found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectStore(store)}
                >
                  <div className="flex-shrink-0 mr-4">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-lg">
                          {store.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      @{store.username}
                    </p>
                    {store.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <Plus className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Select a store to start a conversation
          </p>
        </div>
      </div>
    </div>
  );
}
