
import React from 'react';
import { Gym } from '../../types';
import { MapPinIcon, GlobeAltIcon, UserGroupIcon, StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { BookmarkIcon as OutlineBookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/react/24/solid';

interface GymCardProps {
  gym: Gym;
  isAuthenticated: boolean;
  onBookmarkToggle: (gymId: string, isCurrentlyBookmarked: boolean) => void;
}

const GymCard: React.FC<GymCardProps> = ({ gym, isAuthenticated, onBookmarkToggle }) => {
  const dailyUsersToday = gym.stats.dailyUserCounts[new Date().toISOString().split('T')[0]] || 0;
  const loggedInUserId = localStorage.getItem('userId');
  const isBookmarkedByCurrentUser = !!(isAuthenticated && loggedInUserId && gym.bookmarkedByUsers?.includes(loggedInUserId));

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    if (!isAuthenticated) {
      alert("Please log in to bookmark gyms.");
      return;
    }
    onBookmarkToggle(gym.id, isBookmarkedByCurrentUser);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-80 md:w-96 flex-shrink-0 transform hover:scale-105 transition-transform duration-300 ease-in-out relative"
      role="article"
      aria-labelledby={`gymcard-name-${gym.id}`}
    >
      {isAuthenticated && (
        <button
          onClick={handleBookmarkClick}
          className={`absolute top-3 right-3 z-10 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors`}
          aria-label={isBookmarkedByCurrentUser ? "Remove bookmark from this gym" : "Add bookmark to this gym"}
          title={isBookmarkedByCurrentUser ? "Remove bookmark" : "Add bookmark"}
        >
          {isBookmarkedByCurrentUser ? <SolidBookmarkIcon className="h-5 w-5 text-accent" /> : <OutlineBookmarkIcon className="h-5 w-5" />}
        </button>
      )}
      <img className="w-full h-40 object-cover" src={gym.coverImageUrl} alt={`${gym.name} cover`} />
      <div className="p-5">
        <div className="flex items-center mb-3">
          <img src={gym.logoUrl} alt={`${gym.name} logo`} className="h-12 w-12 rounded-full border-2 border-primary mr-3"/>
          <div>
            {/* In a real app, this might be a Link to a gym detail page */}
            <h3 id={`gymcard-name-${gym.id}`} className="text-xl font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer">{gym.name}</h3>
            <p className="text-sm text-neutral flex items-center"><MapPinIcon className="h-4 w-4 mr-1 text-secondary" />{gym.location}</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-3 h-16 overflow-y-auto">{gym.description}</p>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-slate-700">
            <SolidStarIcon className="h-5 w-5 mr-2 text-accent" /> 
            <span>Avg. Rating: {gym.stats.averageRating}/5</span>
          </div>
           <div className="flex items-center text-slate-700">
            <UserGroupIcon className="h-5 w-5 mr-2 text-secondary" />
            <span>Climbers Today (Est.): {dailyUsersToday}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {gym.website && (
            <a
              href={gym.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <GlobeAltIcon className="h-4 w-4 mr-1.5" /> Website
            </a>
          )}
          {gym.instagramId && (
            <a
              href={`https://instagram.com/${gym.instagramId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-pink-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802C8.865 3.965 8.533 3.975 7.301 4.031c-2.815.128-4.201 1.507-4.328 4.328C2.916 9.586 2.906 9.918 2.906 12c0 2.082.01 2.414.066 3.646.127 2.822 1.514 4.201 4.328 4.328 1.232.056 1.564.066 4.699.066 3.136 0 3.467-.01 4.699-.066 2.815-.127 4.201-1.506 4.328-4.328.056-1.232.066-1.564.066-4.699 0-2.082-.01-2.414-.066-3.646-.127-2.821-1.514-4.201-4.328-4.328C15.467 3.975 15.136 3.965 12 3.965zm0 3.388c-2.401 0-4.363 1.962-4.363 4.363s1.962 4.363 4.363 4.363 4.363-1.962 4.363-4.363-1.962-4.363-4.363-4.363zm0 7.227c-1.583 0-2.864-1.281-2.864-2.864s1.281-2.864 2.864-2.864 2.864 1.281 2.864 2.864-1.281 2.864-2.864 2.864zm4.908-7.565c-.767 0-1.388.622-1.388 1.389s.621 1.389 1.388 1.389 1.388-.622 1.388-1.389-.621-1.389-1.388-1.389z"></path></svg>
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymCard;
