"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from token or API
    const getUserInfo = async () => {
      console.log('Dashboard: Starting user info fetch...');
      try {
        const response = await fetch('/api/auth/me');
        console.log('Dashboard: API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard: User data received:', data);
          setUser(data.user);
        } else {
          console.error('User info API failed:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          // Don't redirect here, let middleware handle it
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        // Don't redirect here, let middleware handle it
      }
    };

    getUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`transition-all duration-300 flex-1 flex flex-col ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} w-full`}>
        <Navbar
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 p-2 sm:p-8 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
