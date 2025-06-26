
import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { ROUTE_PATHS } from '../constants';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <ExclamationTriangleIcon className="h-24 w-24 text-amber-500 mb-6" />
      <h1 className="text-5xl font-bold text-slate-800 mb-3">404 - Page Not Found</h1>
      <p className="text-xl text-neutral mb-8">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTE_PATHS.HOME}>
        <Button variant="primary" size="lg" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
    