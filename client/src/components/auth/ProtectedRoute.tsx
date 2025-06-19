import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles: number[]; // Lista de roluri permise
  redirectTo: string; // URL-ul unde să redirecționeze dacă accesul este interzis
  children: React.ReactNode; // Componentele copil
}

/**
 * Protejează rutele de utilizatori neautentificați sau fără rol potrivit.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo,
  children,
}) => {
  const { user } = useAuth();

  // Verifică dacă utilizatorul are un rol permis
  if (!user || !allowedRoles.includes(user.roleId)) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
