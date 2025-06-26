
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import UploadPage from './pages/UploadPage';
import SearchResultsPage from './pages/SearchResultsPage'; // New
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import StorePage from './pages/StorePage'; // New
import StoreItemDetailsPage from './pages/StoreItemDetailsPage'; // Corrected path
import UserVideosPage from './pages/UserVideosPage'; // New
import SettingsPage from './pages/SettingsPage'; // New
import { ROUTE_PATHS } from './constants';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
  return children;
};

const App: React.FC = () => {
  // Simulate authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // Set to false to test login flow

  return (
    <HashRouter>
      <Routes>
        <Route 
          path={ROUTE_PATHS.LOGIN}
          element={isAuthenticated ? <Navigate to={ROUTE_PATHS.HOME} /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} 
        />
        
        <Route 
          path={ROUTE_PATHS.HOME}
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><HomePage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.NOTIFICATIONS}
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><NotificationsPage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.UPLOAD}
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><UploadPage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.SEARCH_RESULTS} // New route for search results
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><SearchResultsPage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={`${ROUTE_PATHS.PROFILE}/:userId`} 
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><ProfilePage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.PROFILE} // Default to a specific user for demo (or logged-in user)
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><ProfilePage /></Layout></ProtectedRoute>} 
        />
        <Route
          path={ROUTE_PATHS.USER_VIDEOS(':userId')} // New route for user's videos
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><UserVideosPage /></Layout></ProtectedRoute>}
        />
        <Route 
          path={ROUTE_PATHS.STORE} // New Store page
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><StorePage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.STORE_ITEM(':itemId')}
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><StoreItemDetailsPage /></Layout></ProtectedRoute>} 
        />
        <Route 
          path={ROUTE_PATHS.SETTINGS} // New Settings page
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Layout><SettingsPage /></Layout></ProtectedRoute>} 
        />

        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </HashRouter>
  );
};

export default App;