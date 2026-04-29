import React from 'react';
import { Users, Calendar, BookOpen, Activity, UserPlus, Settings, Clock, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import AnnouncementsWidget from './AnnouncementsWidget';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutDashboard size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0 }}>Administrator Dashboard</h1>
        </div>
        <p>Welcome back! Here's an overview of the CCS System.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p>Total Students</p>
            <h3>1,248</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <p>Faculty Members</p>
            <h3>84</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <p>Upcoming Events</p>
            <h3>12</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <p>Active Violations</p>
            <h3>5</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ gridTemplateColumns: 'repeat(1, 1fr)', marginBottom: '24px' }}>
        <AnnouncementsWidget />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2><Activity size={20} /> Recent Activities</h2>
          <div className="list-container">
            <div className="timeline-item">
              <div className="timeline-dot">
                <UserPlus size={16} />
              </div>
              <div className="timeline-content">
                <h4>New Student Account Created</h4>
                <p>BSCS 1st Year - John Doe was added to the system.</p>
                <div className="timeline-time">2 hours ago</div>
              </div>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot">
                <Calendar size={16} />
              </div>
              <div className="timeline-content">
                <h4>Event Scheduled</h4>
                <p>IT Week 2026 has been scheduled for next month.</p>
                <div className="timeline-time">5 hours ago</div>
              </div>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot">
                <AlertTriangle size={16} />
              </div>
              <div className="timeline-content">
                <h4>Violation Recorded</h4>
                <p>New dress code violation added by Faculty M. Smith.</p>
                <div className="timeline-time">1 day ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2><Settings size={20} /> Quick Actions</h2>
          <div className="list-container">
            <Link to="/student-management" className="list-item">
              <div className="item-icon">
                <Users size={20} />
              </div>
              <div className="item-content">
                <h4>Manage Students</h4>
                <p>View, edit, or add records</p>
              </div>
            </Link>
            <Link to="/course-management" className="list-item">
              <div className="item-icon">
                <BookOpen size={20} />
              </div>
              <div className="item-content">
                <h4>Course Management</h4>
                <p>Update curriculums and subjects</p>
              </div>
            </Link>
            <Link to="/schedule-management" className="list-item">
              <div className="item-icon">
                <Clock size={20} />
              </div>
              <div className="item-content">
                <h4>Class Schedules</h4>
                <p>Allocate rooms and times</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;