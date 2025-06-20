// components/auth/RoleGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: number[]; // Change from string[] to number[]
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = <Navigate to="/unauthorized" replace /> 
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's roleId is in the allowed roles
  if (!allowedRoles.includes(user.roleId)) {
    console.log('Access denied:', {
      userRole: user.roleId,
      allowedRoles,
      hasAccess: allowedRoles.includes(user.roleId)
    });
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
