"use client";

import React, { useEffect } from 'react';
import ProfilePage from '../../../components/ProfilePage';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

export default function DashboardProfilePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      // Redirect unauthenticated users to the sign-in page
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  // While Clerk is loading, you can show a simple placeholder
  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full p-6" style={{ backgroundColor: 'var(--base-primary)' }}>
      <ProfilePage />
    </div>
  );
}
