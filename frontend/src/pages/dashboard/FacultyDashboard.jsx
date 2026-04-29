import React from 'react';
import { Users, Clock, CalendarCheck, BookOpen, UserCheck, AlertCircle, FileText, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import AnnouncementsWidget from './AnnouncementsWidget';

const FacultyDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutDashboard size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0 }}>Faculty Dashboard</h1>
        </div>
        <p>Welcome back! Here's your teaching overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p>Total Advisees</p>
            <h3>42</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <p>Active Classes</p>
            <h3>6</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p>Hours Today</p>
            <h3>4.5</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ gridTemplateColumns: 'repeat(1, 1fr)', marginBottom: '24px' }}>
        <AnnouncementsWidget />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2><CalendarCheck size={20} /> Today's Schedule</h2>
          <div className="list-container">
            <div className="timeline-item">
              <div className="timeline-dot">
                <Clock size={16} />
              </div>
              <div className="timeline-content">
                <h4>Data Structures and Algorithms</h4>
                <p>Room 302 - BSCS 2A</p>
                <div className="timeline-time">08:00 AM - 10:00 AM</div>
              </div>
              <div className="timeline-line"></div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-dot">
                <Clock size={16} />
              </div>
              <div className="timeline-content">
                <h4>Web Development</h4>
                <p>Lab 1 - BSIT 3B</p>
                <div className="timeline-time">10:30 AM - 01:30 PM</div>
              </div>
              <div className="timeline-line"></div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">
                <Users size={16} />
              </div>
              <div className="timeline-content">
                <h4>Advisory Meeting</h4>
                <p>Faculty Office</p>
                <div className="timeline-time">02:00 PM - 03:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2><FileText size={20} /> Quick Actions</h2>
          <div className="list-container">
            <Link to="/student-management" className="list-item">
              <div className="item-icon">
                <Users size={20} />
              </div>
              <div className="item-content">
                <h4>Manage Students</h4>
                <p>View student records and grades</p>
              </div>
            </Link>
            <Link to="/violation-management" className="list-item">
              <div className="item-icon">
                <AlertCircle size={20} />
              </div>
              <div className="item-content">
                <h4>Report Violation</h4>
                <p>Log a student disciplinary issue</p>
              </div>
            </Link>
            <Link to="/schedule-management" className="list-item">
              <div className="item-icon">
                <CalendarCheck size={20} />
              </div>
              <div className="item-content">
                <h4>My Schedule</h4>
                <p>View full weekly timetable</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;