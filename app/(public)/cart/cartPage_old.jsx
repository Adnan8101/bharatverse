'use client'
import Counter from "@/components/Counter";
import PageTitle from "@/components/PageTitle";
import SignInModal from "@/components/SignInModal";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2, ShoppingCart, CreditCard, Truck, Tag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function Cart() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const { user } = useUser();
    const router = useRouter();
    
    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [shipping, setShipping] = useState(50); // Default shipping
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [showSignInModal, setShowSignInModal] = useState(false);

    const createCartArray = () => {
        setSubtotal(0);
        const cartArray = [];
        let total = 0;
        
        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                cartArray.push({
                    ...product,
                    quantity: value,
                });
                total += product.price * value;
            }
        }
        
        setCartArray(cartArray);
        setSubtotal(total);
        
        // Free shipping over ₹999
        setShipping(total > 999 ? 0 : 50);
    }

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }))
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        setCouponError('');

        try {
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: couponCode.trim(),
                    subtotal: subtotal
                })
            });

            const result = await response.json();

            if (result.success) {
                setAppliedCoupon(result.data.coupon);
                setCouponDiscount(result.data.discount);
                setCouponError('');
            } else {
                setCouponError(result.error);
                setAppliedCoupon(null);
                setCouponDiscount(0);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponError('Failed to apply coupon');
        } finally {
            setCouponLoading(false);
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
    }

    const handleContinue = useCallback((e) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        console.log('handleContinue called');
        console.log('User:', !!user);
        console.log('Cart items:', cartArray.length);
        
        if (!user) {
            console.log('User not signed in, showing sign-in modal');
            setShowSignInModal(true);
            return;
        }
        
        if (cartArray.length === 0) {
            console.log('Cart is empty');
            return;
        }
        
        console.log('Navigating to checkout');
        router.push('/cart/checkout');
    }, [user, cartArray.length, router]);

    const finalTotal = subtotal + shipping - couponDiscount;

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Title */}
                <PageTitle heading="My Cart" text="items in your cart" linkText="Continue Shopping" linkUrl="/shop" />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 border-b px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">Shopping Cart ({cartArray.length} items)</h3>
                            </div>
                            
                            <div className="divide-y divide-gray-100">
                                {cartArray.map((item, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                <Image 
                                                    src={item.images[0]} 
                                                    className="w-16 h-16 object-contain" 
                                                    alt={item.name} 
                                                    width={64} 
                                                    height={64} 
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                                <p className="text-lg font-bold text-blue-600 mt-2">{currency}{item.price.toLocaleString()}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                                                    <Counter productId={item.id} />
                                                </div>
                                                
                                                <div className="flex flex-col items-center gap-2">
                                                    <label className="text-sm font-medium text-gray-700">Total</label>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => handleDeleteItemFromCart(item.id)} 
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors group"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShoppingCart size={24} className="text-blue-600" />
                                Order Summary
                            </h3>

                            {/* Pricing Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartArray.length} items)</span>
                                    <span className="font-semibold text-gray-900">{currency}{subtotal.toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between text-gray-600">
                                    <span className="flex items-center gap-2">
                                        <Truck size={16} />
                                        Shipping
                                    </span>
                                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {shipping === 0 ? 'FREE' : `${currency}${shipping}`}
                                    </span>
                                </div>

                                {shipping > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm text-green-700 flex items-center gap-2">
                                            <Truck size={16} />
                                            Add {currency}{(999 - subtotal).toLocaleString()} more for FREE shipping!
                                        </p>
                                    </div>
                                )}

                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-2">
                                            <Tag size={16} />
                                            Coupon ({appliedCoupon.code})
                                        </span>
                                        <span className="font-semibold">-{currency}{couponDiscount.toLocaleString()}</span>
                                    </div>
                                )}

                                <hr className="border-gray-200" />
                                
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-blue-600">{currency}{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Have a coupon?</label>
                                {!appliedCoupon ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Enter coupon code"
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading}
                                                className="px-6 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:bg-gray-400 transition-colors whitespace-nowrap"
                                            >
                                                {couponLoading ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{couponError}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 text-green-700">
                                            <Tag size={20} />
                                            <div>
                                                <span className="font-semibold">{appliedCoupon.code}</span>
                                                <p className="text-sm text-green-600">-{currency}{couponDiscount.toLocaleString()} saved!</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Continue Button */}
                            <button
                                type="button"
                                onClick={(e) => handleContinue(e)}
                                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                <CreditCard size={24} />
                                Continue to Checkout
                            </button>

                            {/* Security Note */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <span>🔒</span>
                                <span>Secure checkout with SSL encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center px-6">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart size={64} className="text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 max-w-md">Looks like you haven't added any items to your cart yet. Start shopping to fill it up!</p>
                <button
                    onClick={() => router.push('/shop')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    Start Shopping
                </button>
            </div>
        </div>
    );
}
}