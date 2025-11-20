import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@shared/components/admin/Sidebar';
import Topbar from '@shared/components/admin/Topbar';

const AdminLayout = () => {
  // Initialize sidebar state based on screen size
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return window.innerWidth < 1024; // Collapsed on mobile/tablet (< lg breakpoint)
  });

  // Update sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on mobile/tablet, auto-expand on desktop
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      {/* Topbar */}
      <Topbar isCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <main
        className={`
          pt-[70px] min-h-screen
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
