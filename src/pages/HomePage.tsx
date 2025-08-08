import React, { useState, useEffect, useCallback } from 'react';
import GymCarousel from '../components/gym/GymCarousel';
import VideoFeed from '../components/video/VideoFeed';
import { Gym, VideoPost } from '../types';
import { UserCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../constants';
import { fetchFeaturedGyms, toggleGymBookmark, fetchRecommendedVideos as apiFetchRecommendedVideos } from '../api';

interface HomePageProps {
  isAuthenticated: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ isAuthenticated }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [errorGyms, setErrorGyms] = useState<string | null>(null);
  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const loadFeaturedGyms = async () => {
      setLoadingGyms(true);
      setErrorGyms(null);
      try {
        const featuredGyms = await fetchFeaturedGyms();
        setGyms(featuredGyms || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load gyms';
        setErrorGyms(errorMessage);
        console.error("Error fetching featured gyms:", errorMessage);
      } finally {
        setLoadingGyms(false);
      }
    };
    loadFeaturedGyms();
  }, []);

  const fetchRecommendedVideos = useCallback(async (page: number): Promise<{ videos: VideoPost[], hasMore: boolean }> => {
    try {
      const result = await apiFetchRecommendedVideos(page);
      return result || { videos: [], hasMore: false };
    } catch (error) {
      console.error("Failed to fetch recommended videos:", error);
      throw error;
    }
  }, []);

  const handleGymBookmarkToggle = async (gymId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
      alert("Please log in to bookmark gyms.");
      return;
    }
    try {
      await toggleGymBookmark(gymId);
      setGyms(prevGyms =>
        prevGyms.map(gym =>
          gym.id === gymId
            ? {
              ...gym,
              bookmarkedByUsers: isCurrentlyBookmarked
                ? gym.bookmarkedByUsers.filter(id => id !== loggedInUserId)
                : [...(gym.bookmarkedByUsers || []), loggedInUserId]
            }
            : gym
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not update bookmark';
      console.error("Failed to toggle gym bookmark:", errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const profileLink = loggedInUserId ? `${ROUTE_PATHS.PROFILE}/${loggedInUserId}` : ROUTE_PATHS.LOGIN;

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome to ClimbLog!</h1>
        <p className="text-lg mb-4">Discover new gyms, track your progress, and share your climbs.</p>
        <div className="flex space-x-4">
          <Link to={profileLink} className="bg-white text-primary font-semibold py-2 px-4 rounded-md hover:bg-slate-100 transition-colors flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2" /> My Profile
          </Link>
          <Link to={ROUTE_PATHS.SEARCH_RESULTS} className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" /> Explore
          </Link>
        </div>
      </section>

      <section>
        {errorGyms && <p className="text-red-500 text-center bg-red-50 p-3 rounded-md">{errorGyms}</p>}
        <GymCarousel
          gyms={gyms}
          title="Featured Climbing Gyms"
          isAuthenticated={isAuthenticated}
          onBookmarkToggle={handleGymBookmarkToggle}
          isLoading={loadingGyms}
        />
      </section>

      <section>
        <VideoFeed
          fetchVideosFunction={fetchRecommendedVideos}
          title="Recommended Videos"
          isAuthenticated={isAuthenticated}
          feedKey="recommended-home"
        />
      </section>
    </div>
  );
};

export default HomePage;
