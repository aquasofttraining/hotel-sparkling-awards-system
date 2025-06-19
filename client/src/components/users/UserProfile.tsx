import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-profile">
      <h2>Profil Utilizator</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role ID:</strong> {user.roleId}</p>
    </div>
  );
};

export default UserProfile;
