import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { VideoPost, MediaItem } from '../types';
import { ROUTE_PATHS, APP_LOGO_URL } from '../constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { 
    PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, 
    EyeIcon, HandThumbUpIcon as OutlineHandThumbUpIcon, 
    TagIcon, CalendarDaysIcon, MapPinIcon, ChatBubbleBottomCenterTextIcon, ArrowUturnLeftIcon,
    BookmarkIcon as OutlineBookmarkIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as SolidHandThumbUpIcon, PhotoIcon, VideoCameraIcon as SolidVideoCameraIcon, BookmarkIcon as SolidBookmarkIcon } from '@heroicons/react/24/solid';

interface VideoPostDetailsPageProps {
  isAuthenticated: boolean;
}

const VideoPostDetailsPage: React.FC<VideoPostDetailsPageProps> = ({ isAuthenticated }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<VideoPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const counterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showMediaCounter, setShowMediaCounter] = useState(false);
  const loggedInUserId = localStorage.getItem('userId');

  const fetchApi = useCallback(async (url: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`/api${url}`, { 
        method, 
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request to ${url} failed with status ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    if (!postId) {
        setIsLoading(false);
        setError("Post ID is missing.");
        navigate(ROUTE_PATHS.HOME);
        return;
    }
    const fetchPostDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchApi(`/videos/${postId}`);
        setPost(response?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post details');
        console.error(`Error fetching post ${postId}:`, err);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetails();

    return () => {
      if (counterTimeoutRef.current) clearTimeout(counterTimeoutRef.current);
    };
  }, [postId, navigate, fetchApi]);

  const currentMedia: MediaItem | undefined = post?.media[currentMediaIndex];
  
  const isLikedByCurrentUser = !!(isAuthenticated && loggedInUserId && post?.likedByUsers?.includes(loggedInUserId));
  const isBookmarkedByCurrentUser = !!(isAuthenticated && loggedInUserId && post?.bookmarkedByUsers?.includes(loggedInUserId));


  const handleLikeToggle = async () => {
    if (!isAuthenticated || !post || !loggedInUserId) {
        alert("Please log in to like this post.");
        return;
    }
    try {
      await fetchApi(`/videos/${post.id}/like`, 'POST'); // Assuming backend toggles
      setPost(prevPost => {
        if (!prevPost) return null;
        const currentlyLiked = prevPost.likedByUsers.includes(loggedInUserId);
        const newLikedByUsers = currentlyLiked 
          ? prevPost.likedByUsers.filter(id => id !== loggedInUserId)
          : [...prevPost.likedByUsers, loggedInUserId];
        return {
          ...prevPost,
          likedByUsers: newLikedByUsers,
          likes: newLikedByUsers.length, // Update count based on array length
        };
      });
    } catch (err) { alert(`Error liking post: ${err instanceof Error ? err.message : 'Unknown error'}`); }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated || !post || !loggedInUserId) {
        alert("Please log in to bookmark this post.");
        return;
    }
    try {
      await fetchApi(`/videos/${post.id}/bookmark`, 'POST'); // Assuming backend toggles
       setPost(prevPost => {
        if (!prevPost) return null;
        const currentlyBookmarked = prevPost.bookmarkedByUsers.includes(loggedInUserId);
        const newBookmarkedByUsers = currentlyBookmarked
          ? prevPost.bookmarkedByUsers.filter(id => id !== loggedInUserId)
          : [...prevPost.bookmarkedByUsers, loggedInUserId];
        return {
          ...prevPost,
          bookmarkedByUsers: newBookmarkedByUsers,
        };
      });
    } catch (err) { alert(`Error bookmarking post: ${err instanceof Error ? err.message : 'Unknown error'}`); }
  };

  const handlePlayPauseClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const videoElement = mediaVideoRef.current;
    if (!videoElement || !currentMedia || currentMedia.type !== 'video') return;

    if (videoElement.paused) {
      videoElement.muted = false; // Unmute on manual play if it was muted by autoplay
      videoElement.play().then(() => setIsMediaPlaying(true));
    } else {
      videoElement.pause();
      setIsMediaPlaying(false);
    }
  };
  
  useEffect(() => { 
      setIsMediaPlaying(false);
      if (mediaVideoRef.current) {
          mediaVideoRef.current.pause();
          mediaVideoRef.current.currentTime = 0; 
      }
  }, [currentMediaIndex, postId]);


  const changeMedia = (direction: 'next' | 'prev') => {
    if (!post || post.media.length <= 1) return;
    let newIndex = currentMediaIndex;
    if (direction === 'next') {
      newIndex = (currentMediaIndex + 1) % post.media.length;
    } else {
      newIndex = (currentMediaIndex - 1 + post.media.length) % post.media.length;
    }
    setCurrentMediaIndex(newIndex);
    setShowMediaCounter(true);
    if(counterTimeoutRef.current) clearTimeout(counterTimeoutRef.current);
    counterTimeoutRef.current = setTimeout(() => setShowMediaCounter(false), 2000);
  };


  if (isLoading) {
    return <LoadingSpinner message="Loading post details..." size="lg" />;
  }
  if (error) {
    return (
        <div className="text-center py-10">
            <h1 className="text-2xl font-semibold text-red-600">Error Loading Post</h1>
            <p className="text-neutral mt-2">{error}</p>
            <Button onClick={() => navigate(ROUTE_PATHS.HOME)} variant="primary" className="mt-4">Go Home</Button>
        </div>
    );
  }
  if (!post) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold text-slate-700">Post Not Found</h1>
        <Button onClick={() => navigate(ROUTE_PATHS.HOME)} variant="primary" className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate(-1)} 
        className="mb-6"
        leftIcon={<ArrowUturnLeftIcon className="h-4 w-4"/>}
      >
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group aspect-video bg-slate-800 rounded-lg shadow-lg overflow-hidden">
             <img 
                src={APP_LOGO_URL} 
                alt="ClimbLog Logo" 
                className="absolute top-3 left-3 h-6 w-auto z-30 opacity-70 rounded-sm"
            />
            {currentMedia?.type === 'video' ? (
              <video
                ref={mediaVideoRef}
                key={currentMedia.id}
                src={currentMedia.url}
                poster={currentMedia.thumbnailUrl}
                className="w-full h-full object-contain"
                controls={!isMediaPlaying} 
                loop
                muted={isMediaPlaying && mediaVideoRef.current?.muted} 
                onPlay={() => setIsMediaPlaying(true)}
                onPause={() => setIsMediaPlaying(false)}
                onClick={(e) => {
                    // Prevent click through to underlying elements if controls are visible
                    if (e.target === e.currentTarget && !mediaVideoRef.current?.controls) {
                        handlePlayPauseClick();
                    }
                }} 
                playsInline
              />
            ) : currentMedia?.type === 'image' ? (
              <img 
                src={currentMedia.url} 
                alt={`${post.title} - media ${currentMediaIndex + 1}`} 
                className="w-full h-full object-contain" 
              />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-slate-700">No media available for this post.</div>
            )}

            {currentMedia?.type === 'video' && !isMediaPlaying && ( // Show play button overlay if video and not playing
                <button
                    onClick={() => handlePlayPauseClick()}
                    className="absolute inset-0 flex items-center justify-center w-full h-full z-20 bg-transparent focus:outline-none"
                    aria-label={"Play video"}
                >
                <PlayIcon className="h-20 w-20 text-white opacity-60 hover:opacity-90 transition-opacity" />
                </button>
            )}


            {post.media.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); changeMedia('prev'); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all focus:outline-none"
                  aria-label="Previous media"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); changeMedia('next'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all focus:outline-none"
                  aria-label="Next media"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
                 {showMediaCounter && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full z-30 animate-fadeInOut">
                        {currentMediaIndex + 1} / {post.media.length}
                    </div>
                )}
              </>
            )}
             <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 z-20">
                {currentMedia?.type === 'image' && <PhotoIcon className="h-5 w-5 text-white bg-black/50 rounded-sm p-0.5" />}
                {currentMedia?.type === 'video' && <SolidVideoCameraIcon className="h-5 w-5 text-white bg-black/50 rounded-sm p-0.5" />}
            </div>
          </div>
          
           {post.media.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {post.media.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`aspect-video rounded-md overflow-hidden border-2 transition hover:opacity-80
                    ${currentMediaIndex === index ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                   aria-label={`View media ${index + 1}`}
                >
                  <img src={img.thumbnailUrl || (img.type === 'image' ? img.url : `https://picsum.photos/seed/${img.id}/160/90`)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}


          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-slate-700 mb-3">Description</h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>
                {post.description || "No description provided."}
              </ReactMarkdown>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
             <h2 className="text-2xl font-semibold text-slate-700 mb-3 flex items-center">
                <ChatBubbleBottomCenterTextIcon className="h-6 w-6 mr-2 text-secondary"/> Comments
            </h2>
            <p className="text-neutral">Comments feature is not yet implemented.</p>
            {/* TODO: Implement comments section with API: fetch comments, display, form to add new comment */}
          </div>

        </div>

        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-3xl font-bold text-slate-800 mb-3">{post.title}</h1>
            
            <Link to={`${ROUTE_PATHS.PROFILE}/${post.uploader.id}`} className="flex items-center space-x-3 mb-4 group">
              <img src={post.uploader.profileImageUrl} alt={post.uploader.username} className="h-12 w-12 rounded-full border-2 border-transparent group-hover:border-primary transition-colors" />
              <div>
                <p className="text-md font-semibold text-slate-700 group-hover:text-primary transition-colors">{post.uploader.username}</p>
                <p className="text-xs text-neutral">Uploader</p>
              </div>
            </Link>

            <div className="space-y-2 text-sm text-slate-600 border-t pt-4">
              <p className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-neutral" /> Climbed: {new Date(post.climbDate).toLocaleDateString()}</p>
              <p className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-2 text-neutral" /> Uploaded: {new Date(post.uploadDate).toLocaleDateString()}</p>
              {post.gym && (
                <p className="flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-neutral" /> Gym: 
                  <span className="ml-1 text-primary">{post.gym.name}</span>
                  {/* <Link to={`#`} className="ml-1 text-primary hover:underline">{post.gym.name}</Link>  // Future: Link to gym page */}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-slate-700 mb-3">Stats & Actions</h3>
            <div className="flex items-center justify-around text-neutral mb-4">
              <span className="flex items-center text-sm"><EyeIcon className="h-5 w-5 mr-1.5 text-secondary" /> {post.views.toLocaleString()} Views</span>
              <span className="flex items-center text-sm">
                 {isLikedByCurrentUser ? 
                    <SolidHandThumbUpIcon className="h-5 w-5 mr-1.5 text-red-500" /> : 
                    <OutlineHandThumbUpIcon className="h-5 w-5 mr-1.5 text-secondary" />
                 } 
                {post.likes.toLocaleString()} Likes
              </span>
            </div>
            <div className="flex space-x-2">
                {isAuthenticated && (
                <Button 
                    onClick={handleLikeToggle} 
                    variant={isLikedByCurrentUser ? "danger" : "primary"}
                    className="flex-1"
                    leftIcon={isLikedByCurrentUser ? <SolidHandThumbUpIcon className="h-5 w-5" /> : <OutlineHandThumbUpIcon className="h-5 w-5" />}
                >
                    {isLikedByCurrentUser ? 'Unlike' : 'Like'}
                </Button>
                )}
                {isAuthenticated && (
                    <Button
                        onClick={handleBookmarkToggle}
                        variant={isBookmarkedByCurrentUser ? "secondary" : "outline"}
                        className="flex-1"
                        leftIcon={isBookmarkedByCurrentUser ? <SolidBookmarkIcon className="h-5 w-5" /> : <OutlineBookmarkIcon className="h-5 w-5" />}
                    >
                        {isBookmarkedByCurrentUser ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                )}
            </div>
            {!isAuthenticated && (
                 <Button 
                    onClick={() => navigate(ROUTE_PATHS.LOGIN)} 
                    variant="outline"
                    className="w-full mt-2"
                    leftIcon={<OutlineHandThumbUpIcon className="h-5 w-5" />}
                >
                    Log in to Like/Bookmark
                </Button>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center"><TagIcon className="h-5 w-5 mr-2 text-neutral"/>Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default VideoPostDetailsPage;
