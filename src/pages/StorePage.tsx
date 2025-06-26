
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StoreItem, User } from '../types';
import StoreItemCard from '../components/store/StoreItemCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { TagIcon, ShoppingBagIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { STORE_CATEGORIES } from '../constants';

interface StorePageProps {
    loggedInUserId: string | null;
}

const StorePage: React.FC<StorePageProps> = ({ loggedInUserId }) => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StoreItem['category'] | 'All'>('All');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`/api${url}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }, []);

  useEffect(() => {
    const loadStoreData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const itemsPromise = fetchApi('/store/items'); // Adjust API endpoint
        const userPromise = loggedInUserId ? fetchApi(`/users/${loggedInUserId}`) : Promise.resolve(null);
        
        const [itemsResponse, userResponse] = await Promise.all([itemsPromise, userPromise]);
        
        setItems(itemsResponse?.data || []);
        setCurrentUser(userResponse?.data || null);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load store data');
        console.error("Store page data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoreData();
  }, [loggedInUserId, fetchApi]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleSellItemClick = () => {
    if (!loggedInUserId) {
        alert("Please log in to sell items.");
        return;
    }
    if (currentUser?.isCertifiedSeller) {
        alert("Navigate to 'Sell Item' form (Not Implemented)");
        // navigate(ROUTE_PATHS.SELL_ITEM_FORM); // Example route
    } else {
        alert("Only certified sellers can list items. Contact support to get certified.");
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto">
        <LoadingSpinner message="Loading store items..." size="lg" />
      </div>
    );
  }
   if (error) {
    return <div className="container mx-auto py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
            <ShoppingBagIcon className="h-10 w-10 text-primary mr-3"/>
            <h1 className="text-4xl font-bold text-slate-800">Climbing Gear Store</h1>
        </div>
        {loggedInUserId && (
             <Button 
                onClick={handleSellItemClick} 
                variant="primary" 
                leftIcon={<PlusCircleIcon className="h-5 w-5"/>}
                disabled={!currentUser && !!loggedInUserId} // Disable if logged in but user details still loading
            >
                {currentUser?.isCertifiedSeller ? "Sell Your Gear" : "Become a Seller"}
            </Button>
        )}
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <Button
            variant={selectedCategory === 'All' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </Button>
          {STORE_CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <StoreItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TagIcon className="h-20 w-20 text-slate-300 mx-auto mb-4" />
          <p className="text-xl text-slate-500">
            No items found in "{selectedCategory}".
          </p>
          {selectedCategory !== 'All' && (
             <Button variant="outline" onClick={() => setSelectedCategory('All')} className="mt-4">
                Show All Categories
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StorePage;
