
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VideoPost, User } from '../types';
import { mockVideoPosts, mockUsers } from '../utils/mockData';
import VideoFeed from '../components/video/VideoFeed';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FilmIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ROUTE_PATHS } from '../constants';

const UserVideosPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userVideos, setUserVideos] = useState<VideoPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching user and their videos
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        const videos = mockVideoPosts
          .filter(post => post.uploader.id === userId)
          .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setUserVideos(videos);
      }
      setIsLoading(false);
    }, 500);
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner message="Loading user's climbs..." size="lg" />;
  }

  if (!user) {
    return <div className="text-center text-xl text-neutral py-10">User not found.</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <Link 
          to={ROUTE_PATHS.PROFILE + `/${user.id}`} 
          className="inline-flex items-center text-primary hover:text-blue-700 transition-colors mb-4 group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to {user.username}'s Profile
        </Link>
        <div className="flex items-center">
            <img src={user.profileImageUrl} alt={user.username} className="h-12 w-12 rounded-full mr-4 border-2 border-primary" />
            <h1 className="text-3xl font-bold text-slate-800">
            All Climbs by {user.username} ({userVideos.length})
            </h1>
        </div>
      </div>

      {userVideos.length > 0 ? (
        <VideoFeed 
          initialVideos={userVideos} 
          title="" // Title is handled above
          // loadMoreVideos could be implemented if userVideos is paginated
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FilmIcon className="h-20 w-20 text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-500">
            {user.username} hasn't uploaded any climbs yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserVideosPage;
