import React, { useState, useRef, useEffect } from 'react';
import { VideoPost, MediaItem } from '../../types';
import { UserCircleIcon, MapPinIcon, TagIcon, EyeIcon, HandThumbUpIcon, PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon, VideoCameraIcon as SolidVideoCameraIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS, APP_LOGO_URL, APP_LOGO_TEXT } from '../../constants';

interface VideoCardProps {
  video: VideoPost; 
  autoPlayOnHover?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video: post, autoPlayOnHover = true }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false); 
  const [showMediaCounter, setShowMediaCounter] = useState(false);
  
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null); 
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const counterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMedia: MediaItem | undefined = post.media[currentMediaIndex];

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.5 } 
    );

    observer.observe(cardElement);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (mediaVideoRef.current && !mediaVideoRef.current.paused) {
        mediaVideoRef.current.pause();
      }
      if(counterTimeoutRef.current) clearTimeout(counterTimeoutRef.current);
    };
  }, [post.id]); 


  useEffect(() => {
    const videoElement = mediaVideoRef.current;
    if (!currentMedia || currentMedia.type !== 'video' || !autoPlayOnHover || !videoElement) {
      return;
    }

    if (isHovering && isIntersecting && !isMediaPlaying) {
      videoElement.muted = true;
      videoElement.play().then(() => setIsMediaPlaying(true)).catch(e => console.warn("Autoplay prevented:", e));
    } else if ((!isHovering || !isIntersecting) && isMediaPlaying) {
      videoElement.pause();
      setIsMediaPlaying(false);
    }
  }, [isHovering, isIntersecting, isMediaPlaying, autoPlayOnHover, currentMedia]);
  
  useEffect(() => { 
      setIsMediaPlaying(false);
      if (mediaVideoRef.current) {
          mediaVideoRef.current.pause();
          mediaVideoRef.current.currentTime = 0; 
      }
  }, [currentMediaIndex, post.id]);


  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoElement = mediaVideoRef.current;
    if (!videoElement || !currentMedia || currentMedia.type !== 'video') return;

    if (videoElement.paused) {
      videoElement.muted = false; // Unmute on manual play
      videoElement.play().then(() => setIsMediaPlaying(true));
    } else {
      videoElement.pause();
      setIsMediaPlaying(false);
    }
  };
  
  const handleCardClick = () => {
    // In a real app, navigate to a post detail page
    // navigate(`${ROUTE_PATHS.POST}/${post.id}`);
    alert(`Navigating to post: ${post.title}. Full post page/modal not implemented.`);
  };

  const changeMedia = (direction: 'next' | 'prev') => {
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

  if (!currentMedia) { 
      return <div className="p-4 text-red-500">Error: Post has no media.</div>
  }


  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transform hover:shadow-2xl transition-shadow duration-300"
      onMouseEnter={() => autoPlayOnHover && setIsHovering(true)}
      onMouseLeave={() => autoPlayOnHover && setIsHovering(false)}
    >
      <div className="relative group cursor-pointer aspect-video bg-slate-800" onClick={handleCardClick}>
        <img 
            src={APP_LOGO_URL} 
            alt={`${APP_LOGO_TEXT} logo`} 
            className="absolute top-2 left-2 h-5 w-auto z-30 opacity-70 rounded-sm"
        />

        {currentMedia.type === 'video' ? (
          <video
            ref={mediaVideoRef}
            key={currentMedia.id} // Important for React to re-render video element on media change
            src={currentMedia.url}
            poster={currentMedia.thumbnailUrl}
            className="w-full h-full object-cover"
            loop
            muted={!isMediaPlaying} 
            onPlay={() => setIsMediaPlaying(true)}
            onPause={() => setIsMediaPlaying(false)}
            onClick={handlePlayPauseClick} // Allow clicking video to play/pause
            playsInline // Essential for iOS
          />
        ) : ( 
          <img 
            src={currentMedia.url} 
            alt={`${post.title} - media ${currentMediaIndex + 1}`} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        )}
        
        {/* Fallback video ref for IntersectionObserver if first media is video but not playing, ensures observer setup correctly */}
        {currentMedia.type === 'video' && !isMediaPlaying && (!isHovering || !isIntersecting) && (
            <video ref={mediaVideoRef} src={currentMedia.url} className="hidden" playsInline />
        )}

        {currentMedia.type === 'video' && isHovering && (
          <button
            onClick={handlePlayPauseClick}
            className="absolute inset-0 flex items-center justify-center w-full h-full z-10 bg-black bg-opacity-0 focus:outline-none"
            aria-label={isMediaPlaying ? "Pause video" : "Play video"}
          >
            {isMediaPlaying ? (
              <PauseIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
            ) : (
              <PlayIcon className="h-16 w-16 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
            )}
          </button>
        )}

        {post.media.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); changeMedia('prev'); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
              aria-label="Previous media"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); changeMedia('next'); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
              aria-label="Next media"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
        
        {post.media.length > 1 && showMediaCounter && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-20 animate-fadeInOut">
                {currentMediaIndex + 1} / {post.media.length}
            </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center space-x-1 z-20">
            {currentMedia.type === 'image' && <PhotoIcon className="h-4 w-4 text-white bg-black/40 rounded-sm p-0.5" />}
            {currentMedia.type === 'video' && <SolidVideoCameraIcon className="h-4 w-4 text-white bg-black/40 rounded-sm p-0.5" />}
            {post.gym && (
              <span className="bg-primary/80 text-white text-xs px-2 py-0.5 rounded">
                {post.gym.name}
              </span>
            )}
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate hover:text-primary transition-colors">
          <span onClick={handleCardClick} className="cursor-pointer">{post.title}</span>
        </h3>
        
        <Link to={ROUTE_PATHS.PROFILE + `/${post.uploader.id}`} className="flex items-center text-sm text-neutral mb-2 hover:underline">
          <img src={post.uploader.profileImageUrl} alt={post.uploader.username} className="h-6 w-6 rounded-full mr-2" />
          {post.uploader.username}
        </Link>

        <p className="text-sm text-slate-600 mb-3 h-12 overflow-hidden">{post.description}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-block bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && <span className="text-xs text-neutral">+{post.tags.length-3} more</span>}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-center text-sm text-neutral">
          <div className="flex items-center space-x-3">
            <span className="flex items-center" title="Views"><EyeIcon className="h-4 w-4 mr-1 text-secondary" /> {post.views.toLocaleString()}</span>
            <span className="flex items-center" title="Likes"><HandThumbUpIcon className="h-4 w-4 mr-1 text-secondary" /> {post.likes.toLocaleString()}</span>
          </div>
          <time dateTime={post.climbDate} className="text-xs">Climbed: {new Date(post.climbDate).toLocaleDateString()}</time>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;