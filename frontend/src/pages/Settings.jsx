import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Toggle from '../components/common/Toggle';
import Toast from '../components/common/Toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [settings, setSettings] = useState({
    account: {
      email: user?.email || '',
      phone: '',
      language: 'English',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      newsLetters: false,
    },
    privacy: {
      profileVisibility: 'private',
      showContactInfo: false,
      allowThirdParty: false,
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAccountChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      account: { ...prev.account, [field]: value }
    }));
  };

  const handleNotificationChange = (field) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: !prev.notifications[field] }
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <div className="space-y-0">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={settings.account.email}
                      onChange={(e) => handleAccountChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={settings.account.phone}
                      onChange={(e) => handleAccountChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.account.language}
                      onChange={(e) => handleAccountChange('language', e.target.value)}
                      className="input-base"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Change Password</h3>
                    <Button variant="secondary">Change Password</Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
                    <Button variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Email Notifications</h3>
                      <p className="text-sm text-slate-600">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                      className="w-6 h-6"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">SMS Notifications</h3>
                      <p className="text-sm text-slate-600">Receive text messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                      className="w-6 h-6"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Appointment Reminders</h3>
                      <p className="text-sm text-slate-600">Get reminded about upcoming appointments</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.appointmentReminders}
                      onChange={() => handleNotificationChange('appointmentReminders')}
                      className="w-6 h-6"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Newsletter</h3>
                      <p className="text-sm text-slate-600">Subscribe to our health tips newsletter</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.newsLetters}
                      onChange={() => handleNotificationChange('newsLetters')}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="input-base"
                    >
                      <option value="private">Private (Only me)</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Show Contact Information</h3>
                      <p className="text-sm text-slate-600">Allow doctors to contact you directly</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showContactInfo}
                      onChange={() => handlePrivacyChange('showContactInfo', !settings.privacy.showContactInfo)}
                      className="w-6 h-6"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Allow Third-Party Integration</h3>
                      <p className="text-sm text-slate-600">Share data with trusted partners</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowThirdParty}
                      onChange={() => handlePrivacyChange('allowThirdParty', !settings.privacy.allowThirdParty)}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                    <p className="text-slate-600 mb-4">Add an extra layer of security to your account</p>
                    <Button variant="secondary">Enable 2FA</Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Active Sessions</h3>
                    <p className="text-slate-600 mb-4">Manage your active login sessions</p>
                    <Button variant="secondary">View Sessions</Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Login History</h3>
                    <p className="text-slate-600 mb-4">View your recent login activity</p>
                    <Button variant="secondary">View History</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-6 flex gap-4">
              <Button
                variant="primary"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;