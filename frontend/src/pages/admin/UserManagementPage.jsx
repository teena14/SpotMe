import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ShieldIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UserIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const BanIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ChevronUpIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FilterIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ user }) => {
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('') ||
    user.email?.[0]?.toUpperCase() || '?';
  const colors = ['#9333ea', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];
  const colorIdx = user.email ? user.email.charCodeAt(0) % colors.length : 0;

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: colors[colorIdx] }}
    >
      {initials}
    </div>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
    role === 'admin'
      ? 'bg-primary-100 text-primary-700 border border-primary-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200'
  }`}>
    {role === 'admin' ? <ShieldIcon size={11} color="#9333ea" /> : <UserIcon size={11} color="#6b7280" />}
    {role}
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('firstName');
  const [sortDir, setSortDir] = useState('asc');
  const [actionLoading, setActionLoading] = useState({});

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users-all'],
    queryFn: async () => {
      const { data } = await adminAPI.getAllUsers();
      return data.data;
    },
  });

  const users = usersResponse?.users ?? usersResponse ?? [];

  const blockMut = useMutation({
    mutationFn: (id) => adminAPI.blockUser(id),
    onMutate: (id) => setActionLoading((p) => ({ ...p, [id]: true })),
    onSettled: (_, __, id) => {
      setActionLoading((p) => ({ ...p, [id]: false }));
      queryClient.invalidateQueries(['admin-users-all']);
    },
  });

  const unblockMut = useMutation({
    mutationFn: (id) => adminAPI.unblockUser(id),
    onMutate: (id) => setActionLoading((p) => ({ ...p, [id]: true })),
    onSettled: (_, __, id) => {
      setActionLoading((p) => ({ ...p, [id]: false }));
      queryClient.invalidateQueries(['admin-users-all']);
    },
  });

  // ── Filtering + sorting ───────────────────────────────────────────────────
  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active' && !u.isBlocked)
        || (statusFilter === 'blocked' && u.isBlocked);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDownIcon size={12} color="#d1d5db" />;
    return sortDir === 'asc'
      ? <ChevronUpIcon size={12} color="#9333ea" />
      : <ChevronDownIcon size={12} color="#9333ea" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users.length} registered users
          </p>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon size={15} color="#9ca3af" />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            {/* Role filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <FilterIcon size={13} color="#9ca3af" />
              <span className="font-semibold text-gray-400">Role:</span>
              {['all', 'employee', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize ${
                    roleFilter === r
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">Status:</span>
              {['all', 'active', 'blocked'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize ${
                    statusFilter === s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-sm text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100 border-t-primary-600 mr-3" />
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <UserIcon size={32} color="#e9d5ff" />
              <p className="text-gray-400 text-sm mt-3">No users match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3">
                      <button
                        onClick={() => toggleSort('firstName')}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition-colors"
                      >
                        User <SortIcon field="firstName" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3">
                      <button
                        onClick={() => toggleSort('email')}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition-colors"
                      >
                        Email <SortIcon field="email" />
                      </button>
                    </th>
                    <th className="text-left px-5 py-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</span>
                    </th>
                    <th className="text-left px-5 py-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                    </th>
                    <th className="text-left px-5 py-3">
                      <button
                        onClick={() => toggleSort('createdAt')}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition-colors"
                      >
                        Joined <SortIcon field="createdAt" />
                      </button>
                    </th>
                    <th className="text-right px-5 py-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.firstName || ''} {user.lastName || ''}
                            </p>
                            {user.department && (
                              <p className="text-xs text-gray-400">{user.department}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-500">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {user.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            <BanIcon size={11} color="#dc2626" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircleIcon size={11} color="#16a34a" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-400 text-xs">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.isBlocked ? (
                            <button
                              onClick={() => unblockMut.mutate(user._id)}
                              disabled={!!actionLoading[user._id]}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircleIcon size={12} color="#16a34a" />
                              {actionLoading[user._id] ? '...' : 'Unblock'}
                            </button>
                          ) : (
                            <button
                              onClick={() => blockMut.mutate(user._id)}
                              disabled={!!actionLoading[user._id]}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              <BanIcon size={12} color="#dc2626" />
                              {actionLoading[user._id] ? '...' : 'Block'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
              <span>Showing {filtered.length} of {users.length} users</span>
              <span>
                {users.filter((u) => !u.isBlocked).length} active ·{' '}
                {users.filter((u) => u.isBlocked).length} blocked ·{' '}
                {users.filter((u) => u.role === 'admin').length} admins
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
