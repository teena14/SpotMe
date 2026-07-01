import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

// ─── Icons ───────────────────────────────────────────────────────────────────

const CalendarIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const TrendingIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const ArrowRightIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SunIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, accent }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-start gap-4 transition-colors duration-200">

    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-0.5" style={{ color: accent }}>{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAll();
      return data.data;
    },
    refetchInterval: 5000,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  // Helper to check if an active booking is locally expired (1 hour past startTime)
  const isExpired = (b) => {
    if (b.status !== 'active') return false;
    if (new Date(b.date) < today) return true; // past day
    if (new Date(b.date).getTime() === today.getTime() && b.startTime) {
      const [hours, minutes] = b.startTime.split(':').map(Number);
      const startDateTime = new Date(today);
      startDateTime.setHours(hours, minutes, 0, 0);
      const deadline = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hr
      return now > deadline;
    }
    return false;
  };

  const upcomingBookings = (bookings || []).filter(
    (b) => new Date(b.date) >= today && b.status === 'active' && !isExpired(b)
  );

  // Find if there's a checked-in booking for today
  const todayCheckedInBooking = (bookings || []).find(
    (b) => new Date(b.date).getTime() === today.getTime() && b.status === 'checked-in'
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.firstName || 'there';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Welcome Header ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {greeting}, {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-primary-500 text-sm font-semibold mt-2">
            <SunIcon size={15} color="#9333ea" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard

            label="Upcoming Bookings"
            value={upcomingBookings.length}

          />
          <StatCard

            label="Total Bookings"
            value={bookings?.length || 0}

          />
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">

            <div>
              <p className="text-sm text-primary-200 font-medium">Quick Action</p>
              <Link
                to="/seat-map"
                className="inline-flex items-center gap-1.5 mt-1 text-white font-bold text-base hover:opacity-80 transition-opacity"
              >
                Book a Seat
                <ArrowRightIcon size={14} color="#fff" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Today's Checked-In Booking ── */}
        {todayCheckedInBooking && (
          <div className="mb-8 bg-green-1000 dark:bg-green-200/20 rounded-2xl border border-green-200 dark:border-green-800/50 p-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center gap-4">

              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">
                  Checked In to Seat {todayCheckedInBooking.seatId?.seatNumber}
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">
                  {todayCheckedInBooking.layoutId?.name} {todayCheckedInBooking.layoutId?.floor ? `— Floor ${todayCheckedInBooking.layoutId.floor}` : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-green-700 dark:text-green-400 text-sm font-semibold ">
                <span className="w-2 h-2 rounded-full bg-green-500 "></span>
                Active Session
              </span>
              {todayCheckedInBooking.checkedInAt && (
                <p className="text-xs text-green-600 dark:text-green-400 mb-2 mx-2 mt-1 font-medium">
                  Since {format(new Date(todayCheckedInBooking.checkedInAt), 'h:mm a')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Upcoming Bookings ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">

          <div >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100 border-t-primary-600" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon size={24} color="#c084fc" />
                </div>
                <p className="text-gray-500 dark:text-gray-300 font-medium mb-1">No upcoming bookings</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Reserve your workspace for today or any future date.</p>
                <Link
                  to="/seat-map"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  <MapIcon size={14} color="#fff" />
                  Browse Seat Map
                </Link>
                <Link
                  to="/my-bookings"
                  className="text-xs text-primary-600 font-semibold hover:text-primary-700 flex justify-center items-center mt-4"
                >
                  View all
                  <ArrowRightIcon size={12} color="#9333ea" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary-200 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-gray-700/50 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon size={16} color="#9333ea" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          Seat {booking.seatId?.seatNumber}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.layoutId?.name} {booking.layoutId?.floor ? `— Floor ${booking.layoutId.floor}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {format(new Date(booking.date), 'MMM d')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {format(new Date(booking.date), 'EEEE')}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
