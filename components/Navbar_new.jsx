'use client'
import { ShoppingCart, User, LogIn, X, Store, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import DynamicLanguageDropdown from '@/components/DynamicLanguageDropdown';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import EnhancedSearchBar from '@/components/EnhancedSearchBar';

const Navbar = () => {
    const router = useRouter();
    const [showAuthModal, setShowAuthModal] = useState(false)
    const cartCount = useSelector(state => state.cart.total)

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAuthModal && !event.target.closest('.auth-modal')) {
                setShowAuthModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAuthModal]);

    const handleAuthSelection = (type) => {
        setShowAuthModal(false);
        
        switch(type) {
            case 'user':
                router.push('/sign-in');
                break;
            case 'store-owner':
                router.push('/store-owner-login');
                break;
            case 'admin':
                router.push('/admin-login');
                break;
            default:
                break;
        }
    }

    return (
        <>
            <nav className="relative bg-white">
                <div className="mx-6">
                    <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
                        {/* Logo */}
                        <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                            <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                            <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                                plus
                            </p>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-6 text-slate-600">
                            <Link href="/shop" className="hover:text-slate-900 transition-colors">Shop</Link>
                            <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
                            <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
                        </div>

                        {/* Enhanced Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <EnhancedSearchBar />
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            {/* Cart */}
                            <Link href="/cart" className="relative flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                <ShoppingCart size={18} />
                                <span className="hidden sm:inline">Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
                                )}
                            </Link>

                            {/* Language Dropdown */}
                            <div className="hidden md:block">
                                <DynamicLanguageDropdown variant="default" />
                            </div>

                            {/* Authentication - Desktop */}
                            <div className="hidden md:block">
                                <SignedOut>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                                    >
                                        <LogIn size={16} />
                                        <span>Login</span>
                                    </button>
                                </SignedOut>
                                
                                <SignedIn>
                                    <UserProfileDropdown />
                                </SignedIn>
                            </div>

                            {/* Mobile Navigation */}
                            <div className="md:hidden flex items-center gap-3">
                                <DynamicLanguageDropdown variant="default" />
                                
                                <SignedOut>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors text-sm"
                                    >
                                        <LogIn size={14} />
                                        <span>Login</span>
                                    </button>
                                </SignedOut>
                                <SignedIn>
                                    <UserProfileDropdown />
                                </SignedIn>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden px-6 pb-4">
                        <EnhancedSearchBar />
                    </div>
                </div>
                <hr className="border-gray-300" />
            </nav>
            
            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
                    <div className="auth-modal bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Choose Login Type</h3>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {/* User Login */}
                            <button
                                onClick={() => handleAuthSelection('user')}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <User size={20} className="text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">User Login</div>
                                    <div className="text-sm text-gray-500">Sign in to shop and manage orders</div>
                                </div>
                            </button>
                            
                            {/* Store Owner Login */}
                            <button
                                onClick={() => handleAuthSelection('store-owner')}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <Store size={20} className="text-green-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">Store Owner</div>
                                    <div className="text-sm text-gray-500">Manage your store and products</div>
                                </div>
                            </button>
                            
                            {/* Admin Login */}
                            <button
                                onClick={() => handleAuthSelection('admin')}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <Shield size={20} className="text-purple-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-800">Admin Login</div>
                                    <div className="text-sm text-gray-500">System administration access</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar
