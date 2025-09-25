'use client'
import { useState, useEffect, useRef } from 'react';
import { User, MapPin, CreditCard, Lock, Package, LogOut, ChevronDown } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfileDropdown() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        signOut(() => router.push('/'));
    };

    if (!user) return null;

    const menuItems = [
        {
            icon: User,
            label: 'Edit Profile',
            href: '/profile/edit',
            description: 'Update personal information'
        },
        {
            icon: MapPin,
            label: 'Manage Addresses',
            href: '/profile/addresses',
            description: 'Add or edit delivery addresses'
        },
        {
            icon: CreditCard,
            label: 'Payment Methods',
            href: '/profile/payments',
            description: 'Manage payment options'
        },
        {
            icon: Lock,
            label: 'Security Settings',
            href: '/profile/security',
            description: 'Change password & security'
        },
        {
            icon: Package,
            label: 'My Orders',
            href: '/my-orders',
            description: 'View order history'
        }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <img
                    src={user.imageUrl}
                    alt={user.firstName || 'User'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200"
                />
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user.firstName}
                </span>
                <ChevronDown 
                    size={14} 
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <img
                                src={user.imageUrl}
                                alt={user.firstName || 'User'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100"
                            />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.emailAddresses[0]?.emailAddress}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <item.icon size={14} className="text-gray-600 group-hover:text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left group"
                        >
                            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <LogOut size={14} className="text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Sign Out</p>
                                <p className="text-xs text-red-400">Sign out of your account</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
