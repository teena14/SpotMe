import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import { layoutAPI } from '../../services/api';

// ─── Icons ───────────────────────────────────────────────────────────────────

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const EditIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const XIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LayersIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const GridIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const SEAT_SIZE = 48;
const CELL = SEAT_SIZE + 10;
const PAD = 30;
const GRID_COLS = 10;
const GRID_ROWS = 8;
const CANVAS_W = PAD * 2 + GRID_COLS * CELL;
const CANVAS_H = PAD * 2 + GRID_ROWS * CELL;

const SEAT_TYPES = ['desk', 'meeting-room', 'phone-booth'];
const AMENITIES_LIST = ['monitor', 'standing-desk', 'window-view', 'quiet-zone'];

const TYPE_COLORS = {
  desk: { bg: '#f3e8ff', border: '#c084fc', text: '#7e22ce' },
  'meeting-room': { bg: '#ede9fe', border: '#a78bfa', text: '#5b21b6' },
  'phone-booth': { bg: '#faf5ff', border: '#d8b4fe', text: '#6b21a8' },
};

const TYPE_LABELS = { desk: 'Desk', 'meeting-room': 'Meeting Room', 'phone-booth': 'Phone Booth' };

// ─── Layout Modal ─────────────────────────────────────────────────────────────

const LayoutModal = ({ initial, onSave, onClose, loading }) => {
  const [form, setForm] = useState(
    initial || { name: '', floor: '', description: '', capacity: 20 }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Layout' : 'New Layout'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XIcon size={16} color="#6b7280" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Layout Name *</label>
            <input
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Open Plan A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Floor *</label>
              <input
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                value={form.floor} onChange={(e) => set('floor', e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Capacity *</label>
              <input
                type="number" min="1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm resize-none"
              value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Optional description..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.name || !form.floor || !form.capacity}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <CheckIcon size={14} color="#fff" />
            {loading ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Seat Modal ───────────────────────────────────────────────────────────────

const SeatModal = ({ initial, gridX, gridY, onSave, onClose, loading }) => {
  const [form, setForm] = useState(
    initial
      ? { seatNumber: initial.seatNumber, type: initial.type, amenities: initial.amenities || [] }
      : { seatNumber: '', type: 'desk', amenities: [] }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Seat' : `Add Seat at (${gridX}, ${gridY})`}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <XIcon size={16} color="#6b7280" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seat Number *</label>
            <input
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              value={form.seatNumber} onChange={(e) => set('seatNumber', e.target.value)}
              placeholder="e.g. A1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {SEAT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                    form.type === t
                      ? 'bg-primary-600 border-primary-700 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES_LIST.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all text-left ${
                    form.amenities.includes(a)
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    form.amenities.includes(a) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                  }`}>
                    {form.amenities.includes(a) && <CheckIcon size={10} color="#fff" />}
                  </span>
                  {a.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...form, xCoordinate: gridX, yCoordinate: gridY })}
            disabled={loading || !form.seatNumber}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <CheckIcon size={14} color="#fff" />
            {loading ? 'Saving...' : 'Save Seat'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Floor Canvas ─────────────────────────────────────────────────────────────

const FloorCanvas = ({ seats, onCellClick, onSeatClick }) => {
  // Build a lookup: "x,y" -> seat
  const seatMap = {};
  seats.forEach((s) => { seatMap[`${s.xCoordinate},${s.yCoordinate}`] = s; });

  return (
    <div
      className="relative overflow-auto"
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundImage: 'radial-gradient(circle, #e9d5ff 1px, transparent 1px)',
        backgroundSize: `${CELL}px ${CELL}px`,
        backgroundPosition: `${PAD}px ${PAD}px`,
        borderRadius: 16,
        border: '1px solid #f3e8ff',
      }}
    >
      {/* Grid cells (click targets for empty cells) */}
      {Array.from({ length: GRID_ROWS }, (_, row) =>
        Array.from({ length: GRID_COLS }, (_, col) => {
          const key = `${col},${row}`;
          const occupied = !!seatMap[key];
          if (occupied) return null;
          return (
            <div
              key={key}
              onClick={() => onCellClick(col, row)}
              style={{
                position: 'absolute',
                left: PAD + col * CELL,
                top: PAD + row * CELL,
                width: SEAT_SIZE,
                height: SEAT_SIZE,
                borderRadius: 10,
                border: '1.5px dashed #e9d5ff',
                cursor: 'crosshair',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f3e8ff';
                e.currentTarget.style.borderColor = '#c084fc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#e9d5ff';
              }}
              title="Click to add seat"
            >
              <PlusIcon size={14} color="#c084fc" />
            </div>
          );
        })
      )}

      {/* Seat nodes */}
      {seats.map((seat) => {
        const c = TYPE_COLORS[seat.type] || TYPE_COLORS.desk;
        return (
          <div
            key={seat._id}
            onClick={() => onSeatClick(seat)}
            style={{
              position: 'absolute',
              left: PAD + seat.xCoordinate * CELL,
              top: PAD + seat.yCoordinate * CELL,
              width: SEAT_SIZE,
              height: SEAT_SIZE,
              backgroundColor: c.bg,
              border: `2px solid ${c.border}`,
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              zIndex: 5,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.18)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
            }}
            title={`${seat.seatNumber} — ${TYPE_LABELS[seat.type]}`}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: c.text }}>{seat.seatNumber}</span>
            <span style={{ fontSize: 8, color: c.text, opacity: 0.7 }}>{TYPE_LABELS[seat.type]?.substring(0, 4)}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const LayoutManagementPage = () => {
  const queryClient = useQueryClient();
  const [selectedLayoutId, setSelectedLayoutId] = useState(null);

  // Modals
  const [layoutModal, setLayoutModal] = useState(null); // null | { mode: 'create'|'edit', data? }
  const [seatModal, setSeatModal] = useState(null);     // null | { mode: 'create'|'edit', gridX?, gridY?, seat? }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null | { type: 'layout'|'seat', id }

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: layoutsData, isLoading: layoutsLoading } = useQuery({
    queryKey: ['layouts'],
    queryFn: async () => {
      const { data } = await layoutAPI.getAll();
      return data.data;
    },
    onSuccess: (d) => {
      if (d?.length > 0 && !selectedLayoutId) setSelectedLayoutId(d[0]._id);
    },
  });

  // auto-select first layout
  if (layoutsData?.length > 0 && !selectedLayoutId) {
    setSelectedLayoutId(layoutsData[0]._id);
  }

  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', selectedLayoutId],
    queryFn: async () => {
      if (!selectedLayoutId) return [];
      const { data } = await layoutAPI.getSeats(selectedLayoutId);
      return data.data;
    },
    enabled: !!selectedLayoutId,
  });

  const selectedLayout = layoutsData?.find((l) => l._id === selectedLayoutId);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createLayoutMut = useMutation({
    mutationFn: (d) => layoutAPI.create(d),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['layouts']);
      setSelectedLayoutId(res.data.data._id);
      setLayoutModal(null);
    },
  });

  const updateLayoutMut = useMutation({
    mutationFn: ({ id, d }) => layoutAPI.update(id, d),
    onSuccess: () => { queryClient.invalidateQueries(['layouts']); setLayoutModal(null); },
  });

  const deleteLayoutMut = useMutation({
    mutationFn: (id) => layoutAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['layouts']);
      setSelectedLayoutId(null);
      setDeleteConfirm(null);
    },
  });

  const createSeatMut = useMutation({
    mutationFn: (d) => layoutAPI.createSeat(selectedLayoutId, d),
    onSuccess: () => { queryClient.invalidateQueries(['seats', selectedLayoutId]); setSeatModal(null); },
  });

  const updateSeatMut = useMutation({
    mutationFn: ({ seatId, d }) => layoutAPI.updateSeat(selectedLayoutId, seatId, d),
    onSuccess: () => { queryClient.invalidateQueries(['seats', selectedLayoutId]); setSeatModal(null); },
  });

  const deleteSeatMut = useMutation({
    mutationFn: (seatId) => layoutAPI.deleteSeat(selectedLayoutId, seatId),
    onSuccess: () => { queryClient.invalidateQueries(['seats', selectedLayoutId]); setDeleteConfirm(null); },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLayoutSave = (form) => {
    if (layoutModal.mode === 'create') {
      createLayoutMut.mutate(form);
    } else {
      updateLayoutMut.mutate({ id: selectedLayoutId, d: form });
    }
  };

  const handleSeatSave = (form) => {
    if (seatModal.mode === 'create') {
      createSeatMut.mutate(form);
    } else {
      updateSeatMut.mutate({ seatId: seatModal.seat._id, d: form });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.type === 'layout') deleteLayoutMut.mutate(deleteConfirm.id);
    else deleteSeatMut.mutate(deleteConfirm.id);
  };

  const seats = seatsData || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Floor Layouts</h1>
            <p className="text-gray-400 text-sm mt-1">Manage floors and seat positions visually</p>
          </div>
          <button
            onClick={() => setLayoutModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <PlusIcon size={15} color="#fff" />
            New Layout
          </button>
        </div>

        <div className="flex gap-6">

          {/* ── Left: Layout List ─────────────────────────────────────────── */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layouts</h2>
              </div>

              {layoutsLoading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
              ) : layoutsData?.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No layouts yet.<br />Create one to get started.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {layoutsData.map((layout) => (
                    <button
                      key={layout._id}
                      onClick={() => setSelectedLayoutId(layout._id)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                        selectedLayoutId === layout._id
                          ? 'bg-primary-50 border-r-2 border-primary-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <LayersIcon size={15} color="#9333ea" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedLayoutId === layout._id ? 'text-primary-700' : 'text-gray-800'}`}>
                          {layout.name}
                        </p>
                        <p className="text-xs text-gray-400">Floor {layout.floor} · Cap. {layout.capacity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Canvas + Controls ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {!selectedLayout ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                  <GridIcon size={28} color="#c084fc" />
                </div>
                <p className="text-gray-500 font-medium">Select or create a layout</p>
                <p className="text-gray-400 text-sm mt-1">Then click any cell on the canvas to add seats</p>
              </div>
            ) : (
              <>
                {/* Layout header */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedLayout.name}</h2>
                    <p className="text-sm text-gray-400">
                      Floor {selectedLayout.floor} · Capacity {selectedLayout.capacity}
                      {selectedLayout.description && ` · ${selectedLayout.description}`}
                    </p>
                    <p className="text-xs text-primary-600 font-semibold mt-1">
                      {seats.length} seats placed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLayoutModal({ mode: 'edit', data: selectedLayout })}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <EditIcon size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'layout', id: selectedLayoutId })}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon size={14} color="#dc2626" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-500">
                  {Object.entries(TYPE_COLORS).map(([type, c]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded" style={{ background: c.bg, border: `1.5px solid ${c.border}` }} />
                      {TYPE_LABELS[type]}
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-primary-400">
                    <div className="w-4 h-4 rounded border border-dashed border-primary-300 flex items-center justify-center">
                      <PlusIcon size={8} color="#c084fc" />
                    </div>
                    Click to add seat
                  </div>
                </div>

                {/* Canvas */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-auto">
                  {seatsLoading ? (
                    <div className="flex items-center justify-center h-48 text-sm text-gray-400">Loading seats...</div>
                  ) : (
                    <FloorCanvas
                      seats={seats}
                      onCellClick={(col, row) => setSeatModal({ mode: 'create', gridX: col, gridY: row })}
                      onSeatClick={(seat) => setSeatModal({ mode: 'edit', seat })}
                    />
                  )}
                </div>

                {/* Seats list */}
                {seats.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700">Seat List</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {seats.map((seat) => (
                        <div key={seat._id} className="flex items-center justify-between px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ background: TYPE_COLORS[seat.type]?.bg, color: TYPE_COLORS[seat.type]?.text }}
                            >
                              {seat.seatNumber}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{TYPE_LABELS[seat.type]}</p>
                              <p className="text-xs text-gray-400">
                                ({seat.xCoordinate}, {seat.yCoordinate})
                                {seat.amenities?.length > 0 && ` · ${seat.amenities.join(', ')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSeatModal({ mode: 'edit', seat, gridX: seat.xCoordinate, gridY: seat.yCoordinate })}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <EditIcon size={13} color="#6b7280" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'seat', id: seat._id })}
                              className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                            >
                              <TrashIcon size={13} color="#ef4444" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Layout Modal ── */}
      {layoutModal && (
        <LayoutModal
          initial={layoutModal.data}
          onSave={handleLayoutSave}
          onClose={() => setLayoutModal(null)}
          loading={createLayoutMut.isPending || updateLayoutMut.isPending}
        />
      )}

      {/* ── Seat Modal ── */}
      {seatModal && (
        <SeatModal
          initial={seatModal.seat}
          gridX={seatModal.gridX ?? seatModal.seat?.xCoordinate}
          gridY={seatModal.gridY ?? seatModal.seat?.yCoordinate}
          onSave={handleSeatSave}
          onClose={() => setSeatModal(null)}
          loading={createSeatMut.isPending || updateSeatMut.isPending}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <TrashIcon size={22} color="#ef4444" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-500 text-sm mb-6">
              {deleteConfirm.type === 'layout'
                ? 'This will permanently delete the layout and all its seats and bookings.'
                : 'This will permanently delete the seat and all its bookings.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLayoutMut.isPending || deleteSeatMut.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteLayoutMut.isPending || deleteSeatMut.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutManagementPage;
