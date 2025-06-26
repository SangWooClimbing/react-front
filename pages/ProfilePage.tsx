
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserProfile as UserProfileType } from '../types';
import { mockUserProfile, mockUsers, mockVideoPosts } from '../utils/mockData'; 
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProfileStatsChart from '../components/profile/ProfileStatsChart';
import ClimbingCalendar from '../components/profile/ClimbingCalendar';
import VideoFeed from '../components/video/VideoFeed';
import EditProfileModal from '../components/profile/EditProfileModal'; // New
import { AtSymbolIcon, MapPinIcon, CalendarDaysIcon, IdentificationIcon, PencilSquareIcon, FilmIcon, ArrowRightIcon, UserIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import { MOCK_USER_ID, ROUTE_PATHS } from '../constants';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state for modal

  const effectiveUserId = userId || MOCK_USER_ID; 

  // Function to fetch/construct profile data
  const loadProfileData = () => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API call
      let foundProfile: UserProfileType | null = null;
      if (effectiveUserId === MOCK_USER_ID) { 
        // For the mock user, directly use and potentially update mockUserProfile
        foundProfile = { ...mockUserProfile }; // Use a copy to ensure re-render on change
      } else { 
        const otherUser = mockUsers.find(u => u.id === effectiveUserId);
        if (otherUser) {
           const userPosts = mockVideoPosts.filter(p => p.uploader.id === effectiveUserId);
           // For simplicity, non-MOCK_USER_ID profiles won't have deep stats/activity in this mock
           foundProfile = {
            ...otherUser,
            isCertifiedSeller: otherUser.isCertifiedSeller || false,
            bio: otherUser.bio || 'This user keeps their climbing secrets!',
            // Simplified stats for other users
            solvedStats: { totalSolved: userPosts.length, grades: {}, problemTypes: {} }, 
            frequentGyms: [],
            climbingActivity: [],
            posts: userPosts 
          };
        }
      }
      setProfile(foundProfile);
      setIsLoading(false);
    }, 700); // Reduced timeout for faster refresh
  };

  useEffect(() => {
    loadProfileData();
  }, [effectiveUserId]);

  const handleProfileSave = (updatedData: { username: string; bio: string; profileImageUrl?: string }) => {
    if (profile && profile.id === MOCK_USER_ID) { // Only allow editing MOCK_USER_ID's profile
      // Update the global mockUserProfile directly (for simulation)
      mockUserProfile.username = updatedData.username;
      mockUserProfile.bio = updatedData.bio;
      if(updatedData.profileImageUrl) {
        mockUserProfile.profileImageUrl = updatedData.profileImageUrl;
      }
      // Update user in mockUsers array as well for consistency if other parts rely on it
      const userIndex = mockUsers.findIndex(u => u.id === MOCK_USER_ID);
      if(userIndex > -1) {
        mockUsers[userIndex].username = updatedData.username;
        mockUsers[userIndex].bio = updatedData.bio;
        if(updatedData.profileImageUrl) {
          mockUsers[userIndex].profileImageUrl = updatedData.profileImageUrl;
        }
      }

      console.log("Mock User Profile Updated:", mockUserProfile);
      loadProfileData(); // Re-load profile data to reflect changes
    }
    setIsEditModalOpen(false);
  };


  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." size="lg" />;
  }

  if (!profile) {
    return <div className="text-center text-xl text-neutral py-10">Profile not found.</div>;
  }

  const isOwnProfile = profile.id === MOCK_USER_ID;
  const profilePostsPreview = profile.posts.slice(0, 4);

  return (
    <div className="container mx-auto">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl mb-8 relative">
        {isOwnProfile && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4"
            onClick={() => setIsEditModalOpen(true)} // Open modal
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
                <span className="flex items-center"><IdentificationIcon className="h-4 w-4 mr-1 text-secondary"/>Total Sends: {profile.solvedStats.totalSolved}</span>
                {profile.frequentGyms.length > 0 && (
                    <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-secondary"/>Fav Gym: {profile.frequentGyms[0].gym.name}</span>
                )}
                 <span className="flex items-center"><FilmIcon className="h-4 w-4 mr-1 text-secondary"/>Videos: {profile.posts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Sections */}
      <div className="space-y-10">
        { (profile.solvedStats.totalSolved > 0 || Object.keys(profile.solvedStats.grades).length > 0) && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4">Climbing Statistics</h2>
            <ProfileStatsChart profile={profile} />
          </section>
        )}

        {profile.climbingActivity.length > 0 && (
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
            {profile.posts.length > profilePostsPreview.length && (
                 <Link to={ROUTE_PATHS.USER_VIDEOS(profile.id)}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRightIcon className="h-4 w-4"/>}>
                        View All ({profile.posts.length})
                    </Button>
                </Link>
            )}
          </div>
          {profilePostsPreview.length > 0 ? (
            <VideoFeed 
                initialVideos={profilePostsPreview} 
                title="" 
                loadMoreVideos={async () => []}
            />
          ) : (
             <div className="text-center py-8 bg-white rounded-lg shadow">
                <FilmIcon className="h-12 w-12 mx-auto text-slate-300 mb-2"/>
                <p className="text-neutral">
                    {isOwnProfile ? "You haven't uploaded any climbs yet. " : `${profile.username} hasn't uploaded any climbs yet.`}
                    {isOwnProfile && 
                        <Link to={ROUTE_PATHS.UPLOAD}>
                            <Button variant="primary" size="sm" className="ml-2 mt-2 sm:mt-0">Upload Now</Button>
                        </Link>
                    }
                </p>
             </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && profile && (
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