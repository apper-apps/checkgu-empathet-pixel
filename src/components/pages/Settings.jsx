import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { schoolSettingsService } from '@/services/api/schoolSettingsService';

const Settings = () => {
  const [settings, setSettings] = useState({
    schoolName: '',
    academicYearStart: '',
    academicYearEnd: '',
    language: 'english',
    timezone: 'Asia/Kuala_Lumpur',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await schoolSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await schoolSettingsService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSettings} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your school and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* School Information */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                School Information
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Basic information about your school
              </p>
            </div>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <Input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  placeholder="Enter your school name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year Start
                  </label>
                  <Input
                    type="date"
                    value={settings.academicYearStart}
                    onChange={(e) => handleInputChange('academicYearStart', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year End
                  </label>
                  <Input
                    type="date"
                    value={settings.academicYearEnd}
                    onChange={(e) => handleInputChange('academicYearEnd', e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </Card>

          {/* Application Preferences */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Application Preferences
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Customize how the application works for you
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="english">English</option>
                  <option value="malay">Bahasa Malaysia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (GMT+8)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Jakarta">Asia/Jakarta (GMT+7)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Notification Settings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Control when and how you receive notifications
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Class Reminders
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get notified 5 minutes before class starts
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Upload Notifications
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get notified when lesson plan processing is complete
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Calendar Alerts
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get notified about upcoming holidays and breaks
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} />
                  <span>Save Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Quick Actions
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="Download" size={16} />
                Export Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="Upload" size={16} />
                Import Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="RotateCcw" size={16} />
                Reset to Default
              </Button>
            </div>
          </Card>

          {/* Application Info */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Application Info
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <ApperIcon name="BookOpen" size={32} className="text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Checkgu</h4>
                <p className="text-sm text-gray-600">Version 1.0.0</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-medium">2.4 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plans Processed</span>
                  <span className="font-medium">42</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Help & Support */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Help & Support
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="HelpCircle" size={16} />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="FileText" size={16} />
                Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ApperIcon name="Mail" size={16} />
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;