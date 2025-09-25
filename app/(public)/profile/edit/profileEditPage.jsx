'use client'
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, X, Edit2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import PageTitle from '@/components/PageTitle';

export default function ProfileEditPage() {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        profileImage: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.emailAddresses[0]?.emailAddress || '',
                phone: user.phoneNumbers[0]?.phoneNumber || '',
                username: user.username || '',
                profileImage: user.imageUrl || ''
            });
        }
    }, [user]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setProfileData(prev => ({ ...prev, profileImage: data.imageUrl }));
                toast.success('Profile image updated!');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            toast.error('Error uploading image');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            setLoading(true);
            
            // Update user profile using Clerk
            await user.update({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                username: profileData.username
            });

            // Update phone number if provided
            if (profileData.phone && profileData.phone !== user.phoneNumbers[0]?.phoneNumber) {
                await user.createPhoneNumber({ phoneNumber: profileData.phone });
            }

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <PageTitle text="Edit Profile" />
                
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {/* Profile Image */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <img
                                src={profileData.profileImage || '/default-avatar.png'}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                            />
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                    <Camera size={16} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {profileData.firstName} {profileData.lastName}
                            </h2>
                            <p className="text-gray-500">{profileData.email}</p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleProfileUpdate}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
