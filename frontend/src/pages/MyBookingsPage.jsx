import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
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

const LayersIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const FilterIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const MyBookingsPage = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAll();
      return data.data;
    },
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

  const upcoming = (bookings || []).filter(
    (b) => b.status === 'active' && new Date(b.date) >= today
  );
  const past = (bookings || []).filter(
    (b) => b.status !== 'active' || new Date(b.date) < today
  );

  const StatusBadge = ({ status }) => {
    const configs = {
      active: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-gray-100 text-gray-600 border-gray-200',
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
      <div className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-150 ${
        isUpcoming ? 'border-gray-100 hover:border-primary-200 hover:bg-primary-50/20' : 'border-gray-100 opacity-70'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isUpcoming ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            <CalendarIcon size={16} color={isUpcoming ? '#9333ea' : '#9ca3af'} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Seat {booking.seatId?.seatNumber || '—'}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <LayersIcon size={11} color="#9ca3af" />
              {booking.layoutId?.name || 'Unknown layout'}
              {booking.layoutId?.floor && ` — Floor ${booking.layoutId.floor}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : '—'}
            </p>
            <p className="text-xs text-gray-400">
              {booking.date ? format(new Date(booking.date), 'EEEE') : ''}
            </p>
          </div>
          <StatusBadge status={booking.status} />
          {isUpcoming && (
            <button
              onClick={() => handleCancel(booking._id)}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <XCircleIcon size={12} color="#dc2626" />
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-400 text-sm mt-1">{bookings?.length || 0} total bookings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-primary-600" />
          </div>
        ) : !bookings?.length ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <CalendarIcon size={28} color="#c084fc" />
            </div>
            <p className="text-gray-500 font-semibold mb-1">No bookings yet</p>
            <p className="text-gray-400 text-sm">Head to the Seat Map to book your first seat.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <CalendarIcon size={15} color="#9333ea" />
                  <h2 className="font-bold text-gray-900 text-sm">Upcoming ({upcoming.length})</h2>
                </div>
                <div className="p-4 space-y-3">
                  {upcoming.map((b) => <BookingCard key={b._id} booking={b} />)}
                </div>
              </div>
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <FilterIcon size={14} color="#9ca3af" />
                  <h2 className="font-bold text-gray-700 text-sm">Past & Cancelled ({past.length})</h2>
                </div>
                <div className="p-4 space-y-3">
                  {past.map((b) => <BookingCard key={b._id} booking={b} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
