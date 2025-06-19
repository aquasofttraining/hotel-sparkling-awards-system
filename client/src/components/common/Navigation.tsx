import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navigation">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/explore-hotels">Explore Hotels</Link></li>
        <li><Link to="/scoring-leaderboard">Rankings</Link></li>
        <li><Link to="/profile">Profile</Link></li>

        {user.roleId === 3 && (
          <>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/hotels/add">Add Hotel</Link></li>
          </>
        )}

        {user.roleId === 1 && (
          <>
            <li><Link to={`/hotels/${user.hotelId || 'my-hotel'}`}>My Hotel</Link></li>
          </>
        )}

        {user.roleId === 4 && (
          <>
            <li><Link to="/hotels/add">Add Hotel</Link></li>
          </>
        )}

        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navigation;
