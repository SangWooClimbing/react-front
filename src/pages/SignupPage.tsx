import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../constants';
import Button from '../components/ui/Button';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`/api${url}`, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request to ${url} failed with status ${response.status}`);
    }
    return response.json();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      navigate(ROUTE_PATHS.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="password" aclassName="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" aclassName="block text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
};

export default SignupPage;
