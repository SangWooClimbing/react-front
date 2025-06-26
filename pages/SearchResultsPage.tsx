import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gym, VideoPost, StoreItem, DifficultyGrade, isGym, isVideoPost, isStoreItem, SearchResultItem } from '../types';
import { mockGyms, mockVideoPosts, mockStoreItems } from '../utils/mockData';
import GymCard from '../components/gym/GymCard';
import VideoCard from '../components/video/VideoCard';
import StoreItemCard from '../components/store/StoreItemCard'; 
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'gyms' | 'store'>('all');


  const query = useMemo(() => searchParams.get('q')?.toLowerCase() || '', [searchParams]);
  const type = useMemo(() => searchParams.get('type') as 'videos' | 'gyms' | 'store' | 'all' || 'all', [searchParams]);
  const location = useMemo(() => searchParams.get('loc')?.toLowerCase() || '', [searchParams]);
  const gymName = useMemo(() => searchParams.get('gym')?.toLowerCase() || '', [searchParams]);
  const difficulty = useMemo(() => searchParams.get('diff') as DifficultyGrade | '' || '', [searchParams]);
  const category = useMemo(() => searchParams.get('cat')?.toLowerCase() || '', [searchParams]);


  useEffect(() => {
    setIsLoading(true);
    setActiveTab(type === 'all' ? 'all' : type); 

    setTimeout(() => {
      let combinedResults: SearchResultItem[] = [];

      if (type === 'all' || type === 'videos') {
        const filteredVideos = mockVideoPosts.filter(video => {
          const queryMatch = query ? video.title.toLowerCase().includes(query) || video.description.toLowerCase().includes(query) || video.tags.some(t => t.toLowerCase().includes(query)) : true;
          const gymNameMatch = gymName ? video.gym?.name.toLowerCase().includes(gymName) : true;
          const difficultyMatch = difficulty ? video.tags.includes(difficulty) : true;
          const locationMatch = location && video.gym ? video.gym.location.toLowerCase().includes(location) : !location;
          // Date filtering for videos (climbDate) could be added here if needed
          // const dateMatch = dateFilter ? video.climbDate === dateFilter : true;
          return queryMatch && gymNameMatch && difficultyMatch && locationMatch;
        });
        combinedResults.push(...filteredVideos);
      }

      if (type === 'all' || type === 'gyms') {
        const filteredGyms = mockGyms.filter(gym => {
          const queryMatch = query ? gym.name.toLowerCase().includes(query) || gym.description.toLowerCase().includes(query) : true;
          const locationMatch = location ? gym.location.toLowerCase().includes(location) : true;
          const gymNameMatch = gymName ? gym.name.toLowerCase().includes(gymName) : true;
          return queryMatch && locationMatch && gymNameMatch;
        });
        combinedResults.push(...filteredGyms);
      }

      if (type === 'all' || type === 'store') {
        const filteredStoreItems = mockStoreItems.filter(item => {
          const queryMatch = query ? item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || (item.brand && item.brand.toLowerCase().includes(query)) : true;
          const categoryMatch = category ? item.category.toLowerCase() === category : true;
          return queryMatch && categoryMatch;
        });
        combinedResults.push(...filteredStoreItems);
      }
      
      if (type === 'all') {
        combinedResults.sort((a, b) => {
            if (isVideoPost(a) && !isVideoPost(b)) return -1;
            if (!isVideoPost(a) && isVideoPost(b)) return 1;
            if (isGym(a) && !isGym(b) && !isVideoPost(b)) return -1;
            if (!isGym(a) && !isVideoPost(a) && isGym(b)) return 1;
            // Sort by date for items of same type, newest first if applicable
            const dateA = (a as VideoPost).uploadDate || (a as StoreItem).postedDate;
            const dateB = (b as VideoPost).uploadDate || (b as StoreItem).postedDate;
            if (dateA && dateB) return new Date(dateB).getTime() - new Date(dateA).getTime();
            return 0;
        });
      }


      setResults(combinedResults);
      setIsLoading(false);
    }, 700);
  }, [query, type, location, gymName, difficulty, category]);
  
  const getFilteredResultsByTab = () => {
    if (activeTab === 'videos') return results.filter(isVideoPost);
    if (activeTab === 'gyms') return results.filter(isGym);
    if (activeTab === 'store') return results.filter(isStoreItem);
    return results;
  };

  const displayedResults = getFilteredResultsByTab();
  
  const resultCounts = useMemo(() => ({
    videos: results.filter(isVideoPost).length,
    gyms: results.filter(isGym).length,
    store: results.filter(isStoreItem).length,
  }), [results]);


  const renderTabs = () => {
    if (type !== 'all' && results.filter(item => 
        (type === 'videos' && isVideoPost(item)) ||
        (type === 'gyms' && isGym(item)) ||
        (type === 'store' && isStoreItem(item))
      ).length === results.length ) return null; // Don't show tabs if only one type was specifically requested and all results are that type
      
    if (results.length === 0) return null;


    const TABS: { key: 'all' | 'videos' | 'gyms' | 'store'; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: results.length},
        ...(resultCounts.videos > 0 ? [{ key: 'videos' as const, label: 'Climbs', count: resultCounts.videos }] : []),
        ...(resultCounts.gyms > 0 ? [{ key: 'gyms' as const, label: 'Gyms', count: resultCounts.gyms }] : []),
        ...(resultCounts.store > 0 ? [{ key: 'store' as const, label: 'Store', count: resultCounts.store }] : []),
    ];
    
    const availableResultTypes = (resultCounts.videos > 0 ? 1:0) + (resultCounts.gyms > 0 ? 1:0) + (resultCounts.store > 0 ? 1:0);
    if (availableResultTypes <=1 && results.length > 0 && type === 'all') return null;


    return (
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.filter(t => t.key === 'all' || t.count > 0).map(tab => ( // Only show tabs with content, or 'all'
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>
    );
  };


  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Search Results</h1>
      <p className="text-neutral mb-6">
        {query ? `Showing results for "${query}"` : "Showing all items based on filters."}
        {` (${results.length} total)`}
      </p>
      
      {renderTabs()}

      {isLoading && <LoadingSpinner message="Searching..." />}

      {!isLoading && (
        <div>
          {displayedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedResults.map(item => {
                if (isGym(item)) {
                  return <GymCard key={`gym-${item.id}`} gym={item} />;
                }
                if (isVideoPost(item)) {
                  return <VideoCard key={`video-${item.id}`} video={item} />;
                }
                if (isStoreItem(item)) {
                  return <StoreItemCard key={`store-${item.id}`} item={item} />;
                }
                return null;
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <MagnifyingGlassIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No results found for your criteria. Try adjusting your search in the header.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
