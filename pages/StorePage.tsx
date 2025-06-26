
import React, { useState, useEffect, useMemo } from 'react';
import { StoreItem } from '../types';
import { mockStoreItems, mockUserProfile } from '../utils/mockData'; // Assuming mockUserProfile is logged in user
import StoreItemCard from '../components/store/StoreItemCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { TagIcon, ShoppingBagIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { STORE_CATEGORIES } from '../constants';


const StorePage: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<StoreItem['category'] | 'All'>('All');
  
  // Simulate fetching current user status
  const currentUser = mockUserProfile; // In a real app, this would come from auth context

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setItems(mockStoreItems.sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleSellItemClick = () => {
    if (currentUser.isCertifiedSeller) {
        alert("Navigate to 'Sell Item' form (TODO)");
        // Potentially navigate to a new page or open a modal form
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

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
            <ShoppingBagIcon className="h-10 w-10 text-primary mr-3"/>
            <h1 className="text-4xl font-bold text-slate-800">Climbing Gear Store</h1>
        </div>
        {currentUser.isCertifiedSeller && (
             <Button 
                onClick={handleSellItemClick} 
                variant="primary" 
                leftIcon={<PlusCircleIcon className="h-5 w-5"/>}
            >
                Sell Your Gear
            </Button>
        )}
      </div>

      {/* Category Filters */}
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
