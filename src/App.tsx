import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import UploadPage from './pages/UploadPage';
import SearchResultsPage from './pages/SearchResultsPage'; 
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import StorePage from './pages/StorePage'; 
import StoreItemDetailsPage from './pages/StoreItemDetailsPage'; 
import UserVideosPage from './pages/UserVideosPage'; 
import VideoPostDetailsPage from './pages/VideoPostDetailsPage';
import SettingsPage from './pages/SettingsPage'; 
import { ROUTE_PATHS } from './constants';
import { useCartStore } from './stores/cartStore'; 

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (token && userId) { // Ensure both token and userId exist
      setIsAuthenticated(true);
      setCurrentUserId(userId);
      // TODO: Optionally, verify token with backend here
      // e.g., fetch('/api/auth/verify-token').then(res => if (!res.ok) handleLogout());
    }
    setIsLoadingAuth(false);
  }, []);

  const handleLogin = useCallback((userId: string, accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setCurrentUserId(userId);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    clearCart(); 
    // Navigation to login page will be handled by ProtectedRoute or directly if needed
  }, [clearCart]);

  if (isLoadingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Loading application...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path={ROUTE_PATHS.LOGIN}
          element={isAuthenticated ? <Navigate to={ROUTE_PATHS.HOME} /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route
          path={ROUTE_PATHS.SIGNUP}
          element={isAuthenticated ? <Navigate to={ROUTE_PATHS.HOME} /> : <SignupPage />}
        />
        
        <Route 
          path={ROUTE_PATHS.HOME}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}>
                <HomePage isAuthenticated={isAuthenticated} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.NOTIFICATIONS}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><NotificationsPage /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.UPLOAD}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><UploadPage userId={currentUserId} /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.SEARCH_RESULTS} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}>
                <SearchResultsPage isAuthenticated={isAuthenticated} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={`${ROUTE_PATHS.PROFILE}/:userIdParam`} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}>
                <ProfilePage isAuthenticated={isAuthenticated} loggedInUserId={currentUserId} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.PROFILE} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}>
                {currentUserId ? <Navigate to={`${ROUTE_PATHS.PROFILE}/${currentUserId}`} /> : <ProfilePage isAuthenticated={isAuthenticated} loggedInUserId={null} />}
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route
          path={ROUTE_PATHS.USER_VIDEOS(':userIdParam')} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><UserVideosPage isAuthenticated={isAuthenticated} /></Layout>
            </ProtectedRoute>
          }
        />
        <Route 
          path={ROUTE_PATHS.VIDEO_POST_DETAILS(':postId')} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}>
                <VideoPostDetailsPage isAuthenticated={isAuthenticated} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.STORE} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><StorePage loggedInUserId={currentUserId} /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.STORE_ITEM(':itemId')}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><StoreItemDetailsPage /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path={ROUTE_PATHS.SETTINGS} 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout onLogout={handleLogout} userId={currentUserId}><SettingsPage loggedInUserId={currentUserId} /></Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Layout onLogout={handleLogout} userId={currentUserId}><NotFoundPage /></Layout>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
