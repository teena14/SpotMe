import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, authAPI } from '../services/api';

// Icons
const BellIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ShieldIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const PaletteIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill={color} />
    <circle cx="17.5" cy="10.5" r=".5" fill={color} />
    <circle cx="8.5" cy="7.5" r=".5" fill={color} />
    <circle cx="6.5" cy="12.5" r=".5" fill={color} />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.06 0 2-.94 2-2 0-.53-.21-1.04-.59-1.41-.39-.37-.59-.88-.59-1.41 0-1.06.94-2 2-2h1.5c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
  </svg>
);

const XIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowLeftIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
  >
    <span
      className={`${enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const SettingsPage = () => {
  const { user, updateUserSession } = useAuth();
  const navigate = useNavigate();
  
  const [emailNotifs, setEmailNotifs] = useState(user?.settings?.emailNotifs ?? true);
  const [pushNotifs, setPushNotifs] = useState(user?.settings?.pushNotifs ?? false);
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode ?? false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => userAPI.update(user._id || user.id, { settings: newSettings }),
    onSuccess: (res) => {
      updateUserSession(res.data.data);
      if (res.data.data.settings?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    onError: (error) => {
      alert('Failed to save settings: ' + (error.response?.data?.error?.message || error.message));
    }
  });

  const handleSettingChange = (key, value) => {
    if (key === 'emailNotifs') setEmailNotifs(value);
    if (key === 'pushNotifs') setPushNotifs(value);
    if (key === 'darkMode') setDarkMode(value);

    const newSettings = { emailNotifs, pushNotifs, darkMode, [key]: value };
    updateSettingsMutation.mutate(newSettings);
  };

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => {
      alert('Password updated successfully');
      setIsChangingPassword(false);
      setPasswords({ oldPassword: '', newPassword: '' });
    },
    onError: (error) => {
      alert(error.response?.data?.error?.message || 'Failed to change password');
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwords);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-200">

          {/* Notifications */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <BellIcon size={18} color="#9333ea" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive booking confirmations and reminders via email.</p>
                </div>
                <Toggle enabled={emailNotifs} onChange={(v) => handleSettingChange('emailNotifs', v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get instant alerts on your device for check-ins and no-shows.</p>
                </div>
                <Toggle enabled={pushNotifs} onChange={(v) => handleSettingChange('pushNotifs', v)} />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <PaletteIcon size={18} color="#9333ea" />
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch to a darker theme for better viewing in low light.</p>
              </div>
              <Toggle enabled={darkMode} onChange={(v) => handleSettingChange('darkMode', v)} />
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <ShieldIcon size={18} color="#9333ea" />
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Change Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password.</p>
                </div>
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XIcon size={18} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
