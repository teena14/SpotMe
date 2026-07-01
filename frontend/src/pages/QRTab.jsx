import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { checkInAPI } from '../services/api';
import { format } from 'date-fns';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckCircleIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <triangle points="10.29 3.86 1.82 18 22.18 18" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    <path d="M10.29 3.86L1.82 18h20.36zM12 9v4M12 17h.01" />
  </svg>
);

const CalendarIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const DownloadIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShieldIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// ─── Countdown to Deadline ───────────────────────────────────────────────────────

const useCountdown = (booking) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);
  const [deadlineText, setDeadlineText] = useState('');

  useEffect(() => {
    if (!booking || !booking.startTime || !booking.date) {
      setTimeLeft('');
      setIsPast(false);
      return;
    }

    const [hours, minutes] = booking.startTime.split(':').map(Number);
    const deadline = new Date(booking.date);
    deadline.setHours(hours, minutes, 0, 0);
    deadline.setTime(deadline.getTime() + 60 * 60 * 1000); // +1 hour

    setDeadlineText(format(deadline, 'h:mm a'));

    const compute = () => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsPast(true);
        setTimeLeft('Deadline passed');
        return;
      }

      setIsPast(false);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [booking]);

  return { timeLeft, isPast, deadlineText };
};

// ─── Main Component ───────────────────────────────────────────────────────────

