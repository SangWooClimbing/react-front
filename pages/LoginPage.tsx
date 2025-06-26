
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { APP_LOGO_TEXT, ROUTE_PATHS } from '../constants';
import { ArrowRightOnRectangleIcon, UserPlusIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface LoginPageProps {
  onLogin: () => void; // Callback to update auth state in App.tsx
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isLoginView) {
        // Simulate login
        if (email === 'test@example.com' && password === 'password') {
          console.log('Login successful');
          onLogin(); // This will trigger redirect in App.tsx
        } else {
          setError('Invalid email or password.');
        }
      } else {
        // Simulate registration
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
        } else if (!username.trim()) {
          setError('Username is required.');
        } else {
          console.log('Registration successful for:', { username, email });
          alert('Registration successful! Please login. (Mocked)');
          setIsLoginView(true); // Switch to login view after mock registration
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleOAuth = (provider: string) => {
    setIsLoading(true);
    // Simulate OAuth flow
    console.log(`Attempting OAuth with ${provider}`);
    setTimeout(() => {
      alert(`OAuth with ${provider} is a placeholder. In a real app, this would redirect to the provider.`);
       // onLogin(); // Simulate successful OAuth login for demo
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
          {isLoginView ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLoginView && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="mt-1 relative">
                  <UserPlusIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required={!isLoginView}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
            )}
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

            {!isLoginView && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required={!isLoginView}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              {isLoginView && (
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-blue-500">
                    Forgot your password?
                  </a>
                </div>
              )}
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} leftIcon={isLoginView ? <ArrowRightOnRectangleIcon className="h-5 w-5"/> : <UserPlusIcon className="h-5 w-5"/>}>
                {isLoginView ? 'Sign in' : 'Create account'}
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <Button variant="outline" onClick={() => handleOAuth('Google')} className="w-full" leftIcon={
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.41 2.866 8.166 6.838 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.03 1.532 1.03.891 1.53 2.341 1.089 2.91.833.091-.647.349-1.086.635-1.337-2.22-.252-4.555-1.112-4.555-4.944 0-1.091.39-1.984 1.029-2.682-.103-.254-.447-1.27.097-2.646 0 0 .84-.269 2.75 1.025A9.542 9.542 0 0110 4.817c.852 0 1.732.115 2.548.345 1.909-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.392.1 2.646.64.698 1.027 1.59 1.027 2.682 0 3.842-2.338 4.686-4.567 4.936.36.308.679.919.679 1.852 0 1.335-.012 2.415-.012 2.741 0 .268.18.578.688.48C17.137 18.163 20 14.41 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"/></svg>}>
                  GitHub
                </Button>
              </div>
              <div>
                <Button variant="outline" onClick={() => handleOAuth('Google')} className="w-full" leftIcon={
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM9.69 15.149c-2.234 0-4.058-1.824-4.058-4.058s1.824-4.058 4.058-4.058a4.02 4.02 0 012.87.925L11.025 9.53c-.175-.163-.65-.538-1.335-.538-1.075 0-1.95.887-1.95 1.969s.875 1.969 1.95 1.969c1.238 0 1.613-.688 1.713-1.063h-1.713V10.65h3.188c.037.2.062.412.062.637 0 1.876-1.275 3.862-3.25 3.862z"/></svg>}>
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-primary hover:text-blue-500">
                {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
    