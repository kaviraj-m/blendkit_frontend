import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">BlendKit</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                Dashboard
              </Link>
              {user?.role === 'student' && (
                <Link
                  href="/dashboard/student/complaint"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard/student/complaint')
                      ? 'text-primary-600'
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Complaints
                </Link>
              )}
              {user?.role === 'executive_director' && (
                <Link
                  href="/dashboard/executive-director"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard/executive-director')
                      ? 'text-primary-600'
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  Executive Dashboard
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-secondary-600">
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-error-600 hover:text-error-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                BlendKit
              </h3>
              <p className="text-secondary-600">
                A comprehensive student management system for educational institutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-secondary-600 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-secondary-600 hover:text-primary-600"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Contact
              </h3>
              <p className="text-secondary-600">
                Email: support@blendkit.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-secondary-200">
            <p className="text-center text-secondary-600">
              © {new Date().getFullYear()} BlendKit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 