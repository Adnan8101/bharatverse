'use client'

import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          User Profile
        </h1>
        <div className="flex justify-center">
          <UserProfile 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-slate-800 hover:bg-slate-900 text-sm normal-case',
                footerActionLink: 'text-slate-600 hover:text-slate-800'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
