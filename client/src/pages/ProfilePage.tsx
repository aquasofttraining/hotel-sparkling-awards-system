import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Profilul meu</h1>
      <p><strong>Nume utilizator:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol ID:</strong> {user.roleId}</p>
      {/* Dacă ai și alte câmpuri în JWT, le poți adăuga aici */}
    </div>
  );
};

export default ProfilePage;
