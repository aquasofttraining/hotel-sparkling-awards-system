interface Props {
  roleId: number;
}

const QuickActions = ({ roleId }: Props) => {
  return (
    <div className="bg-white shadow p-4 rounded-md mb-4">
      {roleId === 3 && <p>Admin Actions: Add User / Manage Hotels</p>}
      {roleId === 1 && <p>Manager Actions: View Assigned Hotels</p>}
      {roleId === 2 && <p>Traveler Actions: Browse & Add Reviews</p>}
      {roleId === 4 && <p>Data Operator: Export, View Reports</p>}
    </div>
  );
};

export default QuickActions;
