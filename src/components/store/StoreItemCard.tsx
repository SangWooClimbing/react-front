import React from 'react';
import { StoreItem } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants';
import { TagIcon, UserCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import Button from '../ui/Button';

interface StoreItemCardProps {
  item: StoreItem;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item }) => {
  const itemDetailUrl = ROUTE_PATHS.STORE_ITEM(item.id);
  const primaryImage = item.images && item.images.length > 0 ? item.images[0] : null;
  const displayImageUrl = primaryImage?.thumbnailUrl || primaryImage?.url || 'https://picsum.photos/seed/placeholder/400/300'; // Fallback image

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <Link to={itemDetailUrl} className="block aspect-[4/3] overflow-hidden bg-slate-200">
        <img 
            src={displayImageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/placeholder_err/400/300')} // Fallback on error
        />
      </Link>

      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
            <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
                {item.category}
            </span>
            {item.condition && (
                 <span className="ml-2 inline-block bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.condition}
                </span>
            )}
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate">
          <Link to={itemDetailUrl} className="hover:text-primary transition-colors">{item.name}</Link>
        </h3>
        
        {item.brand && <p className="text-xs text-neutral mb-2">Brand: {item.brand}</p>}
        
        {/* Simplified description for card view, full markdown on detail page */}
        <p className="text-sm text-slate-600 mb-3 h-12 overflow-hidden"> 
            {item.description.split('\n')[0].replace(/###\s*/, '').substring(0, 100) + (item.description.length > 100 ? '...' : '')}
        </p>
        
        <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-bold text-primary">
                    {item.currency === 'USD' && '$'}{item.price.toFixed(2)}
                </p>
            </div>

            <Link to={ROUTE_PATHS.PROFILE + `/${item.seller.id}`} className="flex items-center text-xs text-neutral mb-2 hover:underline">
              <img src={item.seller.profileImageUrl || `https://ui-avatars.com/api/?name=${item.seller.username.replace(/\s/g,'+')}&background=random`} alt={item.seller.username} className="h-5 w-5 rounded-full mr-1.5" />
              Sold by: {item.seller.username}
            </Link>
            <time dateTime={item.postedDate} className="text-xs text-neutral block mb-3">
                Listed: {new Date(item.postedDate).toLocaleDateString()}
            </time>

            <Link to={itemDetailUrl}>
                <Button variant="outline" size="sm" className="w-full">
                    View Details
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreItemCard;