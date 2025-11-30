import Navbar from '../../components/Navbar';

const UserManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">User management coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