const QRTab = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const {
    data: checkInData,
    isLoading: checkInLoading,
    refetch: refetchStatus,
    isFetching,
  } = useQuery({
    queryKey: ['checkin-status'],
    queryFn: async () => {
      const { data } = await checkInAPI.getMyStatus();
      return data.data;
    },
    refetchInterval: 30000,
  });

  const isCheckedIn = checkInData?.isCheckedIn;
  const hasBookingToday = checkInData?.hasBookingToday;
  const checkedInAt = checkInData?.checkedInAt;
  const booking = checkInData?.booking;

  const { timeLeft, isPast, deadlineText } = useCountdown(booking);

  // Build QR payload — must match app.py's expected fields
  const qrPayload = user
    ? JSON.stringify({
      userId: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      roll: user.employeeId || 'EMP-000000',
      position: user.role || 'employee',
      email: user.email,
      appId: 'SpotMe',
    })
    : null;

  // Generate QR code image
  useEffect(() => {
    if (!qrPayload) return;

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [qrPayload]);

  // Download QR as PNG
  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `SpotMe-QR-${user?.employeeId || 'code'}.png`;
    link.click();
  }, [qrDataUrl, user]);

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
    user?.email?.[0]?.toUpperCase() || '?';

  const isDark = user?.settings?.darkMode;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-purple-100/50 to-green-50'} transition-colors duration-200`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">



        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

          {/* ── Left: QR Card ── */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_60px_rgba(109,40,217,0.12),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden w-full md:w-[340px] flex-shrink-0 transition-colors duration-200">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-800 p-6 flex flex-col items-center gap-3">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white backdrop-blur-sm">
                {initials}
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg m-0">
                  {user?.firstName} {user?.lastName}
                </p>

              </div>
            </div>

            {/* QR Code */}
            <div className="p-6 flex flex-col items-center gap-4">

              {/* QR Image */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-primary-50 dark:border-gray-700 shadow-[0_4px_20px_rgba(109,40,217,0.08)] dark:shadow-none transition-colors duration-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Your SpotMe QR Code"
                    className="w-[220px] h-[220px] block rounded-lg"
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-primary-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 rounded-full border-4 border-primary-100 dark:border-gray-600 border-t-primary-600 dark:border-t-primary-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Employee info */}
              <div className="text-center">
                <p style={{ color: '#6b7280', marginTop: '0.35rem', fontSize: '0.95rem' }} className="dark:text-gray-400">
                  Show this QR at the office entrance to check in and mark your seat as occupied.
                </p>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full py-2.5 px-4 rounded-xl border-[1.5px] border-primary-200 dark:border-primary-500/50 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 hover:bg-primary-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <DownloadIcon size={15} color="currentColor" />
                Download QR
              </button>
            </div>
          </div>

          {/* ── Right: Status + Info ── */}
          <div className="flex flex-col gap-4">

            {/* Check-In Status Card */}
            <div className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none border-[1.5px] transition-colors duration-200 ${isCheckedIn ? 'border-green-300 dark:border-green-600' : isPast && !isCheckedIn && hasBookingToday ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'}`}>
              {/* Status header */}
              <div className={`p-5 md:p-6 flex items-center gap-4 ${isCheckedIn ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40' : isPast && hasBookingToday ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40' : 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/40'}`}>
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-lg ${isCheckedIn ? 'bg-green-600 shadow-green-600/30' : isPast && hasBookingToday ? 'bg-red-600 shadow-red-600/30' : 'bg-primary-600 shadow-primary-600/30'}`}>
                  {isCheckedIn
                    ? <CheckCircleIcon size={26} color="white" />
                    : isPast && hasBookingToday
                      ? <AlertIcon size={26} color="white" />
                      : <ClockIcon size={26} color="white" />
                  }
                </div>
                <div>
                  <p className="m-0 font-extrabold text-lg md:text-xl text-gray-900 dark:text-white">
                    {checkInLoading
                      ? 'Checking status...'
                      : isCheckedIn
                        ? 'Checked In!'
                        : isPast && hasBookingToday
                          ? 'Seat Released'
                          : hasBookingToday
                            ? 'Not Yet Checked In'
                            : 'No Booking Today'
                    }
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isCheckedIn && checkedInAt
                      ? `Checked in at ${format(new Date(checkedInAt), 'hh:mm a')} — your seat is marked occupied`
                      : isPast && hasBookingToday
                        ? 'You did not check in within 1 hour of your start time — your seat was released'
                        : hasBookingToday
                          ? 'Show this QR to the guard at the entrance'
                          : 'Book a seat first, then check in with this QR'
                    }
                  </p>
                </div>
              </div>

              {/* Refresh row */}
              <div className="px-5 md:px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </span>
                <button
                  onClick={() => refetchStatus()}
                  disabled={isFetching}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 text-xs font-semibold cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-600 transition-all duration-150 disabled:opacity-60"
                >
                  <RefreshIcon size={13} color="currentColor" />
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Today's Booking Card */}
            {hasBookingToday && booking && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden transition-colors duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="m-0 font-bold text-gray-900 dark:text-white text-sm">
                    Today's Booked Seat
                  </p>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPinIcon size={17} color={isDark ? '#c084fc' : '#7c3aed'} />
                    </div>
                    <div>
                      <p className="m-0 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Seat</p>
                      <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white m-0">
                        {booking.seatNumber}
                        {booking.layout && <span className="font-normal text-gray-500 dark:text-gray-400 text-sm"> — {booking.layout}</span>}
                        {booking.floor && <span className="font-normal text-gray-500 dark:text-gray-400 text-sm">, Floor {booking.floor}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="m-0 text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Date & Time</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white m-0">
                        {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                        <span className="font-normal text-gray-500 dark:text-gray-400 ml-2">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Status pill */}
                  <div className="pt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'checked-in' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : booking.status === 'no-show' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      }`}>
                      <span className="w-2 h-2 rounded-full bg-current inline-block" />
                      {booking.status === 'checked-in' ? 'Occupied — Checked In' : booking.status === 'no-show' ? 'Released (No-Show)' : 'Reserved — Pending Check-In'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Deadline Card */}
            {hasBookingToday && !isCheckedIn && !isPast && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 rounded-2xl border-[1.5px] border-amber-200 dark:border-amber-700 p-5 flex items-center gap-4 transition-colors duration-200">
                <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(245,158,11,0.3)] dark:shadow-amber-900/50">
                  <ClockIcon size={22} color="white" />
                </div>
                <div>
                  <p className="m-0 font-bold text-amber-800 dark:text-amber-200 text-sm">
                    Check in before {deadlineText || 'the deadline'}
                  </p>
                  <p className="mt-1 font-mono font-semibold text-amber-700 dark:text-amber-300 text-xs">
                    ⏱ {timeLeft} remaining
                  </p>
                </div>
              </div>
            )}

            {/* How to use */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-[1.5px] border-gray-200 dark:border-gray-700 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none p-6 transition-colors duration-200">
              <p className="m-0 mb-4 font-bold text-gray-900 dark:text-white text-sm">
                How to Check In
              </p>
              {[
                { step: '1', text: 'Book a seat from the Seat Map page', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30', border: 'border-primary-100 dark:border-primary-800' },
                { step: '2', text: 'Come to the office and open this QR tab', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30', border: 'border-primary-100 dark:border-primary-800' },
                { step: '3', text: 'Show the QR to the security guard or kiosk scanner', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30', border: 'border-primary-100 dark:border-primary-800' },
                { step: '4', text: 'Your seat is marked as occupied automatically', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30', border: 'border-primary-100 dark:border-primary-800' },
              ].map(({ step, text, color, bg, border }) => (
                <div key={step} className="flex items-start gap-3 mb-3">
                  <div className={`w-7 h-7 rounded-full ${bg} ${color} border-[1.5px] ${border} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
                    {step}
                  </div>
                  <p className="m-0 text-sm text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
                    {text}
                  </p>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50">
                <p className="m-0 text-xs text-orange-700 dark:text-orange-400 font-medium">
                  If you don't check in within <strong>1 hour</strong> of your booking start time, your seat is automatically released.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default QRTab;
