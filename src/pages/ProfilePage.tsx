import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { UserProfile as UserProfileType, VideoPost } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProfileStatsChart from '../components/profile/ProfileStatsChart';
import ClimbingCalendar from '../components/profile/ClimbingCalendar';
import VideoFeed from '../components/video/VideoFeed';
import EditProfileModal from '../components/profile/EditProfileModal';
import { AtSymbolIcon, MapPinIcon, FilmIcon, ArrowRightIcon, PencilSquareIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import { ROUTE_PATHS } from '../constants';

interface ProfilePageProps {
  isAuthenticated: boolean;
  loggedInUserId: string | null; 
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isAuthenticated, loggedInUserId }) => {
  const { userIdParam } = useParams<{ userIdParam?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const targetUserId = userIdParam || loggedInUserId;

  // TODO: This is a placeholder API fetch function. Replace with your actual API call.
  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    // All API calls are prefixed with /api. You might need to change this depending on your setup.
    const response = await fetch(`/api${url}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  const loadProfileData = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      setError("No user ID provided.");
      // navigate(ROUTE_PATHS.LOGIN); // Optionally redirect if no user context
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with your actual API endpoint for user profiles.
      const profileData = await fetchApi(`/users/${targetUserId}/profile`);
      setProfile(profileData?.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error("Error fetching profile:", err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, fetchApi, navigate]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleProfileSave = async (updatedData: { username: string; bio: string; profileImageUrl?: string }) => {
    if (profile && profile.id === loggedInUserId) {
      try {
        // TODO: Replace with your actual API endpoint for updating user profiles.
        const savedProfile = await fetchApi(`/users/${profile.id}/profile`, { 
            method: 'PUT', 
            body: JSON.stringify(updatedData) 
        });
        setProfile(savedProfile?.data || profile); // Update with response from server or keep optimistic
        setIsEditModalOpen(false);
      } catch (err) {
        alert(`Failed to save profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const fetchUserVideos = useCallback(async (page: number): Promise<{ videos: VideoPost[], hasMore: boolean }> => {
    if (!targetUserId) return { videos: [], hasMore: false };
    try {
      // TODO: Replace with your actual API endpoint for user videos.
      const response = await fetchApi(`/videos?userId=${targetUserId}&page=${page}&limit=4`); // Adjust limit as needed
      return {
        videos: response?.data || [],
        hasMore: (response?.data?.length || 0) > 0 && response?.meta?.hasMore !== false,
      };
    } catch (error) {
      console.error(`Failed to fetch videos for user ${targetUserId}:`, error);
      throw error;
    }
  }, [targetUserId, fetchApi]);

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." size="lg" />;
  }
  if (error) {
    return <div className="text-center text-xl text-red-500 py-10">{error}</div>;
  }
  if (!profile) {
    return <div className="text-center text-xl text-neutral py-10">Profile for user ID '{targetUserId}' not found.</div>;
  }

  const isOwnProfile = profile.id === loggedInUserId;

  return (
    <div className="container mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl mb-8 relative">
        {isOwnProfile && isAuthenticated && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<PencilSquareIcon className="h-4 w-4"/>}
          >
            Edit Profile
          </Button>
        )}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <img 
            src={profile.profileImageUrl || `https://picsum.photos/seed/${profile.id}/200/200`} 
            alt={profile.username} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary shadow-md object-cover"
          />
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">{profile.username}</h1>
            <p className="text-sm sm:text-md text-neutral mt-1"><AtSymbolIcon className="h-4 sm:h-5 w-4 sm:w-5 inline mr-1 align-text-bottom" />{profile.id}</p>
            {profile.isCertifiedSeller && <span className="mt-1 inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Certified Seller</span>}
            {profile.bio && <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-xl">{profile.bio}</p>}
            
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-neutral">
                <span className="flex items-center"><IdentificationIcon className="h-4 w-4 mr-1 text-secondary"/>Total Sends: {profile.solvedStats?.totalSolved || 0}</span>
                {profile.frequentGyms && profile.frequentGyms.length > 0 && (
                    <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-secondary"/>Fav Gym: {profile.frequentGyms[0].gym.name}</span>
                )}
                 <span className="flex items-center"><FilmIcon className="h-4 w-4 mr-1 text-secondary"/>Videos: {profile.posts?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        { (profile.solvedStats && (profile.solvedStats.totalSolved > 0 || Object.keys(profile.solvedStats.grades).length > 0)) && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4">Climbing Statistics</h2>
            <ProfileStatsChart profile={profile} />
          </section>
        )}

        {profile.climbingActivity && profile.climbingActivity.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4">Activity Calendar</h2>
            <ClimbingCalendar activity={profile.climbingActivity} />
          </section>
        )}
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
                {isOwnProfile ? "My Recent Climbs" : `${profile.username}'s Recent Climbs`}
            </h2>
            {profile.posts && profile.posts.length > 4 && ( // Assuming VideoFeed shows 4 by default or pagination limit
                 <Link to={ROUTE_PATHS.USER_VIDEOS(profile.id)}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4"/>}>
                        View All ({profile.posts.length})
                    </Button>
                </Link>
            )}
          </div>
          <VideoFeed 
              fetchVideosFunction={fetchUserVideos}
              title="" 
              isAuthenticated={isAuthenticated}
              feedKey={`user-${targetUserId}`} // Key to re-fetch when targetUserId changes
          />
          {/* Fallback message for empty videos is now handled within VideoFeed based on its own loading/error state */}
        </section>
      </div>

      {isOwnProfile && isAuthenticated && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default ProfilePage;
