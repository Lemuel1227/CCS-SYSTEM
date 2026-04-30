import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarRange,
  AlertTriangle, 
  Activity, 
  User, 
  Users, 
  Settings,
  BookOpen,
  LogOut,
  Menu,
  FileCheck,
  ShieldAlert,
  HeartPulse,
  UserCircle,
  X,
  Sun,
  Moon,
  Award,
  Clock,
  Bell,
  Megaphone,
  Flag,
  FileText
} from 'lucide-react';
import './MainLayout.css';
import logo from '../assets/ccs-logo.png';

const ROLE_MENUS = {
  student: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'My Schedule', path: '/my-schedule', icon: Clock },
    { title: 'My Affiliations', path: '/affiliations', icon: Users },
    { title: 'Events', path: '/events', icon: Calendar },
    { title: 'Academic Tracker', path: '/academic-tracker', icon: BookOpen },
    { title: 'My Achievements', path: '/achievements', icon: Award },
    { title: 'My Violations', path: '/violations', icon: ShieldAlert },
    { title: 'My Medical Records', path: '/medical-records', icon: HeartPulse },
    { title: 'My Profile', path: '/profile', icon: UserCircle },
  ],
  faculty: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Reports', path: '/reports', icon: FileText },
    { title: 'Schedule Management', path: '/schedule-management', icon: Clock },
    { title: 'School Year & Sections', path: '/school-year-sections', icon: CalendarRange },
    { title: 'My Schedule', path: '/my-schedule', icon: Clock },
    { title: 'Course Management', path: '/course-management', icon: BookOpen },
    { title: 'Student Management', path: '/student-management', icon: Users },
    { title: 'Event Management', path: '/event-management', icon: Calendar },
    { title: 'Announcement Management', path: '/announcement-management', icon: Megaphone },
    { title: 'Clubs & Orgs Management', path: '/clubs-orgs-management', icon: Flag },
    { title: 'Achievement Management', path: '/achievement-management', icon: Award },
    { title: 'My Profile', path: '/profile', icon: UserCircle },
    { title: 'Violation Management', path: '/violation-management', icon: ShieldAlert },
    { title: 'Medical Records Management', path: '/medical-records-management', icon: HeartPulse },
  ],
  admin: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Reports', path: '/reports', icon: FileText },
    { title: 'Faculty Management', path: '/faculty-management', icon: User },
    { title: 'Schedule Management', path: '/schedule-management', icon: Clock },
    { title: 'School Year & Sections', path: '/school-year-sections', icon: CalendarRange },
    { title: 'Course Management', path: '/course-management', icon: BookOpen },
    { title: 'Student Management', path: '/student-management', icon: Users },
    { title: 'Event Management', path: '/event-management', icon: Calendar },
    { title: 'Announcement Management', path: '/announcement-management', icon: Megaphone },
    { title: 'Clubs & Orgs Mgmt', path: '/clubs-orgs-management', icon: Flag },
    { title: 'Achievement Management', path: '/achievement-management', icon: Award },
    { title: 'Violation Management', path: '/violation-management', icon: ShieldAlert },
    { title: 'Medical Records Management', path: '/medical-records-management', icon: HeartPulse },
    { title: 'Account Management', path: '/account-management', icon: Settings },
  ]
};

const MainLayout = ({ userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const menus = ROLE_MENUS[userRole ? userRole.toLowerCase() : ''] || [];
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (dropdownOpen) setDropdownOpen(false);
  };

  // Mock Notifications Data
  const mockNotifications = [
    { id: 1, text: 'New event: Tech Symposium coming up!', time: '10 mins ago', unread: true },
    { id: 2, text: 'Your schedule has been updated.', time: '1 hour ago', unread: true },
    { id: 3, text: 'Reminder: Medical checkup due next week.', time: '1 day ago', unread: false },
    { id: 4, text: 'System maintenance scheduled for midnight.', time: '2 days ago', unread: false },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || userRole;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={logo} alt="CCS Logo" className="sidebar-logo" />
          {sidebarOpen && <h2 className="sidebar-title">CCS System</h2>}
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menus.map((menu, index) => (
            <NavLink 
              key={index} 
              to={menu.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={menu.title}
            >
              <menu.icon size={20} />
              {sidebarOpen && <span className="nav-label">{menu.title}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <span className="college-name">Pamantasan ng Cabuyao - CCS</span>
          </div>

          <div className="header-right">
            <div className="notifications-container">
              <button 
                className="notification-toggle-btn" 
                onClick={toggleNotifications}
                title="Notifications"
              >
                <Bell size={20} />
                {mockNotifications.some(n => n.unread) && <span className="notification-badge"></span>}
              </button>

              {notificationsOpen && (
                <div className="notifications-dropdown-menu">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn">Mark all as read</button>
                  </div>
                  <div className="notifications-list">
                    {mockNotifications.map(notification => (
                      <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                        <div className="notification-icon">
                          <Bell size={16} />
                        </div>
                        <div className="notification-content">
                          <p>{notification.text}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notifications-footer">
                    <button className="view-all-btn">View All</button>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="theme-toggle-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="user-dropdown-container">
              <button className="user-profile-btn" onClick={toggleDropdown}>
                <div className="user-avatar-small">{userName?.charAt(0).toUpperCase()}</div>
                <span className="user-role-text">{userName}</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <UserCircle size={16} />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink to="/account-management" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} />
                    <span>Settings</span>
                  </NavLink>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-dropdown-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
