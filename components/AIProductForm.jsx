'use client';
import { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, RefreshCw, Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIProductForm({ onProductGenerated, initialData = null }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    mrp: initialData?.mrp || '',
    price: initialData?.price || '',
    category: initialData?.category || 'Electronics',
    stockQuantity: initialData?.stockQuantity || 50,
    images: initialData?.images || []
  });

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Beauty',
    'Food & Beverages',
    'Automotive',
    'Health'
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setShowSuggestions(false);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/ai/analyze-product', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setAiSuggestions(data.data);
        setShowSuggestions(true);
        toast.success(`AI Analysis Complete! Confidence: ${Math.round(data.data.confidence * 100)}%`);
      } else {
        // Even on failure, show fallback suggestions
        setAiSuggestions(data.data);
        setShowSuggestions(true);
        toast.error(data.error || 'Analysis failed, showing fallback suggestions');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        name: aiSuggestions.title,
        description: aiSuggestions.description,
        price: aiSuggestions.suggestedPrice,
        mrp: Math.round(aiSuggestions.suggestedPrice * 1.2), // 20% markup for MRP
        category: aiSuggestions.category
      }));
      toast.success('AI suggestions applied!');
    }
  };

  const improveDescription = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please enter title and description first');
      return;
    }

    setIsImproving(true);

    try {
      const response = await fetch('/api/ai/improve-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          category: formData.category
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          name: data.data.improvedTitle,
          description: data.data.improvedDescription
        }));
        toast.success('Description improved with AI!');
      } else {
        toast.error('Failed to improve description');
      }
    } catch (error) {
      console.error('Error improving description:', error);
      toast.error('Failed to improve description');
    } finally {
      setIsImproving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (onProductGenerated) {
      onProductGenerated({
        ...formData,
        selectedImage,
        imagePreview
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Image Analysis Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
            AI Product Analysis
          </h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            Powered by Gemini AI
          </span>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-25 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
                <p className="text-sm text-gray-600">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-purple-400 mx-auto" />
                <div>
                  <p className="text-gray-700 font-medium">Upload Product Image</p>
                  <p className="text-sm text-gray-500">AI will analyze and generate product details</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={analyzeImage}
            disabled={!selectedImage || isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </button>
        </div>

        {/* AI Suggestions */}
        {showSuggestions && aiSuggestions && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">AI Suggestions</h4>
              <div className="flex space-x-2">
                <button
                  onClick={applySuggestions}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Apply suggestions"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-600">{aiSuggestions.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="ml-2 text-gray-600">{aiSuggestions.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Suggested Price:</span>
                <span className="ml-2 text-gray-600">₹{aiSuggestions.suggestedPrice}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-gray-600">{aiSuggestions.description}</p>
              </div>
              <div className="flex items-center mt-2">
                <span className="font-medium text-gray-700">Confidence:</span>
                <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${aiSuggestions.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-600">
                  {Math.round(aiSuggestions.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
              <button
                type="button"
                onClick={improveDescription}
                disabled={isImproving || !formData.name}
                className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                title="Improve with AI"
              >
                {isImproving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter stock quantity (e.g., 50)"
              required
            />
          </div>

          {/* MRP */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MRP (₹) *
            </label>
            <input
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter MRP"
              required
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter selling price"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {initialData ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
