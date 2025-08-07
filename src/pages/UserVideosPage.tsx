import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { VideoPost, User } from '../types';
import VideoFeed from '../components/video/VideoFeed';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FilmIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ROUTE_PATHS } from '../constants';

interface UserVideosPageProps {
  isAuthenticated: boolean;
}

const UserVideosPage: React.FC<UserVideosPageProps> = ({ isAuthenticated }) => {
  const { userIdParam } = useParams<{ userIdParam: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This is a placeholder API fetch function. Replace with your actual API call.
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


  useEffect(() => {
    if (!userIdParam) {
        setIsLoading(false);
        setError("User ID is missing from URL.");
        // navigate(ROUTE_PATHS.HOME); 
        return;
    }
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Assuming this is the correct endpoint for user data.
        const userData = await fetchApi(`/users/${userIdParam}`); // Assuming an endpoint for basic user details
        setUser(userData?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
        console.error(`Error fetching user ${userIdParam}:`, err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userIdParam, fetchApi, navigate]);

  const fetchUserVideosPage = useCallback(async (page: number): Promise<{ videos: VideoPost[], hasMore: boolean }> => {
    if (!userIdParam) return { videos: [], hasMore: false };
    try {
      // Assuming this is the correct endpoint for user videos.
      const response = await fetchApi(`/videos?userId=${userIdParam}&page=${page}&limit=8`); // Example limit
      return {
        videos: response?.data || [],
        hasMore: (response?.data?.length || 0) > 0 && response?.meta?.hasMore !== false, // Adjust based on your API's pagination meta
      };
    } catch (err) {
      console.error(`Failed to fetch videos for user ${userIdParam}, page ${page}:`, err);
      throw err; // Rethrow for VideoFeed to handle display of error
    }
  }, [userIdParam, fetchApi]);

  if (isLoading) {
    return <LoadingSpinner message="Loading user's climbs..." size="lg" />;
  }
  if (error) {
    return <div className="text-center text-xl text-red-500 py-10">{error}</div>;
  }
  if (!user) {
    return <div className="text-center text-xl text-neutral py-10">User not found.</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <Link 
          to={`${ROUTE_PATHS.PROFILE}/${user.id}`} 
          className="inline-flex items-center text-primary hover:text-blue-700 transition-colors mb-4 group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to {user.username}'s Profile
        </Link>
        <div className="flex items-center">
            <img src={user.profileImageUrl || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.username} className="h-12 w-12 rounded-full mr-4 border-2 border-primary" />
            <h1 className="text-3xl font-bold text-slate-800">
              All Climbs by {user.username}
            </h1>
        </div>
      </div>

      <VideoFeed 
        fetchVideosFunction={fetchUserVideosPage}
        title="" // Title is handled above
        isAuthenticated={isAuthenticated}
        feedKey={`user-videos-${userIdParam}`} // Unique key for this feed
      />
      {/* Message for no videos is now handled by VideoFeed component */}
    </div>
  );
};

export default UserVideosPage;
