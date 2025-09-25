'use client'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { MapPin, CreditCard, Truck, Plus, Check, Package } from 'lucide-react';
import AddressModal from '@/components/AddressModal';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { clearCoupon } from '@/lib/features/coupon/couponSlice';
import Script from 'next/script';

export default function CheckoutPage() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const { user } = useUser();
    const router = useRouter();
    const dispatch = useDispatch();
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);
    const { couponCode, couponDiscount, appliedCoupon, isApplied } = useSelector(state => state.coupon);

    const [cartArray, setCartArray] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(50);
    const [total, setTotal] = useState(0);
    const [cartInitialized, setCartInitialized] = useState(false);
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);
    
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    
    const [orderLoading, setOrderLoading] = useState(false);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const [showOrderPlacing, setShowOrderPlacing] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [countdownInterval, setCountdownInterval] = useState(null);

    // Debug payment method changes
    useEffect(() => {
        console.log('Payment method changed to:', paymentMethod);
        console.log('Razorpay loaded:', razorpayLoaded);
        console.log('Selected address:', !!selectedAddress);
        console.log('Order loading:', orderLoading);
        console.log('Show order placing:', showOrderPlacing);
    }, [paymentMethod, razorpayLoaded, selectedAddress, orderLoading, showOrderPlacing]);

    // Check for Razorpay availability periodically
    useEffect(() => {
        const checkRazorpay = () => {
            if (window.Razorpay && !razorpayLoaded) {
                console.log('Razorpay detected via periodic check');
                setRazorpayLoaded(true);
            }
        };

        // Check immediately
        checkRazorpay();

        // Check every 1 second for the first 10 seconds
        const interval = setInterval(checkRazorpay, 1000);
        
        // Clear interval after 10 seconds
        setTimeout(() => {
            clearInterval(interval);
        }, 10000);

        return () => clearInterval(interval);
    }, [razorpayLoaded]);

    // Fallback: Load Razorpay script manually if Next.js Script fails
    useEffect(() => {
        const loadRazorpayManually = () => {
            if (window.Razorpay) {
                setRazorpayLoaded(true);
                return;
            }

            // Check if script is already loaded
            if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
                console.log('Razorpay script already exists in DOM');
                return;
            }

            console.log('Loading Razorpay script manually...');
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                console.log('Razorpay script loaded manually');
                if (window.Razorpay) {
                    setRazorpayLoaded(true);
                }
            };
            script.onerror = () => {
                console.error('Failed to load Razorpay script manually');
            };
            document.head.appendChild(script);
        };

        // Try to load manually after 3 seconds if not already loaded
        const timeout = setTimeout(() => {
            if (!razorpayLoaded) {
                loadRazorpayManually();
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [razorpayLoaded]);

    // Create cart array
    useEffect(() => {
        let subtotalAmount = 0;
        const cartArray = [];
        
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                cartArray.push({
                    ...product,
                    quantity: value,
                });
                subtotalAmount += product.price * value;
            }
        }
        
        setCartArray(cartArray);
        setSubtotal(subtotalAmount);
        
        const shippingCost = subtotalAmount > 999 ? 0 : 50;
        setShipping(shippingCost);
        
        // Calculate total with coupon discount
        const finalTotal = subtotalAmount + shippingCost - (couponDiscount || 0);
        setTotal(finalTotal);
        
        // Mark cart as initialized after processing
        if (products.length > 0) {
            setCartInitialized(true);
        }
    }, [cartItems, products, couponDiscount]);

    // Fetch addresses
    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            setAddressLoading(true);
            const response = await fetch('/api/addresses');
            const result = await response.json();
            
            if (result.success) {
                setAddresses(result.addresses);
                if (result.addresses.length > 0) {
                    setSelectedAddress(result.addresses[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setAddressLoading(false);
        }
    };

    const handleAddressAdded = (newAddress) => {
        setAddresses(prev => [newAddress, ...prev]);
        setSelectedAddress(newAddress);
        setShowAddressModal(false);
    };

    const handleCardInputChange = (field, value) => {
        if (field === 'number') {
            // Format card number with spaces
            value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        } else if (field === 'expiry') {
            // Format MM/YY
            value = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5);
        } else if (field === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 3);
        }
        
        setCardDetails(prev => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        // Only validate card details if card payment is selected
        if (paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
                alert('Please fill in all card details');
                return;
            }
        }

        // Handle Razorpay payment separately
        if (paymentMethod === 'razorpay') {
            if (!window.Razorpay) {
                alert('Razorpay is not loaded. Please refresh the page and try again.');
                return;
            }
            await handleRazorpayPayment();
            return;
        }

        setShowOrderPlacing(true);
        
        // Show placing order animation for 3 seconds for COD and Card payments
        setTimeout(async () => {
            setOrderLoading(true);
            
            try {
                // Simulate payment processing for card payments
                if (paymentMethod === 'card') {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                await createOrder(paymentMethod);
                
            } catch (error) {
                console.error('Error placing order:', error);
                setShowOrderPlacing(false);
                alert('Failed to place order. Please try again.');
            } finally {
                setOrderLoading(false);
            }
        }, 3000);
    };

    const handleRazorpayPayment = async () => {
        try {
            setOrderLoading(true);

            console.log('Creating Razorpay order with amount:', total);

            // Create Razorpay order
            const orderResponse = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: total,
                    receipt: `order_${Date.now()}`
                })
            });

            console.log('Order response status:', orderResponse.status);
            const orderResult = await orderResponse.json();
            console.log('Order result:', orderResult);

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create Razorpay order');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RJt2bfR1R0ZdB3',
                amount: orderResult.order.amount,
                currency: orderResult.order.currency,
                name: 'BharatVerse',
                description: 'Order Payment',
                order_id: orderResult.order.id,
                handler: async function (response) {
                    try {
                        console.log('Payment successful, verifying...', response);
                        // Verify payment
                        const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyResult = await verifyResponse.json();
                        console.log('Verification result:', verifyResult);

                        if (verifyResult.success) {
                            // Payment verified, create order
                            await createOrder('razorpay', response.razorpay_payment_id);
                        } else {
                            alert('Payment verification failed: ' + (verifyResult.error || 'Unknown error'));
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed: ' + error.message);
                    }
                },
                modal: {
                    ondismiss: function() {
                        console.log('Razorpay modal dismissed');
                        setOrderLoading(false);
                    }
                },
                prefill: {
                    name: user?.fullName || selectedAddress?.name || '',
                    email: user?.primaryEmailAddress?.emailAddress || '',
                    contact: selectedAddress?.phone || ''
                },
                theme: {
                    color: '#3B82F6'
                }
            };

            console.log('Opening Razorpay with options:', options);
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Razorpay payment error:', error);
            alert('Failed to initiate payment: ' + error.message);
            setOrderLoading(false);
        }
    };

    const createOrder = async (paymentMethod, paymentId = null) => {
        const orderData = {
            items: cartArray.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            addressId: selectedAddress.id,
            paymentMethod: paymentMethod,
            paymentId: paymentId,
            subtotal: subtotal,
            shipping: shipping,
            couponDiscount: couponDiscount || 0,
            couponCode: couponCode || null,
            total: total
        };

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            setCreatedOrder(result.data);
            setShowOrderPlacing(false);
            setShowOrderSuccess(true);
            dispatch(clearCart());
            dispatch(clearCoupon());
            
            // Initialize countdown
            setCountdown(5);
            
            // Start countdown and redirect after 5 seconds
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCountdownInterval(null);
                        router.push('/my-orders');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            setCountdownInterval(interval);
            
        } else {
            setShowOrderPlacing(false);
            alert('Failed to place order: ' + result.error);
        }
    };    // Handle redirects with useEffect
    useEffect(() => {
        if (!user) {
            router.push('/sign-in?redirect=/cart/checkout');
            return;
        }
        
        // Only check cart emptiness after cart has been initialized
        // Don't redirect if order success modal is showing
        if (cartInitialized && cartArray.length === 0 && !showOrderSuccess) {
            console.log('Cart is empty, redirecting to cart page');
            router.push('/cart');
            return;
        }
    }, [user, cartArray.length, cartInitialized, router, showOrderSuccess]);

    // Cleanup countdown interval on unmount or when order success modal is closed
    useEffect(() => {
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [countdownInterval]);

    // Show loading while checking auth/cart
    if (!user || !cartInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side - Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <MapPin size={20} />
                                Delivery Address
                            </h2>

                            {addressLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-500">Loading addresses...</p>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No addresses found</p>
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <Plus size={16} />
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedAddress?.id === address.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedAddress(address)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{address.name}</p>
                                                    <p className="text-sm text-gray-600">{address.phone}</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {address.street}, {address.city}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {address.state} - {address.pincode}
                                                    </p>
                                                </div>
                                                {selectedAddress?.id === address.id && (
                                                    <Check size={20} className="text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add New Address
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CreditCard size={20} />
                                Payment Method
                            </h2>

                            <div className="space-y-4">
                                {/* Cash on Delivery */}
                                <div
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                        paymentMethod === 'cod'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Truck size={20} />
                                            <div>
                                                <p className="font-medium">Cash on Delivery</p>
                                                <p className="text-sm text-gray-600">Pay when your order arrives</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <Check size={20} className="text-blue-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Credit/Debit Card */}
                                <div
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                        paymentMethod === 'card'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CreditCard size={20} />
                                            <div>
                                                <p className="font-medium">Credit/Debit Card</p>
                                                <p className="text-sm text-gray-600">Pay securely with your card</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <Check size={20} className="text-blue-600" />
                                        )}
                                    </div>

                                    {paymentMethod === 'card' && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Card Number</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.number}
                                                    onChange={(e) => handleCardInputChange('number', e.target.value)}
                                                    placeholder="1234 5678 9012 3456"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                                                    placeholder="MM/YY"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">CVV</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.cvv}
                                                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                                                    placeholder="123"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Name on Card</label>
                                                <input
                                                    type="text"
                                                    value={cardDetails.name}
                                                    onChange={(e) => handleCardInputChange('name', e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Razorpay Payment */}
                                <div
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                        paymentMethod === 'razorpay'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">R</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Razorpay (UPI, Cards, Wallets)</p>
                                                <p className="text-sm text-gray-600">
                                                    Pay with UPI, Cards, Net Banking & Wallets
                                                    {!razorpayLoaded && (
                                                        <span className="text-orange-500 ml-1">• Loading...</span>
                                                    )}
                                                    {razorpayLoaded && (
                                                        <span className="text-green-500 ml-1">• Ready</span>
                                                    )}
                                                </p>
                                                {!razorpayLoaded && paymentMethod === 'razorpay' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.reload();
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                                    >
                                                        Click here to reload if payment gateway doesn't load
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {paymentMethod === 'razorpay' && (
                                            <Check size={20} className="text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                            {/* Items */}
                            <div className="space-y-3 mb-6">
                                {cartArray.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                            <img src={item.images[0]} alt={item.name} className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {currency}{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-200 mb-4" />

                            {/* Pricing */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{currency}{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                                        {shipping === 0 ? 'FREE' : `${currency}${shipping}`}
                                    </span>
                                </div>
                                {isApplied && couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Coupon Discount ({couponCode})</span>
                                        <span>-{currency}{couponDiscount.toLocaleString()}</span>
                                    </div>
                                )}
                                <hr className="border-gray-200" />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>{currency}{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={
                                    orderLoading || 
                                    !selectedAddress || 
                                    showOrderPlacing ||
                                    (paymentMethod === 'razorpay' && !razorpayLoaded)
                                }
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
                            >
                                {showOrderPlacing ? 'Processing Order...' : 
                                 orderLoading ? 'Processing...' : 
                                 (paymentMethod === 'razorpay' && !razorpayLoaded) ? 'Loading Payment Gateway...' :
                                 '🛒 Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    onClose={() => setShowAddressModal(false)}
                    onAddressAdded={handleAddressAdded}
                />
            )}

            {/* Order Placing Animation Modal */}
            {showOrderPlacing && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-12 max-w-md w-full mx-4 text-center shadow-2xl">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Package className="w-12 h-12 text-white animate-bounce" />
                            </div>
                            <div className="absolute inset-0 w-24 h-24 mx-auto">
                                <div className="w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Placing Your Order...
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Please wait while we process your order
                        </p>
                        <div className="flex justify-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Success Modal */}
            {showOrderSuccess && (
                <div className="fixed inset-0 bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-12 max-w-lg w-full mx-4 text-center shadow-2xl transform scale-100 animate-pulse">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Check size={48} className="text-white animate-bounce" />
                            </div>
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur opacity-20 animate-ping"></div>
                        </div>
                        
                        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            🎉 Order Confirmed!
                        </h3>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                            <p className="text-gray-700 font-semibold mb-2">
                                Order #{createdOrder?.id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-gray-600">
                                Your order has been successfully placed and will be delivered soon!
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <p className="text-gray-700 mb-4">Redirecting to your orders in:</p>
                            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-countdownPulse">
                                {countdown}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">seconds</p>
                        </div>
                        
                        <button 
                            onClick={() => {
                                if (countdownInterval) {
                                    clearInterval(countdownInterval);
                                    setCountdownInterval(null);
                                }
                                router.push('/my-orders');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            View Orders Now
                        </button>
                    </div>
                </div>
            )}
            
            {/* Razorpay Script */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log('Razorpay script loaded successfully');
                    console.log('window.Razorpay available:', !!window.Razorpay);
                    if (window.Razorpay) {
                        setRazorpayLoaded(true);
                    } else {
                        console.error('Razorpay object not found on window after script load');
                        setRazorpayLoaded(false);
                    }
                }}
                onError={(e) => {
                    console.error('Failed to load Razorpay script:', e);
                    setRazorpayLoaded(false);
                }}
                onReady={() => {
                    console.log('Razorpay script ready');
                    if (window.Razorpay) {
                        setRazorpayLoaded(true);
                    }
                }}
            />
        </div>
    );
}
