import React from 'react';
import { authService } from '../services/authService';

const UserDebug: React.FC = () => {
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');
  
  return (
    <div className="fixed top-0 right-0 bg-yellow-100 p-4 border rounded z-50">
      <h3>Debug Info:</h3>
      <pre style={{ fontSize: '12px' }}>
        {JSON.stringify({
          user,
          token: token ? token.substring(0, 20) + '...' : 'No token',
          roleId: user?.roleId,
          roleIdType: typeof user?.roleId,
          isAdmin: user?.roleId === 3,
          localStorage: {
            user: localStorage.getItem('user'),
            token: localStorage.getItem('token')
          }
        }, null, 2)}
      </pre>
    </div>
  );
};

export default UserDebug;
