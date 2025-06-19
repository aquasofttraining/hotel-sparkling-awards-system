import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css'; // Add a CSS file for custom styles

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome Back!</h1>
        <p className="login-subtitle">Log in to access your account</p>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
