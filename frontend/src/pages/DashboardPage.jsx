import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

const DashboardPage = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAll();
      return data.data;
    },
  });

  const upcomingBookings = bookings?.filter(
    (b) => new Date(b.date) >= new Date() && b.status === 'active'
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Upcoming Bookings</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {upcomingBookings.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {bookings?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Quick Action</h3>
            <Link
              to="/seat-map"
              className="mt-2 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Book a Seat
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Bookings</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No upcoming bookings</p>
                <Link
                  to="/seat-map"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Book your first seat →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Seat {booking.seatId?.seatNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.layoutId?.name} - Floor {booking.layoutId?.floor}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
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
