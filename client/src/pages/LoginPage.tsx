import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hotel Sparkling Awards
          </h1>
          <p className="text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Test Credentials:</p>
          <p>Admin: admin1@sparklingawards.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
