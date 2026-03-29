import { useState } from 'react'
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
import './App.css'

function App() {
  // Simple mock auth state
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  const handleLogin = (role) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setUserRole(null);
  };

  return (
    <BrowserRouter>
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

            {/* Student & Shared Routes */}
            <Route path="/events" element={<Events />} />
            <Route path="/my-schedule" element={<MySchedule />} />
            <Route path="/academic-tracker" element={<AcademicTracker />} />
            <Route path="/achievements" element={<MyAchievements />} />
            <Route path="/affiliations" element={<MyAffiliation />} />
              <Route path="/violations" element={<MyViolations />} />
            <Route path="/medical-records" element={<MyMedicalRecords />} />
            <Route path="/profile" element={<MyProfile />} />
            
            {/* Faculty & Admin Routes */}
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/schedule-management" element={<ScheduleManagement />} />
            <Route path="/student-management" element={<StudentManagement />} />
            <Route path="/event-management" element={<EventManagement />} />
            <Route path="/announcement-management" element={<AnnouncementManagement />} />
            <Route path="/clubs-orgs-management" element={<ClubsOrgsManagement />} />
            <Route path="/violation-management" element={<ViolationManagement />} />
            <Route path="/achievement-management" element={<AchievementManagement />} />
            <Route path="/medical-records-management" element={<MedicalRecordsManagement />} />
            
            {/* Admin Only Routes */}
            <Route path="/faculty-management" element={<FacultyManagement />} />
            <Route path="/account-management" element={<AccountManagement />} />
          </Route>
        )}

        {/* Catch all - Redirect to login if not authenticated or dashboard if authenticated */}
        <Route path="*" element={<Navigate to={userRole ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;


