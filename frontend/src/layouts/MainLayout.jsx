import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
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
  Award
} from 'lucide-react';
import './MainLayout.css';
import logo from '../assets/ccs-logo.png';

const ROLE_MENUS = {
  Student: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'My Affiliations', path: '/affiliations', icon: Users },
    { title: 'Events', path: '/events', icon: Calendar },
    { title: 'Academic Tracker', path: '/academic-tracker', icon: BookOpen },
    { title: 'My Achievements', path: '/achievements', icon: Award },
    { title: 'My Violations', path: '/violations', icon: ShieldAlert },
    { title: 'My Medical Records', path: '/medical-records', icon: HeartPulse },
    { title: 'My Profile', path: '/profile', icon: UserCircle },
  ],
  Faculty: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Course Management', path: '/course-management', icon: BookOpen },
    { title: 'Student Management', path: '/student-management', icon: Users },
    { title: 'Event Management', path: '/event-management', icon: Calendar },
    { title: 'My Profile', path: '/profile', icon: UserCircle },
    { title: 'Violation Management', path: '/violation-management', icon: ShieldAlert },
    { title: 'Medical Records Management', path: '/medical-records-management', icon: HeartPulse },
    { title: 'Academic Records Management', path: '/academic-records-management', icon: FileCheck },
  ],
  Admin: [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Faculty Management', path: '/faculty-management', icon: User },
    { title: 'Course Management', path: '/course-management', icon: BookOpen },
    { title: 'Student Management', path: '/student-management', icon: Users },
    { title: 'Event Management', path: '/event-management', icon: Calendar },
    { title: 'Violation Management', path: '/violation-management', icon: ShieldAlert },
    { title: 'Medical Records Management', path: '/medical-records-management', icon: HeartPulse },
    { title: 'Academic Records Management', path: '/academic-records-management', icon: FileCheck },
    { title: 'Account Management', path: '/account-management', icon: Settings },
  ]
};

const MainLayout = ({ userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const menus = ROLE_MENUS[userRole] || [];
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
  };

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
            <button 
              className="theme-toggle-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="user-dropdown-container">
              <button className="user-profile-btn" onClick={toggleDropdown}>
                <div className="user-avatar-small">{userRole?.charAt(0)}</div>
                <span className="user-role-text">{userRole} Portal</span>
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
