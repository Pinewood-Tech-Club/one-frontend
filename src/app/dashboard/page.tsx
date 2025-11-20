"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function App({ children }: { children?: React.ReactNode }) {
  const [userName, setUserName] = useState<string>('Loading...');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName('User');
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: '􀎞', href: '/' },
    { name: 'Upcoming', icon: '􀐫', href: '/upcoming' },
    { name: 'Schedule', icon: '􀉉', href: '/schedule' },
    { name: 'Grades', icon: '􀣉', href: '/grades' },
    { name: 'Chat', icon: '􂄹', href: '/chat' },
  ];

  return (
    <div className="bg-green-800 flex p-[10px] w-screen h-screen">
      {/* Sidebar */}
      <div className="flex flex-col justify-between p-[10px] pr-0 w-[280px] h-full">
        {/* Top navigation items */}
        <div className="flex flex-col gap-[10px]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-[4px] text-white text-[24px] w-full hover:bg-green-700 rounded transition-colors"
            >
              <div className="flex flex-col justify-center h-[32px] font-['Inter'] font-normal">
                <p className="leading-normal">{item.name}</p>
              </div>
              <div className="flex flex-col justify-center h-[32px] w-[48px] text-center font-['SF_Pro']">
                <p className="leading-normal">{item.icon}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom user profile */}
        <div className="flex flex-col gap-[10px]">
          <Link
            href="/user"
            className="flex items-center justify-between p-[4px] text-white text-[24px] w-full hover:bg-green-700 rounded transition-colors"
          >
            <div className="flex flex-col justify-center h-[32px] font-['Inter'] font-normal">
              <p className="leading-normal">{userName}</p>
            </div>
            <div className="flex flex-col justify-center h-[32px] w-[48px] text-center font-['SF_Pro']">
              <p className="leading-normal">􀉩</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-[24px] flex-1 h-full overflow-auto">
        {children}
      </div>
    </div>
  );
}

export default function AppPage({ children }: { children?: React.ReactNode }) {
  return <App>{children}</App>;
}
