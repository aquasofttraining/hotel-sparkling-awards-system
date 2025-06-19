import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ScoringLeaderboard from '../components/dashboard/ScorinLeaderboard';
import QuickActions from '../components/dashboard/QuickActions';
import HotelList from '../components/hotels/HotelList';
import HotelCard from '../components/dashboard/HotelCard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Welcome, {user.username}!</h1>

      {/* Acțiuni rapide în funcție de rol */}
      <QuickActions roleId={user.roleId} />

      {/* Vizualizare leaderboard doar pentru Admin și Data Operator */}
      {(user.roleId === 3 || user.roleId === 4) && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Hotel Scoring Leaderboard</h2>
          <ScoringLeaderboard />
        </>
      )}

      {/* Managerii văd hotelurile gestionate */}
      {user.roleId === 1 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Your Hotels</h2>
          <HotelList onlyManagedByUser />
        </>
      )}

      {/* Travelerii văd doar hoteluri, fără management */}
      {user.roleId === 2 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Browse Hotels</h2>
          <HotelList />
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
