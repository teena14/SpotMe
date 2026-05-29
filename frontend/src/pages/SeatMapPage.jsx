import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { layoutAPI, bookingAPI } from '../services/api';
import { format } from 'date-fns';

// ─── SVG Icon Components ─────────────────────────────────────────────────────

const MonitorIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const StandingDeskIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M7 6v12" />
    <path d="M17 6v12" />
    <path d="M5 18h14" />
  </svg>
);

const WindowIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

const QuietIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DeskIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="8" width="20" height="4" rx="1" />
    <line x1="7" y1="12" x2="7" y2="20" />
    <line x1="17" y1="12" x2="17" y2="20" />
  </svg>
);

const MeetingRoomIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PhoneBoothIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.38 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
  </svg>
);

const CheckIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LayersIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AMENITY_ICONS = {
  monitor: MonitorIcon,
  'standing-desk': StandingDeskIcon,
  'window-view': WindowIcon,
  'quiet-zone': QuietIcon,
};

const TYPE_ICONS = {
  desk: DeskIcon,
  'meeting-room': MeetingRoomIcon,
  'phone-booth': PhoneBoothIcon,
};

const TYPE_LABELS = {
  desk: 'Desk',
  'meeting-room': 'Meeting Room',
  'phone-booth': 'Phone Booth',
};

const AMENITY_LABELS = {
  monitor: 'Monitor',
  'standing-desk': 'Standing Desk',
  'window-view': 'Window View',
  'quiet-zone': 'Quiet Zone',
};

// ─── Seat Node on Canvas ─────────────────────────────────────────────────────

const SEAT_SIZE = 52;
const CANVAS_PADDING = 40;

