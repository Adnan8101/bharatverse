'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Edit, Trash2, Plus, Eye, EyeOff, Camera, Save, X, Check } from "lucide-react"
import Loading from "@/components/Loading"

export default function StoreManageProducts() {

    const currency = '₹' // Using rupee symbol directly

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [editingProduct, setEditingProduct] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)

    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        mrp: '',
        price: '',
        category: '',
        stockQuantity: '',
        images: []
    })

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/store-owner/products', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                setProducts(result.products);
            } else {
                toast.error(result.message || 'Failed to fetch products');
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    const toggleStock = async (productId) => {
        try {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const response = await fetch('/api/store-owner/products', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: productId,
                    updateData: {
                        inStock: !product.inStock
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setProducts(products.map(p => 
                    p.id === productId 
                        ? { ...p, inStock: !p.inStock }
                        : p
                ));
                
                // Trigger product list refresh for the public store
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('refreshProducts'))
                }
                
                toast.success('Product stock updated successfully');
            } else {
                toast.error(result.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    }

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/store-owner/products', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ productId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setProducts(products.filter(p => p.id !== productId));
                toast.success('Product deleted successfully');
                
                // Trigger product list refresh for the public store
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('refreshProducts'))
                }
            } else {
                toast.error(result.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    }

    const resubmitProduct = async (productId) => {
        if (!confirm('Are you sure you want to resubmit this product for admin approval?')) {
            return;
        }

        try {
            const response = await fetch('/api/store-owner/products/resubmit', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ productId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update the product status in the local state
                setProducts(products.map(p => 
                    p.id === productId 
                        ? { ...p, status: 'pending', adminNote: null, reviewedBy: null, reviewedAt: null }
                        : p
                ));
                toast.success('Product resubmitted for approval');
            } else {
                toast.error(result.message || 'Failed to resubmit product');
            }
        } catch (error) {
            console.error('Error resubmitting product:', error);
            toast.error('Failed to resubmit product');
        }
    }

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description,
            mrp: product.mrp.toString(),
            price: product.price.toString(),
            category: product.category,
            stockQuantity: product.stockQuantity.toString(),
            images: [...product.images]
        });
        setShowEditModal(true);
    }

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
        setEditForm({
            name: '',
            description: '',
            mrp: '',
            price: '',
            category: '',
            stockQuantity: '',
            images: []
        });
    }

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        try {
            setImageUploading(true);
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    return data.imageUrl;
                } else {
                    throw new Error('Failed to upload image');
                }
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setEditForm(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
            
            toast.success('Images uploaded successfully!');
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setImageUploading(false);
        }
    }

    const removeImage = (index) => {
        setEditForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }

    const updateProduct = async () => {
        try {
            if (!editForm.name || !editForm.description || !editForm.price || !editForm.mrp) {
                toast.error('Please fill in all required fields');
                return;
            }

            if (editForm.images.length === 0) {
                toast.error('Please add at least one product image');
                return;
            }

            setImageUploading(true);
            
            const response = await fetch('/api/store-owner/products', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: editingProduct.id,
                    updateData: {
                        name: editForm.name,
                        description: editForm.description,
                        mrp: parseFloat(editForm.mrp),
                        price: parseFloat(editForm.price),
                        category: editForm.category,
                        stockQuantity: parseInt(editForm.stockQuantity),
                        images: editForm.images
                    }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setProducts(products.map(p => 
                    p.id === editingProduct.id 
                        ? { 
                            ...p, 
                            ...editForm,
                            mrp: parseFloat(editForm.mrp),
                            price: parseFloat(editForm.price),
                            stockQuantity: parseInt(editForm.stockQuantity)
                          }
                        : p
                ));
                
                toast.success('Product updated successfully!');
                closeEditModal();
                
                // Trigger product list refresh for the public store
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('refreshProducts'))
                }
            } else {
                toast.error(result.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        } finally {
            setImageUploading(false);
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Products</h1>
                    <p className="text-slate-600 mt-1">Update product information and stock availability</p>
                </div>
                <button 
                    onClick={() => window.location.href = '/store/add-product'}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                >
                    Add New Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Products Yet</h3>
                    <p className="text-slate-600 mb-4">Start by adding your first product to your store.</p>
                    <button 
                        onClick={() => window.location.href = '/store/add-product'}
                        className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                                    <th className="px-6 py-4 font-semibold hidden lg:table-cell">Category</th>
                                    <th className="px-6 py-4 font-semibold hidden md:table-cell">MRP</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 font-semibold text-center">Stock</th>
                                    <th className="px-6 py-4 font-semibold text-center">Stock Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Approval</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="relative flex-shrink-0">
                                                    {product.images && product.images.length > 0 && product.images[0] ? (
                                                        <Image 
                                                            width={64} 
                                                            height={64} 
                                                            className='w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-200' 
                                                            src={product.images[0]} 
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div 
                                                        className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200" 
                                                        style={{ display: (product.images && product.images.length > 0 && product.images[0]) ? 'none' : 'flex' }}
                                                    >
                                                        <Camera size={20} className="text-gray-400" />
                                                    </div>
                                                    {!product.inStock && (
                                                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                                            <span className="text-red-600 text-xs font-bold bg-white px-1 rounded">OUT</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-slate-800 truncate" title={product.name}>
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Added {new Date(product.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs text-slate-600 hidden md:table-cell">
                                            <p className="truncate" title={product.description}>
                                                {product.description}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-slate-500 line-through">
                                                {currency}{product.mrp.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800">
                                                {currency}{product.price.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-semibold text-slate-800">
                                                    {product.stockQuantity || 0}
                                                </span>
                                                <span className="text-xs text-slate-500">units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.inStock && (product.stockQuantity || 0) > 0
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.inStock && (product.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.status === 'approved' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : product.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {product.status === 'approved' ? 'Approved' : 
                                                     product.status === 'rejected' ? 'Rejected' : 'Pending'}
                                                </span>
                                            </div>
                                            {product.adminNote && (
                                                <div className="text-xs text-slate-500 mt-1 max-w-xs">
                                                    <p className="truncate" title={product.adminNote}>
                                                        Note: {product.adminNote}
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                
                                                {product.status === 'rejected' && (
                                                    <button
                                                        onClick={() => resubmitProduct(product.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Resubmit for Approval"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                
                                                <label className="relative inline-flex items-center cursor-pointer" title="Toggle Stock">
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only peer" 
                                                        onChange={() => toast.promise(toggleStock(product.id), { 
                                                            loading: "Updating stock...",
                                                            success: "Stock updated!",
                                                            error: "Failed to update stock"
                                                        })} 
                                                        checked={product.inStock} 
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                                </label>

                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Summary Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Total Products: <strong className="text-slate-800">{products.length}</strong></span>
                            <span>
                                In Stock: <strong className="text-green-600">{products.filter(p => p.inStock).length}</strong> | 
                                Out of Stock: <strong className="text-red-600">{products.filter(p => !p.inStock).length}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">Edit Product</h2>
                            <button
                                onClick={closeEditModal}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Product Images */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Product Images
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {editForm.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
                                        <div className="text-center">
                                            <Camera className="mx-auto mb-2 text-slate-400" size={24} />
                                            <span className="text-sm text-slate-500">Add Images</span>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={imageUploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Category *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter category"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        MRP *
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.mrp}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, mrp: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter MRP"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Selling Price *
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter selling price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.stockQuantity}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter stock quantity"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter product description"
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-4 justify-end">
                            <button
                                onClick={closeEditModal}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateProduct}
                                disabled={imageUploading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={16} />
                                {imageUploading ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
