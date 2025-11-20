'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useEffect, useState } from 'react';

interface SchoologyStatus {
  connected: boolean;
}

interface Course {
  id: string;
  course_title: string;
  section_title: string;
  subject_area?: string;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [schoologyStatus, setSchoologyStatus] = useState<SchoologyStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get cached courses from Convex
  const cachedCourses = useQuery(
    api.schoologyCache.getCourses,
    userId ? { userId } : 'skip'
  );

  // Fetch user info and Schoology status on mount
  useEffect(() => {
    const fetchUserAndStatus = async () => {
      try {
        // Get user info
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
          credentials: 'include',
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserId(String(userData.user_id));
        }

        // Get Schoology status
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schoology/status`, {
          credentials: 'include',
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setSchoologyStatus(statusData);
        }
      } catch (error) {
        console.error('Error fetching user/status:', error);
      }
    };

    fetchUserAndStatus();
  }, []);

  // Trigger background refresh when component mounts
  useEffect(() => {
    if (userId && schoologyStatus?.connected) {
      handleRefresh();
    }
  }, [userId, schoologyStatus?.connected]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schoology/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/schoology/start`,
      'SchoologyAuth',
      'width=600,height=700'
    );
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schoology/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      setSchoologyStatus({ connected: false });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Schoology Status Section */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Schoology Status</h2>
        {schoologyStatus === null ? (
          <p className="text-gray-500">Loading...</p>
        ) : schoologyStatus.connected ? (
          <div className="space-y-2">
            <p className="text-green-600 font-semibold">✓ Connected</p>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Disconnect Schoology
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-500">Not connected</p>
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect Schoology
            </button>
          </div>
        )}
      </div>

      {/* Courses Section */}
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Courses</h2>
          {schoologyStatus?.connected && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>

        {!schoologyStatus?.connected ? (
          <p className="text-gray-500">Connect Schoology to see your courses</p>
        ) : cachedCourses === undefined ? (
          <p className="text-gray-500">Loading courses...</p>
        ) : cachedCourses.length === 0 ? (
          <p className="text-gray-500">No courses found</p>
        ) : (
          <ul className="space-y-2">
            {cachedCourses.map((course: Course) => (
              <li key={course.id} className="border-b pb-2">
                <div className="font-semibold">{course.course_title}</div>
                <div className="text-sm text-gray-600">{course.section_title}</div>
                {course.subject_area && (
                  <div className="text-xs text-gray-500">{course.subject_area}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

