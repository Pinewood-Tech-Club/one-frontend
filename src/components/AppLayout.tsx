'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { usePathname, useRouter } from 'next/navigation';
import DashboardPage from '@/app/dashboard/index/page';
import UpcomingPage from '@/app/dashboard/upcoming/page';
import SchedulePage from '@/app/dashboard/schedule/page';
import GradesPage from '@/app/dashboard/grades/page';
import ChatPage from '@/app/dashboard/chat/page';
import UserPage from '@/app/dashboard/user/page';

type Page = 'dashboard' | 'upcoming' | 'schedule' | 'grades' | 'chat' | 'user';

// Map pathname to page
function pathnameToPage(pathname: string): Page {
  if (pathname === '/' || pathname === '/dashboard') return 'dashboard';
  if (pathname === '/upcoming') return 'upcoming';
  if (pathname === '/schedule') return 'schedule';
  if (pathname === '/grades') return 'grades';
  if (pathname === '/chat') return 'chat';
  if (pathname === '/user') return 'user';
  return 'dashboard'; // default
}

// Map page to pathname
function pageToPathname(page: Page): string {
  if (page === 'dashboard') return '/';
  return `/${page}`;
}

export function AppLayout() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('Loading...');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(() => pathnameToPage(pathname));
  // Initialize from localStorage immediately (synchronous, no flash)
  const [localCollapsed, setLocalCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sidebarCollapsed');
      return cached ? JSON.parse(cached) : false;
    }
    return false;
  });
  const [isPendingToggle, setIsPendingToggle] = useState(false);

  // Get sidebar state from Convex
  const sidebarCollapsed = useQuery(
    api.userPreferences.getSidebarCollapsed,
    userId ? { userId } : 'skip'
  );

  // Mutation to update sidebar state
  const setSidebarCollapsed = useMutation(api.userPreferences.setSidebarCollapsed);

  // Sync pathname to currentPage state (for initial load and back/forward navigation)
  useEffect(() => {
    const page = pathnameToPage(pathname);
    setCurrentPage(page);
  }, [pathname]);

  // Update URL when currentPage changes (without triggering navigation)
  useEffect(() => {
    const targetPath = pageToPathname(currentPage);
    if (pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentPage, pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
          // Use email as userId for Convex
          setUserId(data.email);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName('User');
      }
    };

    fetchUser();
  }, []);

  // Sync Convex state to local state when it changes (from other tabs/devices)
  useEffect(() => {
    if (sidebarCollapsed !== undefined && sidebarCollapsed !== localCollapsed) {
      // Only update if we're not in the middle of a toggle
      if (!isPendingToggle) {
        // Update from Convex (either initial load or from another device)
        setLocalCollapsed(sidebarCollapsed);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
      } else if (sidebarCollapsed === localCollapsed) {
        // Convex has caught up with our optimistic update
        setIsPendingToggle(false);
      }
    }
  }, [sidebarCollapsed, localCollapsed, isPendingToggle]);

  const toggleSidebar = async () => {
    const newState = !localCollapsed;
    // Mark that we're doing an optimistic update
    setIsPendingToggle(true);
    // Update local state immediately for instant UI feedback
    setLocalCollapsed(newState);
    // Cache in localStorage immediately
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    // Update Convex in the background (for cross-device sync)
    if (userId) {
      await setSidebarCollapsed({ userId, collapsed: newState });
      // Clear pending flag once mutation completes
      setIsPendingToggle(false);
    }
  };

  const navItems: Array<{ name: string; icon: string; page: Page }> = [
    { name: 'Dashboard', icon: '􀎞', page: 'dashboard' },
    { name: 'Upcoming', icon: '􀐫', page: 'upcoming' },
    { name: 'Schedule', icon: '􀉉', page: 'schedule' },
    { name: 'Grades', icon: '􀣉', page: 'grades' },
    { name: 'Chat', icon: '􂄹', page: 'chat' },
  ];

  const isCollapsed = localCollapsed;

  return (
    <div className="bg-white md:bg-green-800 flex flex-col gap-[10px] md:flex-row md:gap-0 p-[10px] w-screen h-screen">
      {/* Sidebar */}
      <div
        className={`flex flex-row md:flex-col justify-between gap-[10px] md:gap-0 p-[10px] pl-[10px] md:pl-0 h-auto md:h-full w-full bg-green-800 md:bg-transparent rounded-[24px] md:rounded-none ${
          isCollapsed ? 'md:w-[68px]' : 'md:w-[280px]'
        }`}
      >
        <div className="flex flex-row md:flex-col gap-[10px] flex-1 md:flex-none">
          <div className={`hidden md:flex ${isCollapsed ? 'justify-center' : 'justify-end'} pb-[6px]`}>
            <button
              className={`flex items-center justify-center py-1 text-white text-[24px] hover:bg-green-700 rounded-lg transition-colors duration-300 cursor-pointer font-['SF_Pro'] ${
                isCollapsed ? 'w-full' : 'w-[52px]'
              }`}
              onClick={toggleSidebar}
            >
              <div className="flex flex-col justify-center h-[32px] w-[48px] text-center shrink-0">
                <p className="leading-normal">􀏚</p>
              </div>
            </button>
          </div>

          {/* Navigation items */}
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center justify-center p-[4px] flex-1 md:flex-none md:w-full md:p-0 md:py-1 ${isCollapsed ? 'md:justify-center' : 'md:justify-between md:pl-4 md:pr-1'} text-white text-[24px] cursor-pointer rounded-2xl md:rounded-lg transition-colors ${
                  isActive ? 'bg-green-700' : 'hover:bg-green-700'
                }`}
              >
                {!isCollapsed && (
                  <div className="hidden md:flex flex-col justify-center h-[32px] font-['Inter'] font-normal">
                    <p className="leading-normal">{item.name}</p>
                  </div>
                )}
                <div className="flex flex-col justify-center h-[32px] w-[48px] text-center font-['SF_Pro'] shrink-0">
                  <p className="leading-normal">{item.icon}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom user profile */}
        <div className="flex flex-col gap-[10px] shrink-0">
          <button
            onClick={() => setCurrentPage('user')}
            className={`flex items-center justify-center p-[4px] md:p-0 md:py-1 md:w-full ${isCollapsed ? 'md:justify-center' : 'md:justify-between md:pl-4 md:pr-1'} text-white text-[24px] md:rounded-lg cursor-pointer transition-colors ${
              currentPage === 'user' ? 'bg-green-700' : 'hover:bg-green-700'
            }`}
          >
            {!isCollapsed && (
              <div className="hidden md:flex flex-col justify-center h-[32px] font-['Inter'] font-normal overflow-hidden">
                <p className="leading-normal truncate">{userName}</p>
              </div>
            )}
            <div className="flex flex-col justify-center h-[32px] w-[48px] text-center font-['SF_Pro'] shrink-0">
              <p className="leading-normal">􀉩</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-[24px] flex-1 h-full overflow-auto">
        <div style={{ display: currentPage === 'dashboard' ? 'block' : 'none' }}>
          <DashboardContent />
        </div>
        <div style={{ display: currentPage === 'upcoming' ? 'block' : 'none' }}>
          <UpcomingContent />
        </div>
        <div style={{ display: currentPage === 'schedule' ? 'block' : 'none' }}>
          <ScheduleContent />
        </div>
        <div style={{ display: currentPage === 'grades' ? 'block' : 'none' }}>
          <GradesContent />
        </div>
        <div style={{ display: currentPage === 'chat' ? 'block' : 'none' }}>
          <ChatContent />
        </div>
        <div style={{ display: currentPage === 'user' ? 'block' : 'none' }}>
          <UserContent />
        </div>
      </div>
    </div>
  );
}

// Page content components - using actual page components
const DashboardContent = DashboardPage;
const UpcomingContent = UpcomingPage;
const ScheduleContent = SchedulePage;
const GradesContent = GradesPage;
const ChatContent = ChatPage;
const UserContent = UserPage;

