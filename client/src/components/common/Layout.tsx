// Layout.tsx
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Navigation />  {/* ✅ Doar aici */}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
