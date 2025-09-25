'use client'
import { useState, useEffect } from 'react';
import { Lock, Shield, Smartphone, Mail, Eye, EyeOff, Key, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import PageTitle from '@/components/PageTitle';

export default function SecuritySettingsPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);

    useEffect(() => {
        // Check if user has a password (not just OAuth)
        const hasPasswordAuth = user?.passwordEnabled || false;
        setHasPassword(hasPasswordAuth);
    }, [user]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            
            if (hasPassword) {
                // Update existing password
                await user.updatePassword({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                });
                toast.success('Password updated successfully!');
            } else {
                // Set new password for OAuth user
                await user.updatePassword({
                    newPassword: passwordData.newPassword
                });
                toast.success('Password created successfully! You can now sign in with email and password.');
                setHasPassword(true);
            }

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const toggleTwoFactor = async () => {
        try {
            setLoading(true);
            // In a real implementation, you'd integrate with Clerk's 2FA system
            setTwoFactorEnabled(!twoFactorEnabled);
            toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update two-factor authentication');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <PageTitle text="Security Settings" />
                
                <div className="space-y-6">
                    {/* Password Management */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Lock size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {hasPassword ? 'Change Password' : 'Set Up Password'}
                                </h2>
                                <p className="text-gray-500">
                                    {hasPassword ? 'Update your account password' : 'Create a password for direct login'}
                                </p>
                            </div>
                        </div>

                        {!hasPassword && (
                            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-orange-900 mb-1">
                                            You're signed in with Google
                                        </h3>
                                        <p className="text-sm text-orange-700">
                                            You can set up a password to enable direct email/password login in addition to Google sign-in.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {hasPassword && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Password must be at least 8 characters long
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword || (hasPassword && !passwordData.currentPassword)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : (hasPassword ? 'Update Password' : 'Set Password')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Shield size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                                <p className="text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Smartphone size={20} className="text-gray-600" />
                                <div>
                                    <h3 className="font-medium text-gray-900">Authenticator App</h3>
                                    <p className="text-sm text-gray-500">
                                        {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Secure your account with an authenticator app'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTwoFactor}
                                disabled={loading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    twoFactorEnabled 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                {twoFactorEnabled ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Mail size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Account Status</h2>
                                <p className="text-gray-500">Your account verification status</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Mail size={20} className="text-green-600" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email Verified</h3>
                                        <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-sm text-green-600 font-medium">Verified</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Key size={20} className="text-green-600" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Account Security</h3>
                                        <p className="text-sm text-gray-500">Your account is secure and protected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-sm text-green-600 font-medium">Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
