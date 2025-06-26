
import React from 'react';
import { Gym } from '../../types';
import GymCard from './GymCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../ui/LoadingSpinner';

interface GymCarouselProps {
  gyms: Gym[];
  title: string;
  isAuthenticated: boolean;
  onBookmarkToggle: (gymId: string, isCurrentlyBookmarked: boolean) => void;
  isLoading?: boolean;
}

const GymCarousel: React.FC<GymCarouselProps> = ({ gyms, title, isAuthenticated, onBookmarkToggle, isLoading }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
        <LoadingSpinner message="Loading gyms..." />
      </div>
    )
  }

  if (!gyms || gyms.length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
        <p className="text-slate-600">No gyms available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="my-8 relative">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
      <div className="relative">
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200 -ml-4 disabled:opacity-50"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-6 w-6 text-primary" />
        </button>
        <div 
          ref={scrollContainerRef} 
          className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {gyms.map((gym) => (
            <div key={gym.id} style={{ scrollSnapAlign: 'start' }} className="flex-shrink-0">
              <GymCard 
                gym={gym} 
                isAuthenticated={isAuthenticated} 
                onBookmarkToggle={onBookmarkToggle} 
              />
            </div>
          ))}
        </div>
        <button 
          onClick={() => scroll('right')} 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors duration-200 -mr-4 disabled:opacity-50"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-6 w-6 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default GymCarousel;
