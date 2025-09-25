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

    return (
        <>
            {cartArray.length > 0 ? (
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
                                                <div className="flex items-center gap-6">
                                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            className="w-full h-full object-cover"
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            width={96}
                                                            height={96}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">{item.name}</h3>
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-bold text-gray-900">{currency}{item.price.toLocaleString()}</span>
                                                                {item.mrp > item.price && (
                                                                    <span className="text-gray-500 line-through text-lg">{currency}{item.mrp.toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                            {item.mrp > item.price && (
                                                                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                                                                    {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <Counter productId={item.id} />
                                                            <button
                                                                onClick={() => handleDeleteItemFromCart(item.id)}
                                                                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                                <span className="text-sm font-medium">Remove</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:w-96">
                                <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                                    
                                    {/* Price Breakdown */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({cartArray.length} items)</span>
                                            <span>{currency}{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                                                {shipping === 0 ? 'FREE' : `${currency}${shipping}`}
                                            </span>
                                        </div>
                                        {subtotal < 999 && shipping > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-blue-700">
                                                    <Truck size={16} />
                                                    <span className="text-sm font-medium">Add {currency}{(999 - subtotal).toLocaleString()} more for FREE shipping!</span>
                                                </div>
                                            </div>
                                        )}
                                        {couponDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount</span>
                                                <span>-{currency}{couponDiscount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <hr className="border-gray-200" />
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>{currency}{finalTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Tag size={18} />
                                            Promo Code
                                        </h3>
                                        {!appliedCoupon ? (
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        placeholder="Enter coupon code"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        onClick={handleApplyCoupon}
                                                        disabled={couponLoading || !couponCode.trim()}
                                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {couponLoading ? 'Applying...' : 'Apply'}
                                                    </button>
                                                </div>
                                                {couponError && (
                                                    <p className="text-red-600 text-sm">{couponError}</p>
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
            )}
            
            {/* Sign In Modal */}
            <SignInModal 
                isOpen={showSignInModal} 
                onClose={() => setShowSignInModal(false)}
                redirectPath="/cart/checkout" 
            />
        </>
    );
}
