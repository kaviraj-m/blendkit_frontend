import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Just redirect to dashboard since we're auto-logging in with AuthContext
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <FaUserCircle className="text-indigo-600 text-6xl mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">College ERP System</h1>
          <p className="text-gray-600 mt-2">Login to access your dashboard</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
          >
            Login as Student
          </button>
          
          <p className="text-center text-sm text-gray-600 mt-6">
            For this demo, you'll be logged in as a student user automatically.<br />
            You can switch roles once you're in the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 