const getSeatStyle = (seat, isBooked, isSelected) => {
  if (isSelected) {
    return {
      bg: '#9333ea',       // primary-600
      border: '#7e22ce',   // primary-700
      text: '#ffffff',
      icon: '#ffffff',
    };
  }
  if (isBooked) {
    return {
      bg: '#e5e7eb',       // gray-200
      border: '#d1d5db',   // gray-300
      text: '#9ca3af',     // gray-400
      icon: '#9ca3af',
    };
  }
  // Available — shade by type
  const typeColors = {
    desk: { bg: '#f3e8ff', border: '#c084fc', text: '#7e22ce', icon: '#9333ea' },
    'meeting-room': { bg: '#ede9fe', border: '#a78bfa', text: '#5b21b6', icon: '#7c3aed' },
    'phone-booth': { bg: '#faf5ff', border: '#d8b4fe', text: '#6b21a8', icon: '#9333ea' },
  };
  return typeColors[seat.type] || typeColors.desk;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SeatMapPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { seat, x, y }
  const canvasRef = useRef(null);
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

  // Create booking
  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => bookingAPI.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings-date']);
      queryClient.invalidateQueries(['bookings']);
      setSelectedSeat(null);
    },
    onError: (error) => {
      alert(error.response?.data?.error?.message || 'Failed to create booking');
    },
  });

  // Auto-select first layout
  useEffect(() => {
    if (layoutsData && layoutsData.length > 0 && !selectedLayout) {
      setSelectedLayout(layoutsData[0]._id);
    }
  }, [layoutsData, selectedLayout]);

  const isSeatBooked = (seatId) =>
    bookingsData?.some((b) => b.seatId?._id === seatId || b.seatId === seatId);

  const handleSeatClick = (seat) => {
    if (isSeatBooked(seat._id)) return;
    setSelectedSeat((prev) => (prev?._id === seat._id ? null : seat));
  };

  const handleBooking = () => {
    if (selectedSeat && selectedDate) {
      createBookingMutation.mutate({ seatId: selectedSeat._id, date: selectedDate });
    }
  };

  // ── Compute canvas dimensions from seat coordinates ──────────────────────
  const seats = seatsData || [];
  const maxX = seats.length > 0 ? Math.max(...seats.map((s) => s.xCoordinate)) : 0;
  const maxY = seats.length > 0 ? Math.max(...seats.map((s) => s.yCoordinate)) : 0;

  // Treat coordinates as grid cells (1-based), scale to pixel positions
  const CELL = SEAT_SIZE + 12; // seat size + gap
  const canvasW = (maxX + 1) * CELL + CANVAS_PADDING * 2;
  const canvasH = (maxY + 1) * CELL + CANVAS_PADDING * 2;

  const totalSeats = seats.length;
  const bookedCount = seats.filter((s) => isSeatBooked(s._id)).length;
  const availableCount = totalSeats - bookedCount;
  const occupancyPct = totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;

  const selectedLayoutData = layoutsData?.find((l) => l._id === selectedLayout);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Seat Map</h1>
          <p className="text-gray-500 mt-1 text-sm">Select a date and floor, then click an available seat to book it.</p>
        </div>

        {/* ── Controls Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Layout select */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <LayersIcon size={15} color="#9333ea" />
                Floor / Layout
              </label>
              <select
                value={selectedLayout || ''}
                onChange={(e) => { setSelectedLayout(e.target.value); setSelectedSeat(null); }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-gray-800 text-sm"
              >
                {layoutsData?.map((layout) => (
                  <option key={layout._id} value={layout._id}>
                    {layout.name} — Floor {layout.floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon size={15} color="#9333ea" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-800 text-sm"
              />
            </div>
          </div>

          {/* Occupancy Bar */}
          {totalSeats > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Floor Occupancy
                </span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-primary-600">{bookedCount}</span> booked · <span className="font-semibold text-gray-700">{availableCount}</span> available
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${occupancyPct}%`,
                    background: occupancyPct > 80
                      ? '#ef4444'
                      : occupancyPct > 50
                      ? '#f59e0b'
                      : '#9333ea',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{occupancyPct}% occupied</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-primary-100 border-2 border-primary-400" />
              <span>Available Desk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-violet-100 border-2 border-violet-400" />
              <span>Meeting Room</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gray-200 border-2 border-gray-300" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-primary-600 border-2 border-primary-700" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* ── Seat Map Canvas ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-auto">
          {selectedLayoutData && (
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">{selectedLayoutData.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
                Floor {selectedLayoutData.floor}
              </span>
              {selectedLayoutData.description && (
                <span className="text-sm text-gray-400">{selectedLayoutData.description}</span>
              )}
            </div>
          )}

          {seatsLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-100 border-t-primary-600 mb-4" />
              <p className="text-gray-400 text-sm">Loading floor plan...</p>
            </div>
          ) : seats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <LayersIcon size={28} color="#9ca3af" />
              </div>
              <p className="text-gray-500 font-medium">No seats in this layout</p>
              <p className="text-gray-400 text-sm mt-1">An admin needs to add seats to this floor.</p>
            </div>
          ) : (
            /* Coordinate-positioned canvas */
            <div
              ref={canvasRef}
              className="relative select-none"
              style={{
                width: canvasW,
                height: canvasH,
                minWidth: '100%',
                backgroundImage:
                  'radial-gradient(circle, #e9d5ff 1px, transparent 1px)',
                backgroundSize: `${CELL}px ${CELL}px`,
                backgroundPosition: `${CANVAS_PADDING}px ${CANVAS_PADDING}px`,
              }}
            >
              {seats.map((seat) => {
                const booked = isSeatBooked(seat._id);
                const selected = selectedSeat?._id === seat._id;
                const style = getSeatStyle(seat, booked, selected);
                const TypeIcon = TYPE_ICONS[seat.type] || DeskIcon;

                const px = CANVAS_PADDING + seat.xCoordinate * CELL;
                const py = CANVAS_PADDING + seat.yCoordinate * CELL;

                return (
                  <button
                    key={seat._id}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      setTooltip({ seat, x: px, y: py });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    disabled={booked}
                    title={`Seat ${seat.seatNumber}`}
                    style={{
                      position: 'absolute',
                      left: px,
                      top: py,
                      width: SEAT_SIZE,
                      height: SEAT_SIZE,
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      borderWidth: selected ? 2.5 : 2,
                      borderStyle: 'solid',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      cursor: booked ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      boxShadow: selected
                        ? '0 0 0 3px rgba(147,51,234,0.35)'
                        : booked
                        ? 'none'
                        : '0 1px 4px rgba(0,0,0,0.08)',
                      transform: selected ? 'scale(1.08)' : 'scale(1)',
                      opacity: booked ? 0.65 : 1,
                      zIndex: selected ? 10 : 1,
                    }}
                    onMouseOver={(e) => {
                      if (!booked && !selected) {
                        e.currentTarget.style.transform = 'scale(1.06)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.2)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!selected) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = booked ? 'none' : '0 1px 4px rgba(0,0,0,0.08)';
                      }
                    }}
                  >
                    <TypeIcon size={15} color={style.icon} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: style.text, lineHeight: 1 }}>
                      {seat.seatNumber}
                    </span>
                    {/* Amenity dots row */}
                    {seat.amenities?.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, marginTop: 1 }}>
                        {seat.amenities.slice(0, 3).map((a) => {
                          const AIcon = AMENITY_ICONS[a];
                          return AIcon ? (
                            <AIcon key={a} size={9} color={style.icon} />
                          ) : null;
                        })}
                      </div>
                    )}
                    {/* Booked checkmark overlay */}
                    {booked && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 14, height: 14, borderRadius: '50%',
                        backgroundColor: '#d1d5db',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <XIcon size={8} color="#6b7280" />
                      </div>
                    )}
                    {/* Selected checkmark */}
                    {selected && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 14, height: 14, borderRadius: '50%',
                        backgroundColor: '#7e22ce',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckIcon size={8} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Tooltip */}
              {tooltip && (
                <div
                  style={{
                    position: 'absolute',
                    left: tooltip.x + SEAT_SIZE + 8,
                    top: tooltip.y,
                    zIndex: 50,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-xs min-w-max">
                    <p className="font-bold text-sm mb-1">Seat {tooltip.seat.seatNumber}</p>
                    <p className="text-gray-300 flex items-center gap-1">
                      {(() => {
                        const T = TYPE_ICONS[tooltip.seat.type];
                        return T ? <T size={11} color="#d1d5db" /> : null;
                      })()}
                      {TYPE_LABELS[tooltip.seat.type] || tooltip.seat.type}
                    </p>
                    {tooltip.seat.amenities?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {tooltip.seat.amenities.map((a) => (
                          <span key={a} className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200" style={{ fontSize: 10 }}>
                            {AMENITY_LABELS[a] || a}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1.5 text-gray-400" style={{ fontSize: 10 }}>
                      {isSeatBooked(tooltip.seat._id) ? 'Already booked' : 'Click to select'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Confirmation Panel ── */}
      {selectedSeat && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const T = TYPE_ICONS[selectedSeat.type] || DeskIcon;
                    return <T size={20} color="#fff" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Seat {selectedSeat.seatNumber} — {TYPE_LABELS[selectedSeat.type] || selectedSeat.type}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                    {selectedSeat.amenities?.length > 0 && (
                      <span className="ml-2 text-gray-400">
                        · {selectedSeat.amenities.map((a) => AMENITY_LABELS[a] || a).join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <XIcon size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={createBookingMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-semibold shadow-sm"
                >
                  <CheckIcon size={14} color="#fff" />
                  {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMapPage;
