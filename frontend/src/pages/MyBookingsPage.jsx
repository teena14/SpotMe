import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

// ─── Icons ───────────────────────────────────────────────────────────────────

const CalendarIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const XCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);



// ─── Main Component ───────────────────────────────────────────────────────────

const MyBookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDark = user?.settings?.darkMode;

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAll();
      return data.data;
    },
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId) => bookingAPI.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      queryClient.invalidateQueries(['bookings']);
    },
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelMutation.mutateAsync(bookingId);
    }
  };

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

  const upcoming = (bookings || []).filter(
    (b) => b.status === 'active' && new Date(b.date) >= today && !isExpired(b)
  );
  
  const past = (bookings || []).filter(
    (b) => {
      if (b.status === 'cancelled') return false; // Handled separately
      if (b.status === 'completed' || b.status === 'checked-in' || b.status === 'no-show') return true;
      if (b.status === 'active' && (new Date(b.date) < today || isExpired(b))) return true;
      return false;
    }
  );

  const cancelled = (bookings || []).filter(
    (b) => b.status === 'cancelled'
  );

  const StatusBadge = ({ status }) => {
    const configs = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${configs[status] || configs.completed}`}>
        {status}
      </span>
    );
  };

  const BookingCard = ({ booking }) => {
    const isUpcoming = booking.status === 'active' && new Date(booking.date) >= today;
    return (
      <div className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-150 ${isUpcoming ? 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 opacity-70'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUpcoming ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}>
            <CalendarIcon size={16} color="currentColor" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Seat {booking.seatId?.seatNumber || '—'}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {booking.layoutId?.name || 'Unknown layout'}
              {booking.layoutId?.floor && ` — Floor ${booking.layoutId.floor}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : '—'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {booking.date ? format(new Date(booking.date), 'EEEE') : ''}
            </p>
          </div>

          {isUpcoming && (
            <button
              onClick={() => handleCancel(booking._id)}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              <XCircleIcon size={12} color="currentColor" />
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{bookings?.length || 0} total bookings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-280 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-500" />
          </div>
        ) : !bookings?.length ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-280 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center py-20 text-center transition-colors duration-200">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-gray-700 flex items-center justify-center mb-4">
              <CalendarIcon size={28} color={isDark ? '#c084fc' : '#c084fc'} />
            </div>
            <p className="text-gray-500 dark:text-gray-300 font-semibold mb-1">No bookings yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Head to the Seat Map to book your first seat.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-280 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Upcoming ({upcoming.length})</h2>
              </div>
              <div className="p-4 space-y-3">
                {upcoming.length > 0 ? (
                  upcoming.map((b) => <BookingCard key={b._id} booking={b} />)
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming bookings.</p>
                )}
              </div>
            </div>

            {/* Past */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-280 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Past Bookings ({past.length})</h2>
              </div>
              <div className="p-4 space-y-3">
                {past.length > 0 ? (
                  past.map((b) => <BookingCard key={b._id} booking={b} />)
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No past bookings.</p>
                )}
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-280 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 text-red-400 dark:text-red-500">
                <h2 className="font-bold text-red-700 dark:text-red-400 text-sm">Cancelled ({cancelled.length})</h2>
              </div>
              <div className="p-4 space-y-3">
                {cancelled.length > 0 ? (
                  cancelled.map((b) => <BookingCard key={b._id} booking={b} />)
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No cancelled bookings.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
