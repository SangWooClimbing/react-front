
import React from 'react';
import GymCarousel from '../components/gym/GymCarousel';
import VideoFeed from '../components/video/VideoFeed';
import { mockGyms, mockVideoPosts } from '../utils/mockData';
import { UserCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS, MOCK_USER_ID } from '../constants';

const HomePage: React.FC = () => {
  // Simulate loading state for sections if needed
  // const [loadingGyms, setLoadingGyms] = React.useState(true);
  // React.useEffect(() => { setTimeout(() => setLoadingGyms(false), 500)}, []);

  return (
    <div className="space-y-12">
      {/* Hero/Welcome Section (Optional) */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome to ClimbLog!</h1>
        <p className="text-lg mb-4">Discover new gyms, track your progress, and share your climbs.</p>
        <div className="flex space-x-4">
           <Link to={`${ROUTE_PATHS.PROFILE}/${MOCK_USER_ID}`} className="bg-white text-primary font-semibold py-2 px-4 rounded-md hover:bg-slate-100 transition-colors flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2" /> My Profile
          </Link>
           {/* FIX: Changed ROUTE_PATHS.SEARCH to ROUTE_PATHS.SEARCH_RESULTS */}
           <Link to={ROUTE_PATHS.SEARCH_RESULTS} className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" /> Explore Gyms
          </Link>
        </div>
      </section>
      
      {/* Featured Gyms Carousel */}
      <section>
        <GymCarousel gyms={mockGyms} title="Featured Climbing Gyms" />
      </section>

      {/* Recommended Videos Feed */}
      <section>
        <VideoFeed initialVideos={mockVideoPosts.slice(0,4)} title="Recommended Videos" />
      </section>
    </div>
  );
};

export default HomePage;