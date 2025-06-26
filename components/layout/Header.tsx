
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS, APP_LOGO_TEXT, MOCK_USER_ID, APP_LOGO_URL } from '../../constants';
import { UserIcon, BellIcon, VideoCameraIcon, MagnifyingGlassIcon, ArrowLeftOnRectangleIcon, CogIcon, ShoppingBagIcon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import AdvancedSearchForm from './AdvancedSearchForm'; // New component
import { useCartStore } from '../../stores/cartStore'; // Import cart store

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
  
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Simulate authentication state
  const isAuthenticated = true; 

  const cartItemCount = useCartStore(state => state.getItemCount()); // Get cart item count

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== '') {
      setIsSearchDropdownOpen(true); // Open dropdown on typing
    } else {
      // setIsSearchDropdownOpen(false); // Optionally close if input is empty
    }
  };
  
  const handleSearchFocus = () => {
    setIsSearchDropdownOpen(true);
  };

  const handleLogout = () => {
    console.log("User logged out");
    setIsProfileDropdownOpen(false);
    alert("Logout functionality placeholder. In a real app, this would clear auth state and redirect.");
    // navigate(ROUTE_PATHS.LOGIN); // This would ideally be handled by global auth state updating App.tsx
  };

  const closeSearchDropdown = () => {
    setIsSearchDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={ROUTE_PATHS.HOME} className="text-2xl font-bold text-primary hover:text-blue-400 transition-colors flex items-center">
          <img src={APP_LOGO_URL} alt={APP_LOGO_TEXT} className="h-8 w-auto mr-2 rounded-sm" />
          {APP_LOGO_TEXT}
        </Link>

        {/* Search Bar Area */}
        <div className="flex-grow max-w-xl mx-4 relative" ref={searchDropdownRef}>
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
              placeholder="Search climbs, gyms, gear..."
              className="w-full py-2 px-4 pr-10 rounded-full bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-slate-600 outline-none transition-colors"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          
          {isSearchDropdownOpen && (
            <div className="absolute top-full mt-2 w-full lg:w-[500px] bg-white text-slate-800 rounded-lg shadow-2xl p-4 z-30 right-0 lg:right-auto lg:left-0">
               <button 
                  onClick={closeSearchDropdown} 
                  className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
                  aria-label="Close search filters"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              <AdvancedSearchForm initialQuery={searchTerm} onSearchSubmit={() => {
                setIsSearchDropdownOpen(false);
                setSearchTerm(''); // Clear search term after navigating via AdvancedSearchForm
              }} />
            </div>
          )}
        </div>

        {/* Navigation and Profile */}
        <nav className="flex items-center space-x-3 md:space-x-5">
          {isAuthenticated ? (
            <>
              <Link to={ROUTE_PATHS.UPLOAD} title="Upload Video" className="hover:text-primary transition-colors p-1">
                <VideoCameraIcon className="h-7 w-7" />
              </Link>
              <Link to={ROUTE_PATHS.STORE} title="Store" className="relative hover:text-primary transition-colors p-1">
                <ShoppingBagIcon className="h-7 w-7" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link to={ROUTE_PATHS.NOTIFICATIONS} title="Notifications" className="relative hover:text-primary transition-colors p-1">
                <BellIcon className="h-7 w-7" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </Link>
              <div className="relative" ref={profileDropdownRef}>
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="focus:outline-none">
                  <img 
                    src={`https://picsum.photos/seed/${MOCK_USER_ID}/40/40`} 
                    alt="Profile" 
                    className="h-9 w-9 rounded-full border-2 border-primary hover:border-blue-400 transition-colors"
                  />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-slate-700">
                    <Link
                      to={`${ROUTE_PATHS.PROFILE}/${MOCK_USER_ID}`}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                     <Link
                      to={ROUTE_PATHS.USER_VIDEOS(MOCK_USER_ID)}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      My Climbs
                    </Link>
                    <Link
                      to={ROUTE_PATHS.SETTINGS}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <CogIcon className="h-5 w-5 inline mr-2" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm hover:bg-slate-100 text-red-600"
                    >
                     <ArrowLeftOnRectangleIcon className="h-5 w-5 inline mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to={ROUTE_PATHS.LOGIN} className="bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center">
              <UserIcon className="h-5 w-5 mr-2" /> Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;