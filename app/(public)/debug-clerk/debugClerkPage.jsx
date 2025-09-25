'use client'

import { useUser, useClerk } from '@clerk/nextjs';

export default function DebugClerkPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Clerk Debug Information</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Loaded:</strong> {isLoaded ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}
          </div>
          
          {isSignedIn && user && (
            <div>
              <strong>User Info:</strong>
              <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
                {JSON.stringify({
                  id: user.id,
                  email: user.primaryEmailAddress?.emailAddress,
                  firstName: user.firstName,
                  lastName: user.lastName,
                }, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <strong>Environment:</strong>
            <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
              Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...
            </pre>
          </div>
          
          <div className="flex gap-4 mt-6">
            {!isSignedIn ? (
              <>
                <a href="/sign-in" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Sign In
                </a>
                <a href="/sign-up" className="bg-green-500 text-white px-4 py-2 rounded">
                  Sign Up
                </a>
              </>
            ) : (
              <button 
                onClick={() => clerk.signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
