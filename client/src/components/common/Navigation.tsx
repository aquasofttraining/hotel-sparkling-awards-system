import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navigation.css'; // dacă vrei stiluri separate

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
        <li><Link to="/profile">Profile</Link></li>

        {user.roleId === 3 && (
          <>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/hotels">All Hotels</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
          </>
        )}

        {user.roleId === 1 && (
          <>
            <li><Link to="/my-hotels">My Hotels</Link></li>
            <li><Link to="/my-reviews">My Reviews</Link></li>
          </>
        )}

        {user.roleId === 2 && (
          <>
            <li><Link to="/explore">Explore Hotels</Link></li>
            <li><Link to="/my-reviews">My Reviews</Link></li>
          </>
        )}

        {user.roleId === 4 && (
          <>
            <li><Link to="/scores">Hotel Scores</Link></li>
            <li><Link to="/reports">Reports</Link></li>
          </>
        )}

        <li><button onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navigation;
