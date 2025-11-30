import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

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
    },
  });

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelMutation.mutateAsync(bookingId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : bookings?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings found</p>
            ) : (
              <div className="space-y-4">
                {bookings?.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Seat {booking.seatId?.seatNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.layoutId?.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            booking.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                        {booking.status === 'active' &&
                          new Date(booking.date) >= new Date() && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                      </div>
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

export default MyBookingsPage;
