import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { APP_LOGO_TEXT, ROUTE_PATHS } from '../constants';
import { ArrowRightOnRectangleIcon, UserPlusIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface LoginPageProps {
  onLogin: (userId: string, accessToken: string, refreshToken: string) => void;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string; 
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
    errors?: Array<{ field: string; message: string; code: string }>;
  };
}


const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData: ApiResponse<TokenResponse> = await response.json();

      if (response.ok && responseData.data) {
        const { userId, accessToken, refreshToken } = responseData.data;
        if (!userId) {
          setError('Login successful, but user ID was not returned. Please contact support.');
          setIsLoading(false);
          return;
        }
        onLogin(userId, accessToken, refreshToken);
        navigate(ROUTE_PATHS.HOME);
      } else {
        setError(responseData.error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login API error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  const handleOAuth = (provider: string) => {
    setIsLoading(true);
    // This is highly dependent on your backend OAuth2 flow (e.g., redirect or token exchange)
    // For a redirect flow:
    // window.location.href = `/api/auth/${provider.toLowerCase()}`;
    // For a token exchange flow, you'd first get a token from the provider SDK (e.g., Google Sign-In SDK)
    // and then POST it to your backend.
    console.log(`Attempting OAuth with ${provider}`);
    setTimeout(() => {
      alert(`OAuth with ${provider} is a placeholder. This would typically involve redirecting to ${provider} or using their SDK, then sending an authorization code or token to an endpoint like /api/auth/${provider.toLowerCase()}.`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to={ROUTE_PATHS.HOME} className="flex justify-center">
            <h2 className="mt-6 text-center text-4xl font-extrabold text-primary">
            {APP_LOGO_TEXT}
            </h2>
        </Link>
        <h2 className="mt-2 text-center text-xl text-slate-600">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLoginView ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">{error}</p>}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} leftIcon={<ArrowRightOnRectangleIcon className="h-5 w-5"/>}>
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Button variant="outline" onClick={() => handleOAuth('Google')} className="w-full" leftIcon={
                  <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.5 512 0 401.5 0 265.2 0 128.5 107.1 19.3 240.1 19.3c65.9 0 120.5 25.3 159.9 61.4l-68.5 66.6C298.5 125.9 272.8 113 240.1 113c-74.7 0-134.7 60.4-134.7 134.7s59.9 134.7 134.7 134.7c81.5 0 115.7-56.1 119.9-87.9H244V273h147.9c1.6 8.5 2.7 17.5 2.7 26.8z"></path></svg>}>
                  Sign in with Google
                </Button>
              </div>
              {/* Add other OAuth providers here if needed */}
            </div>

            <div className="mt-6 text-center text-sm">
              <Link to={ROUTE_PATHS.SIGNUP} className="font-medium text-primary hover:text-blue-500">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
