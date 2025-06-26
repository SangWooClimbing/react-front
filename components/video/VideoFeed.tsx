
import React, { useState, useEffect, useCallback } from 'react';
import { VideoPost } from '../../types';
import VideoCard from './VideoCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { mockVideoPosts } from '../../utils/mockData'; // Using mock data

interface VideoFeedProps {
  initialVideos?: VideoPost[];
  title: string;
  loadMoreVideos?: () => Promise<VideoPost[]>; // For infinite scroll
}

const VideoFeed: React.FC<VideoFeedProps> = ({ initialVideos = [], title, loadMoreVideos }) => {
  const [videos, setVideos] = useState<VideoPost[]>(initialVideos.length > 0 ? initialVideos : []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // For mock pagination

  const observer = React.useRef<IntersectionObserver | null>(null);
  
  const fetchInitialVideos = useCallback(() => {
    if(initialVideos.length > 0) return; // Already has initial videos
    setIsLoading(true);
    // Simulate API call for initial load
    setTimeout(() => {
      const newVideos = mockVideoPosts.slice(0, 6); // Load first 6 mock videos
      setVideos(newVideos);
      setPage(1);
      setHasMore(mockVideoPosts.length > 6);
      setIsLoading(false);
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVideos.length]);

  useEffect(() => {
    fetchInitialVideos();
  }, [fetchInitialVideos]);


  const fetchMoreVideos = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    if (loadMoreVideos) { // If a custom loader is provided
        const newVideos = await loadMoreVideos();
        setVideos(prev => [...prev, ...newVideos]);
        setHasMore(newVideos.length > 0);
    } else { // Default mock loader
        // Simulate API call
        setTimeout(() => {
          const nextPage = page + 1;
          const itemsPerPage = 3;
          const startIndex = (nextPage -1) * itemsPerPage + (initialVideos.length > 0 ? 0 : 6); // Adjust if initial videos were passed
          const newMockVideos = mockVideoPosts.slice(startIndex, startIndex + itemsPerPage);
          
          setVideos(prev => [...prev, ...newMockVideos]);
          setPage(nextPage);
          setHasMore(mockVideoPosts.length > videos.length + newMockVideos.length);
          setIsLoading(false);
        }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasMore, loadMoreVideos, page, videos.length, initialVideos.length]);


  const lastVideoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreVideos();
      }
    });
    if (node) observer.current.observe(node);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasMore]);


  if (videos.length === 0 && isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
        <LoadingSpinner message="Loading videos..." />
      </div>
    );
  }
  
  if (videos.length === 0 && !isLoading) {
     return (
      <div className="my-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
        <p className="text-slate-600">No videos found.</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, index) => {
          if (videos.length === index + 1) {
            return (
              <div ref={lastVideoElementRef} key={video.id}>
                <VideoCard video={video} />
              </div>
            );
          } else {
            return <VideoCard key={video.id} video={video} />;
          }
        })}
      </div>
      {isLoading && <LoadingSpinner message="Loading more videos..." />}
      {!hasMore && videos.length > 0 && <p className="text-center text-neutral mt-8">You've reached the end!</p>}
    </div>
  );
};

export default VideoFeed;
    