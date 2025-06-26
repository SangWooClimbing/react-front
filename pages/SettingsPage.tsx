
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import { UserCircleIcon, BellIcon, LockClosedIcon, CogIcon, PaintBrushIcon, LanguageIcon, AdjustmentsHorizontalIcon, TrashIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface SettingItemProps {
  label: string;
  description?: string;
  control: React.ReactNode;
  icon?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, description, control, icon }) => (
  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-600 flex items-center">
      {icon && <span className="mr-2 h-5 w-5 text-slate-500">{icon}</span>}
      {label}
    </dt>
    <dd className="mt-1 flex text-sm text-slate-900 sm:mt-0 sm:col-span-2 items-center">
      <span className="flex-grow">{description}</span>
      <div className="ml-4 flex-shrink-0">
        {control}
      </div>
    </dd>
  </div>
);

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; 
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label }) => (
  <label htmlFor={id} className="flex items-center cursor-pointer">
    <div className="relative">
      <input 
        id={id} 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-full' : ''}`}></div>
    </div>
    {label && <span className="ml-3 text-sm text-slate-700">{label}</span>}
  </label>
);


const SettingsPage: React.FC = () => {
  // Mock states for settings
  const [email, setEmail] = useState('user@example.com'); // Mocked, no actual change functionality
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [language, setLanguage] = useState('en');
  const [measurementUnits, setMeasurementUnits] = useState<'imperial' | 'metric'>('metric');

  const [emailNotifications, setEmailNotifications] = useState({
    newFollowers: true,
    mentions: true,
    gymUpdates: false,
    storeAlerts: true,
  });
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSettingChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any, settingName: string) => {
    setter(value);
    console.log(`Setting "${settingName}" changed to:`, value);
    // In a real app, you'd call an API to save this preference.
    // For theme, actual application of theme (CSS change) would happen here or via context/global state.
    if (settingName === 'Theme') {
        // Mock theme application
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        if (value === 'light') document.documentElement.classList.add('theme-light');
        else if (value === 'dark') document.documentElement.classList.add('theme-dark');
        // 'system' would require listening to OS preference.
    }
  };
  
  const handleNotificationChange = (type: keyof typeof emailNotifications, value: boolean) => {
    setEmailNotifications(prev => ({ ...prev, [type]: value }));
    console.log(`Email notification "${type}" changed to:`, value);
  };


  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <CogIcon className="h-8 w-8 mr-3 text-primary" />
          Settings
        </h1>
      </div>

      {/* Account Settings */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <UserCircleIcon className="h-6 w-6 mr-2 text-primary" /> Account
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-0">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem 
                label="Email Address" 
                icon={<EnvelopeIcon />}
                control={
                    <input 
                        type="email" 
                        value={email} 
                        // For simplicity, email change is mock and doesn't use handleSettingChange directly here.
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full sm:w-auto p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        aria-label="Email Address"
                    />
                } 
            />
            <SettingItem 
                label="Change Password" 
                icon={<LockClosedIcon />}
                control={<Button variant="outline" size="sm" onClick={() => alert('Mock: Password change screen')}>Change</Button>} 
            />
            <SettingItem 
                label="Delete Account" 
                description="Permanently delete your account and all data."
                icon={<TrashIcon />}
                control={<Button variant="danger" size="sm" onClick={() => confirm('Are you sure you want to delete your account? This is a mock action.')}>Delete</Button>} 
            />
          </dl>
        </div>
      </div>

      {/* Preferences Settings */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <PaintBrushIcon className="h-6 w-6 mr-2 text-secondary" /> Preferences
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-0">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem 
                label="Theme" 
                icon={<PaintBrushIcon />}
                control={
                    <select value={theme} onChange={(e) => handleSettingChange(setTheme, e.target.value, 'Theme')} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Theme selection">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                } 
            />
            <SettingItem 
                label="Autoplay Videos" 
                icon={<AdjustmentsHorizontalIcon />}
                control={<ToggleSwitch id="autoplay" checked={autoplayVideos} onChange={(val) => handleSettingChange(setAutoplayVideos, val, 'Autoplay Videos')} />} 
            />
             <SettingItem 
                label="Language" 
                icon={<LanguageIcon />}
                control={
                    <select value={language} onChange={(e) => handleSettingChange(setLanguage, e.target.value, 'Language')} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Language selection">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="ko">한국어</option>
                    </select>
                } 
            />
            <SettingItem 
                label="Measurement Units" 
                icon={<AdjustmentsHorizontalIcon />}
                control={
                    <select value={measurementUnits} onChange={(e) => handleSettingChange(setMeasurementUnits, e.target.value, 'Measurement Units')} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Measurement units selection">
                        <option value="metric">Metric (meters, kg)</option>
                        <option value="imperial">Imperial (feet, lbs)</option>
                    </select>
                } 
            />
          </dl>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-accent" /> Notifications
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-0">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem label="Email: New Followers" control={<ToggleSwitch id="emailNewFollowers" checked={emailNotifications.newFollowers} onChange={(val) => handleNotificationChange('newFollowers', val)} />} />
            <SettingItem label="Email: Mentions" control={<ToggleSwitch id="emailMentions" checked={emailNotifications.mentions} onChange={(val) => handleNotificationChange('mentions', val)} />} />
            <SettingItem label="Email: Gym Updates" control={<ToggleSwitch id="emailGymUpdates" checked={emailNotifications.gymUpdates} onChange={(val) => handleNotificationChange('gymUpdates', val)} />} />
            <SettingItem label="Email: Store Alerts" control={<ToggleSwitch id="emailStoreAlerts" checked={emailNotifications.storeAlerts} onChange={(val) => handleNotificationChange('storeAlerts', val)} />} />
            <SettingItem label="Push Notifications (All)" control={<ToggleSwitch id="pushNotifications" checked={pushNotifications} onChange={(val) => handleSettingChange(setPushNotifications, val, 'Push Notifications')} />} />
          </dl>
        </div>
      </div>

      {/* Privacy section removed as per user request */}

    </div>
  );
};

export default SettingsPage;
