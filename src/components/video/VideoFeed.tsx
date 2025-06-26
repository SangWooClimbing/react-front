import React, { useState, useEffect, useCallback } from 'react';
import { VideoPost } from '../../types';
import VideoCard from './VideoCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface VideoFeedProps {
  fetchVideosFunction: (page: number) => Promise<{ videos: VideoPost[], hasMore: boolean }>;
  title: string;
  isAuthenticated: boolean; 
  feedKey?: string; 
}

const VideoFeed: React.FC<VideoFeedProps> = ({ 
    fetchVideosFunction, 
    title, 
    isAuthenticated,
    feedKey 
}) => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const loggedInUserId = localStorage.getItem('userId');

  const observer = React.useRef<IntersectionObserver | null>(null);
  
  const loadVideos = useCallback(async (pageToLoad: number, isInitialLoad = false) => {
    if (isLoading && !isInitialLoad) return;
    setIsLoading(true);
    if (isInitialLoad) setError(null); // Clear previous errors on a fresh load/key change
    
    try {
        const { videos: newVideos, hasMore: newHasMore } = await fetchVideosFunction(pageToLoad);
        setVideos(prev => pageToLoad === 1 ? newVideos : [...prev, ...newVideos]);
        setHasMore(newHasMore);
        setCurrentPage(pageToLoad);
    } catch (err) {
        console.error("Failed to load videos:", err);
        setError(err instanceof Error ? err.message : 'Failed to load videos.');
        // Don't setHasMore(false) here, allow retry or display error and keep trying if user scrolls
    } finally {
        setIsLoading(false);
    }
  }, [fetchVideosFunction, isLoading]);

  useEffect(() => {
    setCurrentPage(1); 
    setVideos([]); 
    setHasMore(true);
    setError(null); 
    loadVideos(1, true); 
  }, [feedKey, fetchVideosFunction]); // loadVideos dependency is stable due to useCallback with fetchVideosFunction


  const makeApiRequest = async (url: string, method: string, body?: any) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`/api${url}`, { // Ensure /api prefix
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request to ${url} failed with status ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  };

  const handleLikeToggle = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
        alert("Please log in to like posts.");
        return;
    }
    try {
      await makeApiRequest(`/videos/${postId}/like`, 'POST'); // Assuming backend toggles
      
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video.id === postId
            ? { ...video, 
                likedByUsers: isCurrentlyLiked
                  ? video.likedByUsers.filter(id => id !== loggedInUserId) 
                  : [...(video.likedByUsers || []), loggedInUserId],
                likes: isCurrentlyLiked ? video.likes - 1 : video.likes + 1
              }
            : video
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      alert(`Error toggling like: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleBookmarkToggle = async (postId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
        alert("Please log in to bookmark posts.");
        return;
    }
    try {
      await makeApiRequest(`/videos/${postId}/bookmark`, 'POST'); // Assuming backend toggles
      
      setVideos(prevVideos =>
        prevVideos.map(video =>
          video.id === postId
            ? { ...video, 
                bookmarkedByUsers: isCurrentlyBookmarked 
                ? video.bookmarkedByUsers.filter(id => id !== loggedInUserId) 
                : [...(video.bookmarkedByUsers || []), loggedInUserId] 
              }
            : video
        )
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      alert(`Error toggling bookmark: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !error) { // Don't try to load more if there's an error
        loadVideos(currentPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, currentPage, loadVideos, error]);


  if (videos.length === 0 && isLoading) {
    return (
      <div className="my-8">
        {title && <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>}
        <LoadingSpinner message="Loading videos..." />
      </div>
    );
  }

  if (error && videos.length === 0) { // Show error prominently if it's an initial load error
    return (
         <div className="my-8">
            {title && <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>}
            <p className="text-red-500 text-center py-6 bg-red-50 rounded-md">{error}</p>
        </div>
    );
  }
  
  if (videos.length === 0 && !isLoading && !error) {
     return (
      <div className="my-8">
        {title && <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>}
        <p className="text-slate-600 text-center py-6">No videos found.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      {title && <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>}
      {error && videos.length > 0 && <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-md">{error} Could not load more.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => {
          const card = (
            <VideoCard 
              key={`${video.id}-${index}`} // Add index to key for potential duplicate IDs if data source is unreliable during dev
              video={video} 
              isAuthenticated={isAuthenticated} 
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle} 
            />
          );
          if (videos.length === index + 1 && hasMore && !error) { // Only add ref if more to load and no error
            return (
              <div ref={lastVideoElementRef} key={`ref-${video.id}-${index}`}>
                {card}
              </div>
            );
          } else {
            return card;
          }
        })}
      </div>
      {isLoading && videos.length > 0 && <LoadingSpinner message="Loading more videos..." />}
      {!hasMore && videos.length > 0 && !error && <p className="text-center text-neutral mt-8">You've reached the end!</p>}
    </div>
  );
};

export default VideoFeed;
