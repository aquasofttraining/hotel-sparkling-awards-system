import Navigation from '../common/Navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-4 bg-gray-100">{children}</main>
    </div>
  );
};

export default DashboardLayout;
