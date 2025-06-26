
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DifficultyGrade, StoreItem } from '../../types';
import { DIFFICULTY_LEVELS, ROUTE_PATHS, STORE_CATEGORIES } from '../../constants';
import Button from '../ui/Button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface AdvancedSearchFormProps {
  initialQuery?: string;
  onSearchSubmit: () => void;
}

interface SearchFilters {
  query: string;
  searchType: 'all' | 'videos' | 'gyms' | 'store';
  location: string;
  gymName: string;
  difficulty: DifficultyGrade | '';
  category: StoreItem['category'] | '';
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({ initialQuery = '', onSearchSubmit }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    searchType: 'all',
    location: '',
    gymName: '',
    difficulty: '',
    category: '',
  });
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);


  useEffect(() => {
    setFilters(prev => ({ ...prev, query: initialQuery }));
  }, [initialQuery]);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch('/api/gyms/locations'); // Adjust if API endpoint is different
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        setUniqueLocations(data.data || []);
      } catch (error) {
        console.error("Error fetching gym locations:", error);
        // Optionally set an error state to display to user
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const searchParams = new URLSearchParams();
    if (filters.query.trim()) searchParams.set('q', filters.query.trim());
    if (filters.searchType !== 'all') searchParams.set('type', filters.searchType);
    if (filters.location) searchParams.set('loc', filters.location);
    if (filters.gymName) searchParams.set('gym', filters.gymName);
    if (filters.difficulty) searchParams.set('diff', filters.difficulty);
    if (filters.category) searchParams.set('cat', filters.category);

    navigate(`${ROUTE_PATHS.SEARCH_RESULTS}?${searchParams.toString()}`);
    onSearchSubmit(); 
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label htmlFor="adv-query" className="block text-xs font-medium text-slate-600 mb-0.5">Keywords</label>
        <input
          type="text"
          name="query"
          id="adv-query"
          value={filters.query}
          onChange={handleInputChange}
          placeholder="Problem, gym, item name..."
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm"
        />
      </div>

      <div>
        <label htmlFor="adv-searchType" className="block text-xs font-medium text-slate-600 mb-0.5">Search For</label>
        <select
          name="searchType"
          id="adv-searchType"
          value={filters.searchType}
          onChange={handleInputChange}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm"
        >
          <option value="all">All Types</option>
          <option value="videos">Climbs (Videos)</option>
          <option value="gyms">Gyms</option>
          <option value="store">Store Items</option>
        </select>
      </div>

      {(filters.searchType === 'all' || filters.searchType === 'gyms' || filters.searchType === 'videos') && (
        <div>
          <label htmlFor="adv-location" className="block text-xs font-medium text-slate-600 mb-0.5">Location (Gyms/Climbs)</label>
          <select 
            name="location" 
            id="adv-location" 
            value={filters.location} 
            onChange={handleInputChange} 
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm"
            disabled={isLoadingLocations}
          >
            <option value="">Any Location</option>
            {isLoadingLocations && <option value="" disabled>Loading locations...</option>}
            {!isLoadingLocations && uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      )}
      
      {(filters.searchType === 'all' || filters.searchType === 'gyms' || filters.searchType === 'videos') && (
        <div>
          <label htmlFor="adv-gymName" className="block text-xs font-medium text-slate-600 mb-0.5">Gym Name (Climbs/Gyms)</label>
          <input type="text" name="gymName" id="adv-gymName" value={filters.gymName} onChange={handleInputChange} placeholder="e.g., The Crux" className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm" />
        </div>
      )}

      {(filters.searchType === 'all' || filters.searchType === 'videos') && (
        <div>
          <label htmlFor="adv-difficulty" className="block text-xs font-medium text-slate-600 mb-0.5">Difficulty (Climbs)</label>
          <select name="difficulty" id="adv-difficulty" value={filters.difficulty} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm">
            <option value="">Any Difficulty</option>
            {DIFFICULTY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      )}
      
      {(filters.searchType === 'all' || filters.searchType === 'store') && (
         <div>
          <label htmlFor="adv-category" className="block text-xs font-medium text-slate-600 mb-0.5">Store Category</label>
          <select name="category" id="adv-category" value={filters.category} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary text-sm">
            <option value="">Any Category</option>
            {STORE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full mt-3" size="md" leftIcon={<MagnifyingGlassIcon className="h-4 w-4"/>}>
        Apply Filters & Search
      </Button>
    </form>
  );
};

export default AdvancedSearchForm;
