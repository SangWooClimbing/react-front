
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import { 
    UserCircleIcon, BellIcon, LockClosedIcon, CogIcon, PaintBrushIcon, LanguageIcon, 
    AdjustmentsHorizontalIcon, TrashIcon, EnvelopeIcon, BookmarkIcon, FilmIcon, BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';
import { VideoPost, Gym, User } from '../types';
import VideoCard from '../components/video/VideoCard';
import GymCard from '../components/gym/GymCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
      <span className="flex-grow">{description || ''}</span>
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

interface SettingsPageProps {
    loggedInUserId: string | null;
}

interface UserSettingsData {
    email: string;
    username: string; // Add username if needed for display
    profileImageUrl: string; // Add for completeness
    preferences: {
        theme: 'light' | 'dark' | 'system';
        autoplayVideos: boolean;
        language: string;
        measurementUnits: 'imperial' | 'metric';
    };
    notifications: {
        email: {
            newFollowers: boolean;
            mentions: boolean;
            gymUpdates: boolean;
            storeAlerts: boolean;
        };
        push: boolean; // Simplified push notifications toggle
    };
}

const SettingsPage: React.FC<SettingsPageProps> = ({ loggedInUserId }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState(''); 
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

  const [bookmarkedVideoPosts, setBookmarkedVideoPosts] = useState<VideoPost[]>([]);
  const [bookmarkedGyms, setBookmarkedGyms] = useState<Gym[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<'climbs' | 'gyms'>('climbs');
  
  const isAuthenticated = !!loggedInUserId; 

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`/api${url}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      setIsLoadingSettings(true);
      setSettingsError(null);
      fetchApi(`/users/${loggedInUserId}/settings`)
        .then(response => {
          const settingsData = response?.data as UserSettingsData;
          if (settingsData) {
            setCurrentUserEmail(settingsData.email || '');
            setTheme(settingsData.preferences?.theme || 'system');
            setAutoplayVideos(settingsData.preferences?.autoplayVideos !== undefined ? settingsData.preferences.autoplayVideos : true);
            setLanguage(settingsData.preferences?.language || 'en');
            setMeasurementUnits(settingsData.preferences?.measurementUnits || 'metric');
            setEmailNotifications(settingsData.notifications?.email || emailNotifications);
            setPushNotifications(settingsData.notifications?.push !== undefined ? settingsData.notifications.push : true);
          }
        })
        .catch(err => setSettingsError(err instanceof Error ? err.message : 'Failed to load settings.'))
        .finally(() => setIsLoadingSettings(false));
    } else {
      setIsLoadingSettings(false);
    }
  }, [loggedInUserId, fetchApi]);

  const loadBookmarkedItems = useCallback(async () => {
    if (!loggedInUserId) return;
    setIsLoadingBookmarks(true);
    setBookmarksError(null);
    try {
      const [videoData, gymData] = await Promise.all([
        fetchApi(`/users/${loggedInUserId}/bookmarks/videos`), // Assuming endpoint like this
        fetchApi(`/users/${loggedInUserId}/bookmarks/gyms`)   // Assuming endpoint like this
      ]);
      setBookmarkedVideoPosts(videoData?.data || []);
      setBookmarkedGyms(gymData?.data || []);
    } catch (err) {
      setBookmarksError(err instanceof Error ? err.message : 'Failed to load bookmarks.');
      console.error("Error fetching bookmarks:", err);
    } finally {
      setIsLoadingBookmarks(false);
    }
  }, [loggedInUserId, fetchApi]);

  useEffect(() => {
    loadBookmarkedItems();
  }, [loadBookmarkedItems]);

  const updateSetting = async (settingKey: string, value: any) => {
    if (!loggedInUserId) return;
    try {
        await fetchApi(`/users/${loggedInUserId}/settings`, {
            method: 'PUT',
            body: JSON.stringify({ [settingKey]: value }) // Backend needs to handle partial updates
        });
        // Optionally show success message
    } catch (err) {
        alert(`Failed to update ${settingKey}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Revert UI change or re-fetch settings
        loadBookmarkedItems(); // Re-fetch all settings as a simple way to revert
    }
  };


  const handleVideoBookmarkToggleForSettings = async (postId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) return;
    try {
        await fetchApi(`/videos/${postId}/bookmark`, { method: 'POST' });
        setBookmarkedVideoPosts(prev => prev.filter(p => p.id !== postId)); // Optimistically remove
    } catch (err) { alert("Error removing bookmark."); }
  };
  
  const handleGymBookmarkToggleForSettings = async (gymId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) return;
    try {
        await fetchApi(`/gyms/${gymId}/bookmark`, { method: 'POST' });
        setBookmarkedGyms(prev => prev.filter(g => g.id !== gymId)); // Optimistically remove
    } catch (err) { alert("Error removing bookmark.");}
  };
  
  const handleVideoLikeToggleForSettings = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) return;
    try {
        await fetchApi(`/videos/${postId}/like`, { method: 'POST' });
        setBookmarkedVideoPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
            ? { ...p, 
                likedByUsers: isCurrentlyLiked 
                  ? p.likedByUsers.filter(id => id !== loggedInUserId) 
                  : [...(p.likedByUsers || []), loggedInUserId],
                likes: isCurrentlyLiked ? p.likes -1 : p.likes + 1
              } 
            : p)
        );
    } catch (err) { alert("Error updating like."); }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updateSetting('preferences.theme', newTheme); // Assuming nested structure for API
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
    if (newTheme === 'light') {
        document.documentElement.classList.add('theme-light');
    } else if (newTheme === 'dark') {
        document.documentElement.classList.add('theme-dark', 'dark');
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
             document.documentElement.classList.add('dark');
        }
    }
  };


  if (isLoadingSettings) {
    return <LoadingSpinner message="Loading settings..." />;
  }
  if (!isAuthenticated || !loggedInUserId) { // Added !loggedInUserId for clarity
    return <div className="text-center py-10">Please log in to view settings.</div>;
  }
   if (settingsError) {
    return <div className="max-w-4xl mx-auto py-10 text-center text-red-500">{settingsError}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <CogIcon className="h-8 w-8 mr-3 text-primary" />
          Settings
        </h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <UserCircleIcon className="h-6 w-6 mr-2 text-primary" /> Account
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-6">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem 
                label="Email Address" 
                icon={<EnvelopeIcon />}
                control={
                    <input 
                        type="email" 
                        value={currentUserEmail} 
                        onChange={(e) => setCurrentUserEmail(e.target.value)}
                        onBlur={() => updateSetting('email', currentUserEmail)}
                        className="w-full sm:w-auto p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        aria-label="Email Address"
                    />
                } 
            />
            <SettingItem 
                label="Change Password" 
                icon={<LockClosedIcon />}
                control={<Button variant="outline" size="sm" onClick={() => alert('Password change functionality not implemented.')}>Change</Button>} 
            />
            <SettingItem 
                label="Delete Account" 
                description="Permanently delete your account and all data."
                icon={<TrashIcon />}
                control={<Button variant="danger" size="sm" onClick={() => {if(confirm('Are you sure? This action is irreversible.')) alert('Account deletion not implemented.');}}>Delete</Button>} 
            />
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <PaintBrushIcon className="h-6 w-6 mr-2 text-secondary" /> Preferences
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-6">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem 
                label="Theme" 
                icon={<PaintBrushIcon />}
                control={
                    <select value={theme} onChange={(e) => handleThemeChange(e.target.value as typeof theme)} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Theme selection">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                } 
            />
            <SettingItem 
                label="Autoplay Videos" 
                icon={<AdjustmentsHorizontalIcon />}
                control={<ToggleSwitch id="autoplay" checked={autoplayVideos} onChange={(val) => {setAutoplayVideos(val); updateSetting('preferences.autoplayVideos', val);}} />} 
            />
             <SettingItem 
                label="Language" 
                icon={<LanguageIcon />}
                control={
                    <select value={language} onChange={(e) => {setLanguage(e.target.value); updateSetting('preferences.language', e.target.value);}} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Language selection">
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
                    <select value={measurementUnits} onChange={(e) => {setMeasurementUnits(e.target.value as typeof measurementUnits); updateSetting('preferences.measurementUnits', e.target.value);}} className="p-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary focus:border-primary" aria-label="Measurement units selection">
                        <option value="metric">Metric (meters, kg)</option>
                        <option value="imperial">Imperial (feet, lbs)</option>
                    </select>
                } 
            />
          </dl>
        </div>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-accent" /> Notifications
          </h2>
        </div>
        <div className="px-4 py-3 sm:p-6">
          <dl className="sm:divide-y sm:divide-slate-200">
            <SettingItem label="Email: New Followers" control={<ToggleSwitch id="emailNewFollowers" checked={emailNotifications.newFollowers} onChange={(val) => {setEmailNotifications(p => ({...p, newFollowers: val})); updateSetting('notifications.email.newFollowers', val);}} />} />
            <SettingItem label="Email: Mentions" control={<ToggleSwitch id="emailMentions" checked={emailNotifications.mentions} onChange={(val) => {setEmailNotifications(p => ({...p, mentions: val})); updateSetting('notifications.email.mentions', val);}} />} />
            <SettingItem label="Email: Gym Updates" control={<ToggleSwitch id="emailGymUpdates" checked={emailNotifications.gymUpdates} onChange={(val) => {setEmailNotifications(p => ({...p, gymUpdates: val})); updateSetting('notifications.email.gymUpdates', val);}} />} />
            <SettingItem label="Email: Store Alerts" control={<ToggleSwitch id="emailStoreAlerts" checked={emailNotifications.storeAlerts} onChange={(val) => {setEmailNotifications(p => ({...p, storeAlerts: val})); updateSetting('notifications.email.storeAlerts', val);}} />} />
            <SettingItem label="Push Notifications (All)" control={<ToggleSwitch id="pushNotifications" checked={pushNotifications} onChange={(val) => {setPushNotifications(val); updateSetting('notifications.push', val);}} />} />
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
          <h2 className="text-lg leading-6 font-medium text-slate-900 flex items-center">
            <BookmarkIcon className="h-6 w-6 mr-2 text-blue-500" /> My Bookmarks (즐겨찾기)
          </h2>
        </div>
        <div className="px-4 pt-3 pb-6 sm:p-6">
          {bookmarksError && <p className="text-red-500 text-center py-4">{bookmarksError}</p>}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveBookmarkTab('climbs')}
                className={`${
                  activeBookmarkTab === 'climbs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base flex items-center`}
              >
                <FilmIcon className="h-5 w-5 mr-2"/> Bookmarked Climbs ({bookmarkedVideoPosts.length})
              </button>
              <button
                onClick={() => setActiveBookmarkTab('gyms')}
                className={`${
                  activeBookmarkTab === 'gyms'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral hover:text-slate-700 hover:border-slate-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base flex items-center`}
              >
                <BuildingStorefrontIcon className="h-5 w-5 mr-2"/> Bookmarked Gyms ({bookmarkedGyms.length})
              </button>
            </nav>
          </div>
          
          <div className="mt-6 pt-4">
            {isLoadingBookmarks && <LoadingSpinner message="Loading bookmarks..."/>}
            {!isLoadingBookmarks && !bookmarksError && activeBookmarkTab === 'climbs' && (
              bookmarkedVideoPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarkedVideoPosts.map(post => (
                    <VideoCard 
                      key={post.id} 
                      video={post} 
                      isAuthenticated={isAuthenticated} 
                      onLikeToggle={handleVideoLikeToggleForSettings} 
                      onBookmarkToggle={handleVideoBookmarkToggleForSettings}
                    />
                  ))}
                </div>
              ) : <p className="text-neutral text-center py-4">No bookmarked climbs yet.</p>
            )}
            {!isLoadingBookmarks && !bookmarksError && activeBookmarkTab === 'gyms' && (
              bookmarkedGyms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookmarkedGyms.map(gym => (
                    <GymCard 
                        key={gym.id} 
                        gym={gym} 
                        isAuthenticated={isAuthenticated} 
                        onBookmarkToggle={handleGymBookmarkToggleForSettings} 
                    />
                  ))}
                </div>
              ) : <p className="text-neutral text-center py-4">No bookmarked gyms yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
