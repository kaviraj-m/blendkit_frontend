'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to BlendKit</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive platform for educational institution management
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          href="/login"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-center font-medium transition-colors"
        >
          Login
        </Link>
        <Link 
          href="/register"
          className="flex-1 bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 py-3 px-6 rounded-lg text-center font-medium transition-colors"
        >
          Register
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Students</h2>
          <p className="text-gray-600">
            Access your courses, grades, and track your academic progress.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Faculty</h2>
          <p className="text-gray-600">
            Manage your classes, student evaluations, and academic resources.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Administration</h2>
          <p className="text-gray-600">
            Oversee institution operations, departments, and system reports.
          </p>
        </div>
      </div>
    </main>
  );
}
