import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gym, VideoPost, StoreItem, DifficultyGrade, isGym, isVideoPost, isStoreItem, SearchResultItem } from '../types';
import GymCard from '../components/gym/GymCard';
import VideoCard from '../components/video/VideoCard';
import StoreItemCard from '../components/store/StoreItemCard'; 
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchResultsPageProps {
  isAuthenticated: boolean;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ isAuthenticated }) => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'gyms' | 'store'>('all');
  const loggedInUserId = localStorage.getItem('userId');

  const queryParams = useMemo(() => ({
    query: searchParams.get('q')?.toLowerCase() || '',
    typeFilter: searchParams.get('type') as 'videos' | 'gyms' | 'store' | 'all' || 'all',
    location: searchParams.get('loc')?.toLowerCase() || '',
    gymName: searchParams.get('gym')?.toLowerCase() || '',
    difficulty: searchParams.get('diff') as DifficultyGrade | '' || '',
    category: searchParams.get('cat')?.toLowerCase() || '',
  }), [searchParams]);


  // TODO: This is a placeholder API fetch function. Replace with your actual API call.
  const fetchApi = useCallback(async (url: string, method: string = 'GET', body?: any) => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // All API calls are prefixed with /api. You might need to change this depending on your setup.
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
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      setActiveTab(queryParams.typeFilter === 'all' ? 'all' : queryParams.typeFilter); 

      const apiParams = new URLSearchParams();
      if (queryParams.query) apiParams.set('q', queryParams.query);
      if (queryParams.typeFilter !== 'all') apiParams.set('type', queryParams.typeFilter);
      if (queryParams.location) apiParams.set('loc', queryParams.location);
      if (queryParams.gymName) apiParams.set('gym', queryParams.gymName);
      if (queryParams.difficulty) apiParams.set('diff', queryParams.difficulty);
      if (queryParams.category) apiParams.set('cat', queryParams.category);
      
      try {
        // Assuming this is the correct endpoint for search.
        const response = await fetchApi(`/search?${apiParams.toString()}`);
        setResults(response?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch search results');
        console.error("Search API error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [queryParams, fetchApi]);
  

  const handleLikeToggle = async (postId: string, isCurrentlyLiked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
        alert("Please log in to like posts.");
        return;
    }
    try {
      // Assuming this is the correct endpoint for liking a video.
      await fetchApi(`/videos/${postId}/like`, 'POST');
      setResults(prevResults =>
        prevResults.map(item =>
          isVideoPost(item) && item.id === postId
            ? { ...item, 
                likedByUsers: isCurrentlyLiked
                  ? item.likedByUsers.filter(id => id !== loggedInUserId) 
                  : [...(item.likedByUsers || []), loggedInUserId],
                likes: isCurrentlyLiked ? item.likes -1 : item.likes + 1
              }
            : item
        )
      );
    } catch (err) { console.error("Like toggle error:", err); alert(`Error updating like: ${err instanceof Error ? err.message : 'Unknown error'}`);}
  };

  const handleVideoBookmarkToggle = async (postId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
        alert("Please log in to bookmark posts.");
        return;
    }
    try {
      // Assuming this is the correct endpoint for bookmarking a video.
      await fetchApi(`/videos/${postId}/bookmark`, 'POST');
      setResults(prevResults =>
        prevResults.map(item =>
          isVideoPost(item) && item.id === postId
            ? { ...item, 
                bookmarkedByUsers: isCurrentlyBookmarked 
                ? item.bookmarkedByUsers.filter(id => id !== loggedInUserId) 
                : [...(item.bookmarkedByUsers || []), loggedInUserId] }
            : item
        )
      );
    } catch (err) { console.error("Video bookmark toggle error:", err); alert(`Error updating video bookmark: ${err instanceof Error ? err.message : 'Unknown error'}`);}
  };

  const handleGymBookmarkToggle = async (gymId: string, isCurrentlyBookmarked: boolean) => {
    if (!isAuthenticated || !loggedInUserId) {
        alert("Please log in to bookmark gyms.");
        return;
    }
    try {
      // Assuming this is the correct endpoint for bookmarking a gym.
      await fetchApi(`/gyms/${gymId}/bookmark`, 'POST');
       setResults(prevResults =>
        prevResults.map(item =>
          isGym(item) && item.id === gymId
            ? { ...item, 
                bookmarkedByUsers: isCurrentlyBookmarked 
                ? item.bookmarkedByUsers.filter(id => id !== loggedInUserId) 
                : [...(item.bookmarkedByUsers || []), loggedInUserId] }
            : item
        )
      );
    } catch (err) { console.error("Gym bookmark toggle error:", err); alert(`Error updating gym bookmark: ${err instanceof Error ? err.message : 'Unknown error'}`);}
  };

  const getFilteredResultsByTab = () => {
    if (activeTab === 'videos') return results.filter(isVideoPost);
    if (activeTab === 'gyms') return results.filter(isGym);
    if (activeTab === 'store') return results.filter(isStoreItem);
    return results;
  };

  const displayedResults = getFilteredResultsByTab();
  
  const resultCounts = useMemo(() => ({
    all: results.length,
    videos: results.filter(isVideoPost).length,
    gyms: results.filter(isGym).length,
    store: results.filter(isStoreItem).length,
  }), [results]);


  const renderTabs = () => {
    if (isLoading || error) return null;
    if (resultCounts.all === 0) return null;

    const showTabsCondition = queryParams.typeFilter === 'all' || 
                             (resultCounts.videos > 0 && resultCounts.gyms > 0) ||
                             (resultCounts.videos > 0 && resultCounts.store > 0) ||
                             (resultCounts.gyms > 0 && resultCounts.store > 0);
    if (!showTabsCondition && resultCounts.all > 0) return null;


    const TABS_CONFIG = [
        { key: 'all' as const, label: 'All', count: resultCounts.all},
        { key: 'videos' as const, label: 'Climbs', count: resultCounts.videos },
        { key: 'gyms' as const, label: 'Gyms', count: resultCounts.gyms },
        { key: 'store' as const, label: 'Store', count: resultCounts.store },
    ];
    
    const availableTabs = TABS_CONFIG.filter(tab => (tab.key === 'all' && resultCounts.all > 0) || (tab.key !== 'all' && tab.count > 0) );
    if (availableTabs.length <= 1 && queryParams.typeFilter === 'all') return null; // Also hide if only "All" tab would be shown after filtering


    return (
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {availableTabs.map(tab => (
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
        {queryParams.query ? `Showing results for "${queryParams.query}"` : "Showing items based on filters."}
        {!isLoading && !error && ` (${resultCounts.all} total)`}
      </p>
      
      {renderTabs()}

      {isLoading && <LoadingSpinner message="Searching..." />}
      {error && <p className="text-red-500 text-center py-6 bg-red-50 p-3 rounded-md">{error}</p>}

      {!isLoading && !error && (
        <div>
          {displayedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedResults.map(item => {
                if (isGym(item)) {
                  return (
                    <GymCard 
                      key={`gym-${item.id}`} 
                      gym={item} 
                      isAuthenticated={isAuthenticated}
                      onBookmarkToggle={handleGymBookmarkToggle}
                    />
                  );
                }
                if (isVideoPost(item)) {
                  return (
                    <VideoCard 
                      key={`video-${item.id}`} 
                      video={item} 
                      isAuthenticated={isAuthenticated}
                      onLikeToggle={handleLikeToggle}
                      onBookmarkToggle={handleVideoBookmarkToggle}
                    />
                  );
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
