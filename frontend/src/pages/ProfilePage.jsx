import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

// ─── Icons ───────────────────────────────────────────────────────────────────

const MailIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const UserIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

const ClockIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value || <span className="text-gray-300">Not set</span>}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings-profile'],
    queryFn: async () => {
      const { data } = await bookingAPI.getAll();
      return data.data || [];
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = (bookings || []).filter(
    (b) => b.status === 'active' && new Date(b.date) >= today
  );
  const pastBookings = (bookings || []).filter(
    (b) => new Date(b.date) < today
  );
  const cancelledBookings = (bookings || []).filter(
    (b) => b.status === 'cancelled'
  );
  const totalBookings = bookings?.length || 0;

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
    user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Identity Card ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Avatar header */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold mb-3 backdrop-blur-sm">
                  {initials}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                </h2>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                    {user?.role === 'admin'
                      ? <><ShieldIcon size={11} color="#fff" /> Admin</>
                      : <><UserIcon size={11} color="#fff" /> Employee</>
                    }
                  </span>
                </div>
              </div>

              {/* Info fields */}
              <div className="px-5 py-2">
                <InfoRow
                  icon={<MailIcon size={15} color="#9333ea" />}
                  label="Email"
                  value={user?.email}
                />
                <InfoRow
                  icon={<UserIcon size={15} color="#9333ea" />}
                  label="Full Name"
                  value={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : null}
                />
                <InfoRow
                  icon={<ShieldIcon size={15} color="#9333ea" />}
                  label="Role"
                  value={user?.role}
                />
                {user?.department && (
                  <InfoRow
                    icon={<UserIcon size={15} color="#9333ea" />}
                    label="Department"
                    value={user.department}
                  />
                )}
                {user?.phone && (
                  <InfoRow
                    icon={<CalendarIcon size={15} color="#9333ea" />}
                    label="Phone"
                    value={user.phone}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Stats + Bookings ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Booking stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Upcoming', value: upcomingBookings.length, color: '#9333ea', bg: '#f3e8ff' },
                { label: 'Completed', value: pastBookings.length, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Cancelled', value: cancelledBookings.length, color: '#dc2626', bg: '#fee2e2' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Upcoming bookings list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <CalendarIcon size={15} color="#9333ea" />
                  Upcoming Bookings
                </h3>
                <span className="text-xs text-gray-400">{upcomingBookings.length} bookings</span>
              </div>

              {isLoading ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-100 border-t-primary-600 mx-auto mb-2" />
                  Loading...
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon size={28} color="#e9d5ff" />
                  <p className="text-gray-400 text-sm mt-3">No upcoming bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon size={15} color="#9333ea" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Seat {booking.seatId?.seatNumber || '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booking.layoutId?.name || 'Unknown layout'}
                            {booking.layoutId?.floor && ` — Floor ${booking.layoutId.floor}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {booking.date ? format(new Date(booking.date), 'MMM d') : '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.date ? format(new Date(booking.date), 'yyyy') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent past bookings */}
            {pastBookings.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <ClockIcon size={15} color="#9ca3af" />
                  <h3 className="font-bold text-gray-900 text-sm">Recent History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {pastBookings.slice(0, 4).map((booking) => (
                    <div key={booking._id} className="px-5 py-3 flex items-center justify-between opacity-70">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Seat {booking.seatId?.seatNumber || '—'} — {booking.layoutId?.name || ''}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.date ? format(new Date(booking.date), 'EEEE, MMM d, yyyy') : ''}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        booking.status === 'cancelled'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {booking.status === 'cancelled'
                          ? <><XIcon size={10} color="#ef4444" /> Cancelled</>
                          : <><CheckIcon size={10} color="#6b7280" /> Completed</>
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
