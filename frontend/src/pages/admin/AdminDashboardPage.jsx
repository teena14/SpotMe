import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI, layoutAPI, bookingAPI } from '../../services/api';
import { format } from 'date-fns';

// ─── Icons ───────────────────────────────────────────────────────────────────

const UsersIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LayersIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const TrendingIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ArrowRightIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MapIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const ShieldIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${accent}18` }}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-0.5" style={{ color: accent }}>
        {value ?? <span className="text-gray-300 text-lg animate-pulse">—</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Quick Action Card ────────────────────────────────────────────────────────

const ActionCard = ({ to, icon, title, desc, accent }) => (
  <Link
    to={to}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
      style={{ backgroundColor: `${accent}18` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 mt-0.5 truncate">{desc}</p>
    </div>
    <ArrowRightIcon size={16} color="#c084fc" />
  </Link>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const today = new Date().toISOString().split('T')[0];

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-all'],
    queryFn: async () => {
      const { data } = await adminAPI.getAllUsers();
      // API returns { success, data: [...users] }
      return Array.isArray(data.data) ? data.data : (data.data?.users ?? []);
    },
  });

  const { data: allBookings } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: async () => {
      const { data } = await adminAPI.getAllBookings();
      // API returns { success, data: [...bookings] }
      return Array.isArray(data.data) ? data.data : (data.data?.bookings ?? []);
    },
  });

  const { data: layoutsData } = useQuery({
    queryKey: ['layouts'],
    queryFn: async () => {
      const { data } = await layoutAPI.getAll();
      return data.data;
    },
  });

  const { data: todayBookings } = useQuery({
    queryKey: ['bookings-date', today],
    queryFn: async () => {
      const { data } = await bookingAPI.getByDate(today);
      return data.data;
    },
  });

  const totalUsers = usersData?.length ?? null;
  const totalLayouts = layoutsData?.length ?? null;
  const bookingsToday = todayBookings?.length ?? null;
  const totalBookings = allBookings?.length ?? null;

  const recentBookings = (allBookings ?? []).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — Overview of workspace activity
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<UsersIcon size={22} color="#9333ea" />}
            label="Total Users"
            value={totalUsers}
            sub="Registered employees"
            accent="#9333ea"
          />
          <StatCard
            icon={<CalendarIcon size={22} color="#7c3aed" />}
            label="Bookings Today"
            value={bookingsToday}
            sub={format(new Date(), 'MMM d')}
            accent="#7c3aed"
          />
          <StatCard
            icon={<LayersIcon size={22} color="#6d28d9" />}
            label="Active Layouts"
            value={totalLayouts}
            sub="Floor plans"
            accent="#6d28d9"
          />
          <StatCard
            icon={<TrendingIcon size={22} color="#5b21b6" />}
            label="Total Bookings"
            value={totalBookings}
            sub="All time"
            accent="#5b21b6"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              to="/admin/users"
              icon={<UsersIcon size={22} color="#9333ea" />}
              title="Manage Users"
              desc="View, block, and assign roles"
              accent="#9333ea"
            />
            <ActionCard
              to="/admin/layouts"
              icon={<MapIcon size={22} color="#7c3aed" />}
              title="Floor Layouts"
              desc="Create and edit floor plans"
              accent="#7c3aed"
            />
            <ActionCard
              to="/seat-map"
              icon={<LayersIcon size={22} color="#6d28d9" />}
              title="View Seat Map"
              desc="See live occupancy heatmap"
              accent="#6d28d9"
            />
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
            <span className="text-xs text-gray-400">{recentBookings.length} entries</span>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarIcon size={32} color="#e9d5ff" />
              <p className="text-gray-400 text-sm mt-3">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seat</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                            {(booking.userId?.firstName?.[0] || booking.userId?.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {booking.userId?.firstName
                                ? `${booking.userId.firstName} ${booking.userId.lastName || ''}`
                                : booking.userId?.email || 'Unknown'}
                            </p>
                            <p className="text-gray-400 text-xs">{booking.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {booking.seatId?.seatNumber || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {booking.layoutId?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {booking.date
                          ? format(new Date(booking.date), 'MMM d, yyyy')
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            booking.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {booking.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
