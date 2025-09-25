'use client'
import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import PageTitle from '@/components/PageTitle';
import AddressModal from '@/components/AddressModal';

export default function AddressManagementPage() {
    const { user } = useUser();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch('/api/addresses');
            const data = await response.json();
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressAdded = (newAddress) => {
        setAddresses(prev => [...prev, newAddress]);
        setShowAddressModal(false);
        toast.success('Address added successfully!');
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await fetch(`/api/addresses/${addressId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setAddresses(prev => prev.filter(addr => addr.id !== addressId));
                toast.success('Address deleted successfully!');
            } else {
                toast.error(data.error || 'Failed to delete address');
            }
        } catch (error) {
            toast.error('Error deleting address');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await fetch(`/api/addresses/${addressId}/default`, {
                method: 'PUT'
            });

            const data = await response.json();
            if (data.success) {
                setAddresses(prev => prev.map(addr => ({
                    ...addr,
                    isDefault: addr.id === addressId
                })));
                toast.success('Default address updated!');
            } else {
                toast.error(data.error || 'Failed to update default address');
            }
        } catch (error) {
            toast.error('Error updating default address');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <PageTitle text="Manage Addresses" />
                
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Addresses</h1>
                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add New Address
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                            <p className="text-gray-500 mb-4">Add your first delivery address to get started</p>
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                            >
                                <Plus size={20} />
                                Add Address
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`border rounded-lg p-6 transition-colors ${
                                        address.isDefault 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={16} className="text-blue-600" />
                                                <h3 className="font-medium text-gray-900">
                                                    {address.name}
                                                </h3>
                                                {address.isDefault && (
                                                    <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        <Star size={12} />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">{address.phone}</p>
                                            <p className="text-gray-700">
                                                {address.street}
                                                <br />
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-4">
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Set as default"
                                                >
                                                    <Star size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingAddress(address)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit address"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete address"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddressModal && (
                <AddressModal
                    onClose={() => setShowAddressModal(false)}
                    onAddressAdded={handleAddressAdded}
                />
            )}
        </div>
    );
}
