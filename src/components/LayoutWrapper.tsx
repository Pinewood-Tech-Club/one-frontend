'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from './AppLayout';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Don't show anything while checking auth
  if (isAuthenticated === null) {
    return null;
  }

  // If authenticated, show AppLayout (which handles all pages internally)
  if (isAuthenticated) {
    return <AppLayout />;
  }

  // Not authenticated, render children (home page)
  return <>{children}</>;
}
