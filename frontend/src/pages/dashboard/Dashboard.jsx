import React from 'react';
import AdminDashboard from './AdminDashboard';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const userRole = (localStorage.getItem('userRole') || 'Student').toLowerCase();

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'faculty') {
    return <FacultyDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
