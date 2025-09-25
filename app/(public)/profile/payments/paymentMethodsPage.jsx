'use client'
import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit2, Star, Shield } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import PageTitle from '@/components/PageTitle';

export default function PaymentMethodsPage() {
    const { user } = useUser();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPaymentMethod, setNewPaymentMethod] = useState({
        type: 'card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: '',
        isDefault: false
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch('/api/user/payment-methods');
            const data = await response.json();
            if (data.success) {
                setPaymentMethods(data.paymentMethods);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPaymentMethod = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryMonth || 
            !newPaymentMethod.expiryYear || !newPaymentMethod.cvv || !newPaymentMethod.holderName) {
            toast.error('All fields are required');
            return;
        }

        try {
            const response = await fetch('/api/user/payment-methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPaymentMethod)
            });

            const data = await response.json();
            if (data.success) {
                setPaymentMethods(prev => [...prev, data.paymentMethod]);
                setShowAddModal(false);
                setNewPaymentMethod({
                    type: 'card',
                    cardNumber: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: '',
                    holderName: '',
                    isDefault: false
                });
                toast.success('Payment method added successfully!');
            } else {
                toast.error(data.error || 'Failed to add payment method');
            }
        } catch (error) {
            toast.error('Error adding payment method');
        }
    };

    const handleDeletePaymentMethod = async (paymentMethodId) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;

        try {
            const response = await fetch(`/api/user/payment-methods/${paymentMethodId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
                toast.success('Payment method deleted successfully!');
            } else {
                toast.error(data.error || 'Failed to delete payment method');
            }
        } catch (error) {
            toast.error('Error deleting payment method');
        }
    };

    const handleSetDefault = async (paymentMethodId) => {
        try {
            const response = await fetch(`/api/user/payment-methods/${paymentMethodId}/default`, {
                method: 'PUT'
            });

            const data = await response.json();
            if (data.success) {
                setPaymentMethods(prev => prev.map(pm => ({
                    ...pm,
                    isDefault: pm.id === paymentMethodId
                })));
                toast.success('Default payment method updated!');
            } else {
                toast.error(data.error || 'Failed to update default payment method');
            }
        } catch (error) {
            toast.error('Error updating default payment method');
        }
    };

    const getCardType = (cardNumber) => {
        const firstDigit = cardNumber.charAt(0);
        if (firstDigit === '4') return 'Visa';
        if (firstDigit === '5') return 'Mastercard';
        if (firstDigit === '3') return 'American Express';
        return 'Card';
    };

    const maskCardNumber = (cardNumber) => {
        return '**** **** **** ' + cardNumber.slice(-4);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <PageTitle text="Payment Methods" />
                
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Add Payment Method
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods found</h3>
                            <p className="text-gray-500 mb-4">Add a payment method to make checkout faster</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                            >
                                <Plus size={20} />
                                Add Payment Method
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`border rounded-lg p-6 transition-colors ${
                                        method.isDefault 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                                <CreditCard size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {getCardType(method.cardNumber)}
                                                    </h3>
                                                    {method.isDefault && (
                                                        <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                            <Star size={12} />
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600">
                                                    {maskCardNumber(method.cardNumber)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Expires {method.expiryMonth}/{method.expiryYear}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {method.holderName}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {!method.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(method.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Set as default"
                                                >
                                                    <Star size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeletePaymentMethod(method.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete payment method"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Security Notice */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Shield size={16} />
                            <span className="text-sm font-medium">Your payment information is secure</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            We use industry-standard encryption to protect your payment details.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Payment Method Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Add Payment Method</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPaymentMethod} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Card Number *</label>
                                <input
                                    type="text"
                                    value={newPaymentMethod.cardNumber}
                                    onChange={(e) => setNewPaymentMethod(prev => ({ 
                                        ...prev, 
                                        cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="1234 5678 9012 3456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Cardholder Name *</label>
                                <input
                                    type="text"
                                    value={newPaymentMethod.holderName}
                                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, holderName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Month *</label>
                                    <select
                                        value={newPaymentMethod.expiryMonth}
                                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                {String(i + 1).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Year *</label>
                                    <select
                                        value={newPaymentMethod.expiryYear}
                                        onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">YYYY</option>
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <option key={2024 + i} value={2024 + i}>
                                                {2024 + i}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">CVV *</label>
                                    <input
                                        type="text"
                                        value={newPaymentMethod.cvv}
                                        onChange={(e) => setNewPaymentMethod(prev => ({ 
                                            ...prev, 
                                            cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="setDefault"
                                    checked={newPaymentMethod.isDefault}
                                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="setDefault" className="text-sm text-gray-700">
                                    Set as default payment method
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Payment Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
