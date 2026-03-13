import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import MainLayout from './layouts/MainLayout'
import PlaceholderPage from './pages/PlaceholderPage'
import AccountManagement from './pages/AccountManagement'
import EventManagement from './pages/EventManagement'
import MedicalRecordsManagement from './pages/MedicalRecordsManagement'
import MyMedicalRecords from './pages/MyMedicalRecords'
import Events from './pages/Events'
import AcademicTracker from './pages/AcademicTracker'
import CourseManagement from './pages/CourseManagement'
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
            <Route path="/dashboard" element={<PlaceholderPage title={`${userRole} Dashboard`} />} />
            
            {/* Student & Shared Routes */}
            <Route path="/events" element={<Events />} />
            <Route path="/academic-tracker" element={<AcademicTracker />} />
            <Route path="/achievements" element={<PlaceholderPage title="My Achievements" />} />
            <Route path="/violations" element={<PlaceholderPage title="My Violations" />} />
            <Route path="/medical-records" element={<MyMedicalRecords />} />
            <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
            
            {/* Faculty & Admin Routes */}
            <Route path="/course-management" element={<CourseManagement />} />
            <Route path="/student-management" element={<PlaceholderPage title="Student Management" />} />
            <Route path="/event-management" element={<EventManagement />} />
            <Route path="/violation-management" element={<PlaceholderPage title="Violation Management" />} />
            <Route path="/medical-records-management" element={<MedicalRecordsManagement />} />
            <Route path="/academic-records-management" element={<PlaceholderPage title="Academic Records Management" />} />
            
            {/* Admin Only Route */}
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
