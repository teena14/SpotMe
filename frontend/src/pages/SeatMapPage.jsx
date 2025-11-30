import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { layoutAPI, bookingAPI } from '../services/api';
import { format } from 'date-fns';

const SeatMapPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const queryClient = useQueryClient();

  // Fetch layouts
  const { data: layoutsData } = useQuery({
    queryKey: ['layouts'],
    queryFn: async () => {
      const { data } = await layoutAPI.getAll();
      return data.data;
    },
  });

  // Fetch seats for selected layout
  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', selectedLayout],
    queryFn: async () => {
      if (!selectedLayout) return [];
      const { data } = await layoutAPI.getSeats(selectedLayout);
      return data.data;
    },
    enabled: !!selectedLayout,
  });

  // Fetch bookings for selected date
  const { data: bookingsData } = useQuery({
    queryKey: ['bookings-date', selectedDate],
    queryFn: async () => {
      const { data } = await bookingAPI.getByDate(selectedDate);
      return data.data;
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => bookingAPI.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings-date']);
      queryClient.invalidateQueries(['bookings']);
      setSelectedSeat(null);
      alert('Booking created successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.error?.message || 'Failed to create booking');
    },
  });

  // Set first layout as default
  useEffect(() => {
    if (layoutsData && layoutsData.length > 0 && !selectedLayout) {
      setSelectedLayout(layoutsData[0]._id);
    }
  }, [layoutsData, selectedLayout]);

  const handleSeatClick = (seat) => {
    const isBooked = bookingsData?.some(
      (booking) => booking.seatId._id === seat._id
    );
    if (!isBooked) {
      setSelectedSeat(seat);
    }
  };

  const handleBooking = () => {
    if (selectedSeat && selectedDate) {
      createBookingMutation.mutate({
        seatId: selectedSeat._id,
        date: selectedDate,
      });
    }
  };

  const isSeatBooked = (seatId) => {
    return bookingsData?.some((booking) => booking.seatId._id === seatId);
  };

  const getSeatColor = (seat) => {
    if (selectedSeat?._id === seat._id) return 'bg-primary-500 border-primary-600';
    if (isSeatBooked(seat._id)) return 'bg-gray-300 border-gray-400';
    return 'bg-primary-100 border-primary-400 hover:bg-primary-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seat Map</h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Floor/Layout
              </label>
              <select
                value={selectedLayout || ''}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {layoutsData?.map((layout) => (
                  <option key={layout._id} value={layout._id}>
                    {layout.name} - Floor {layout.floor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 border-2 border-primary-400 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded mr-2"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-500 border-2 border-primary-600 rounded mr-2"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          {seatsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading seats...</p>
            </div>
          ) : seatsData && seatsData.length > 0 ? (
            <div className="grid grid-cols-8 gap-4">
              {seatsData.map((seat) => (
                <button
                  key={seat._id}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isSeatBooked(seat._id)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all duration-200
                    flex flex-col items-center justify-center p-2
                    ${getSeatColor(seat)}
                    ${isSeatBooked(seat._id) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer transform hover:scale-105'}
                  `}
                  title={`Seat ${seat.seatNumber} - ${seat.type}`}
                >
                  <span className="text-xs font-semibold">{seat.seatNumber}</span>
                  {seat.amenities && seat.amenities.length > 0 && (
                    <span className="text-xs mt-1">
                      {seat.amenities.includes('monitor') && '🖥️'}
                      {seat.amenities.includes('standing-desk') && '⬆️'}
                      {seat.amenities.includes('window-view') && '🪟'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No seats available for this layout</p>
              <p className="text-sm text-gray-400 mt-2">
                Admin needs to add seats to this layout
              </p>
            </div>
          )}
        </div>

        {/* Booking Panel */}
        {selectedSeat && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-500 shadow-lg p-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected: Seat {selectedSeat.seatNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Type: {selectedSeat.type} | Date: {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </p>
                {selectedSeat.amenities && selectedSeat.amenities.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Amenities: {selectedSeat.amenities.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={createBookingMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapPage;
