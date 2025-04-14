'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WardenComplaintsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main warden dashboard
    router.replace('/dashboard/warden');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      <p className="ml-3 text-gray-600">Redirecting to warden dashboard...</p>
    </div>
  );
} 