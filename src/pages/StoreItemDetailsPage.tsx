
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { StoreItem, MediaItem } from '../types';
import { useCartStore } from '../stores/cartStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { ROUTE_PATHS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon, CheckCircleIcon, InformationCircleIcon, CogIcon } from '@heroicons/react/24/solid';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const StoreItemDetailsPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<StoreItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCartMessage, setAddedToCartMessage] = useState(false);

  const addItemToCart = useCartStore(state => state.addItem);
  const isItemInCart = useCartStore(state => state.isItemInCart);

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken'); // Though likely not needed for public item view
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
    if (!itemId) {
        setIsLoading(false);
        setError("Item ID is missing.");
        return;
    }
    const fetchItemDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchApi(`/store/items/${itemId}`); // Adjust API endpoint
        setItem(response?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item details');
        console.error(`Error fetching item ${itemId}:`, err);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId, fetchApi]);

  const handleAddToCart = () => {
    if (item) {
      addItemToCart(item, quantity);
      setAddedToCartMessage(true);
      setTimeout(() => setAddedToCartMessage(false), 2000);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!item) return;
    let maxQuantity = item.stock === undefined || item.stock === 0 ? 1 : item.stock;
    if (item.condition !== 'New' && item.stock === undefined) maxQuantity = 1;

    const val = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(val);
  };
  
  const currentImage: MediaItem | undefined = item?.images[selectedImageIndex];

  if (isLoading) {
    return <LoadingSpinner message="Loading item details..." size="lg" />;
  }
  if (error) {
    return (
      <div className="text-center py-10">
        <InformationCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-slate-700">Error Loading Item</h1>
        <p className="text-neutral mt-2">{error}</p>
        <Link to={ROUTE_PATHS.STORE}>
          <Button variant="primary" className="mt-6">Back to Store</Button>
        </Link>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="text-center py-10">
        <InformationCircleIcon className="h-16 w-16 text-neutral mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-slate-700">Item Not Found</h1>
        <p className="text-neutral mt-2">The item you're looking for doesn't exist or may have been removed.</p>
        <Link to={ROUTE_PATHS.STORE}>
          <Button variant="primary" className="mt-6">Back to Store</Button>
        </Link>
      </div>
    );
  }
  
  const itemStock = item.stock === undefined ? (item.condition === 'New' ? Infinity : 1) : item.stock;


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square bg-slate-100 rounded-lg shadow-md overflow-hidden">
            {item.images && item.images.length > 0 && currentImage ? (
              <img
                src={currentImage.url}
                alt={`${item.name} - image ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral">No Image Available</div>
            )}
             {item.images.length > 1 && (
                <>
                <button 
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon className="h-6 w-6"/>
                </button>
                <button 
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % item.images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition"
                    aria-label="Next image"
                >
                    <ChevronRightIcon className="h-6 w-6"/>
                </button>
                </>
            )}
          </div>
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {item.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition hover:opacity-80
                    ${selectedImageIndex === index ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img.thumbnailUrl || img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">{item.name}</h1>
          
          <div className="flex items-center space-x-2 text-sm text-neutral">
            <Link to={ROUTE_PATHS.PROFILE + `/${item.seller.id}`} className="flex items-center hover:underline">
              <img src={item.seller.profileImageUrl || `https://ui-avatars.com/api/?name=${item.seller.username.replace(/\s/g,'+')}&background=random`} alt={item.seller.username} className="h-6 w-6 rounded-full mr-2" />
              <span>Sold by {item.seller.username}</span>
            </Link>
            {item.seller.isCertifiedSeller && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Certified Seller</span>}
          </div>

          <p className="text-3xl font-bold text-primary">
            {item.currency === 'USD' ? '$' : item.currency}{item.price.toFixed(2)}
          </p>

          <div className="text-sm space-y-1 text-slate-600">
            {item.brand && <p><strong>Brand:</strong> {item.brand}</p>}
            {item.condition && <p><strong>Condition:</strong> {item.condition}</p>}
            <p><strong>Category:</strong> {item.category}</p>
            {itemStock > 0 && itemStock !== Infinity && <p className="text-green-600"><strong>Stock:</strong> {itemStock} available</p>}
            {itemStock === 0 && <p className="text-red-600 font-semibold">Out of Stock</p>}
          </div>
          
          {itemStock > 0 && (
             <div className="flex items-center space-x-3 pt-2">
                <label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity:</label>
                <input 
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                    min="1"
                    max={itemStock === Infinity ? undefined : itemStock}
                    className="w-20 p-2 border border-slate-300 rounded-md text-center focus:ring-primary focus:border-primary"
                    disabled={itemStock === 0 || (item.condition !== 'New' && item.stock === undefined) }
                    aria-label="Item quantity"
                />
             </div>
          )}


          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleAddToCart}
              leftIcon={addedToCartMessage ? <CheckCircleIcon className="h-5 w-5" /> : <ShoppingCartIcon className="h-5 w-5" />}
              className="w-full sm:w-auto flex-grow"
              disabled={itemStock === 0 || isItemInCart(item.id) || addedToCartMessage}
            >
              {addedToCartMessage ? 'Added to Cart!' : isItemInCart(item.id) ? 'Already in Cart' : 'Add to Cart'}
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => alert('Buy Now (Not Implemented)')} disabled={itemStock === 0}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Product Details</h2>
        <div className="prose prose-slate max-w-none prose-img:rounded-md prose-a:text-primary hover:prose-a:text-blue-700">
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {item.description}
          </ReactMarkdown>
        </div>

        {item.specs && Object.keys(item.specs).length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-neutral"/> Specifications
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-4 rounded-md">
              {Object.entries(item.specs).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
       <ReactTooltip id="tooltip" />
    </div>
  );
};

export default StoreItemDetailsPage;
