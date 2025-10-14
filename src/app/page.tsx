'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface User {
  user_id: string;
  email: string;
  name: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for authentication errors from OAuth callback
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      switch (errorParam) {
        case 'no_code':
          setError('Authentication failed: No authorization code received.');
          break;
        case 'token_failed':
          setError('Authentication failed: Could not exchange code for token.');
          break;
        case 'user_info_failed':
          setError('Authentication failed: Could not retrieve user information.');
          break;
        case 'invalid_domain':
          setError('Please use your @pinewood.edu email address to log in.');
          break;
        case 'unexpected':
          setError('An unexpected error occurred during authentication.');
          break;
        default:
          setError('Authentication failed.');
      }
      setLoading(false);
      return;
    }

    if (successParam) {
      // Clear URL parameters and check user session
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if user is already authenticated
    checkAuthStatus();
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3111/api/user', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:3111/auth/google';
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3111/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              checkAuthStatus();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Pinewood One</h1>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login with Pinewood One
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Hello, {user.name}!</h1>
        <p className="text-gray-600 mb-8">{user.email}</p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
