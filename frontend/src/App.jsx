import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import MainLayout from './layouts/MainLayout'
import PlaceholderPage from './pages/shared/PlaceholderPage'
import Dashboard from './pages/dashboard/Dashboard'
import MyProfile from './pages/student/MyProfile'
import AccountManagement from './pages/management/AccountManagement'
import EventManagement from './pages/management/EventManagement'
import MedicalRecordsManagement from './pages/management/MedicalRecordsManagement'
import MyMedicalRecords from './pages/student/MyMedicalRecords'
import MySchedule from './pages/student/MySchedule'
import Events from './pages/student/Events'
import AcademicTracker from './pages/student/AcademicTracker'
import MyAchievements from './pages/student/MyAchievements'
import MyViolations from './pages/student/MyViolations'
import MyAffiliation from './pages/student/MyAffiliation'
import CourseManagement from './pages/management/CourseManagement'
import ScheduleManagement from './pages/management/ScheduleManagement'
import StudentManagement from './pages/management/StudentManagement'
import FacultyManagement from './pages/management/FacultyManagement'
import ViolationManagement from './pages/management/ViolationManagement'
import AchievementManagement from './pages/management/AchievementManagement'
import AnnouncementManagement from './pages/management/AnnouncementManagement'
import ClubsOrgsManagement from './pages/management/ClubsOrgsManagement'
import SchoolYearSectionManagement from './pages/management/SchoolYearSectionManagement'
import ReportsPage from './pages/management/ReportsPage'
import SessionGuard from './components/SessionGuard'
import ForceSignoutGuard from './components/ForceSignoutGuard'
import './App.css'

function App() {
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  const [isForcedSignout, setIsForcedSignout] = useState(false);

  useEffect(() => {
    const handleForcedSignout = () => {
      setIsForcedSignout(true);
    };

    window.addEventListener('password-reset-forced', handleForcedSignout);
    return () => {
      window.removeEventListener('password-reset-forced', handleForcedSignout);
    };
  }, []);

  const [requiresPasswordChange, setRequiresPasswordChange] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.requiresPasswordChange || false;
    }
    return false;
  });

  // Background polling to check if token is invalidated (e.g. password reset by admin)
  useEffect(() => {
    let intervalId;
    if (userRole && !isForcedSignout && !requiresPasswordChange) {
      intervalId = setInterval(() => {
        axios.get('/api/auth/profile').catch(() => {});
      }, 5000); // Pool every 5 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userRole, isForcedSignout, requiresPasswordChange]);

  const handleLogin = (role, needsPwdChange) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setRequiresPasswordChange(needsPwdChange || false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
    setRequiresPasswordChange(false);
    setIsForcedSignout(false);
  };

  const handlePasswordChanged = () => {
    setRequiresPasswordChange(false);
  };

  return (
    <BrowserRouter>
      {isForcedSignout && <ForceSignoutGuard onLogout={handleLogout} />}
      {userRole && requiresPasswordChange && !isForcedSignout ? (
        <SessionGuard onLogout={handleLogout} onPasswordConfirmed={handlePasswordChanged} />
      ) : (
      <Routes>
        {/* Public Route */}
        <Route 
          path="/" 
          element={
            !userRole ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        {/* Protected Routes inside MainLayout */}
        {userRole && (
          <Route element={<MainLayout userRole={userRole} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard />} />

            // Student & Shared Routes
            <Route path="/events" element={<Events />} />
            <Route path="/my-schedule" element={<MySchedule />} />
            <Route path="/academic-tracker" element={<AcademicTracker />} />
            <Route path="/achievements" element={<MyAchievements />} />
            <Route path="/affiliations" element={<MyAffiliation />} />
            <Route path="/violations" element={<MyViolations />} />
            <Route path="/medical-records" element={<MyMedicalRecords />} />
            <Route path="/profile" element={<MyProfile />} />
            
            {/* Faculty & Admin Routes */}
            <Route path="/reports" element={<ReportsPage userRole={userRole} />} />
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/schedule-management" element={<ScheduleManagement />} />
            <Route path="/student-management" element={<StudentManagement />} />
            <Route path="/event-management" element={<EventManagement />} />
            <Route path="/announcement-management" element={<AnnouncementManagement />} />
            <Route path="/clubs-orgs-management" element={<ClubsOrgsManagement />} />
            <Route path="/violation-management" element={<ViolationManagement />} />
            <Route path="/achievement-management" element={<AchievementManagement />} />
            <Route path="/medical-records-management" element={<MedicalRecordsManagement />} />
            <Route path="/school-year-sections" element={<SchoolYearSectionManagement />} />
            
            {/* Admin Only Routes */}
            <Route path="/faculty-management" element={<FacultyManagement />} />
            <Route path="/account-management" element={<AccountManagement />} />
          </Route>
        )}

        {/* Catch all - Redirect to login if not authenticated or dashboard if authenticated */}
        <Route path="*" element={<Navigate to={userRole ? "/dashboard" : "/"} replace />} />
      </Routes>
      )}
    </BrowserRouter>
  )
}

export default App;


