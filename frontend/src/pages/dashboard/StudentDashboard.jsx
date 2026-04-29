import React from 'react';
import { BookOpen, Calendar, Clock, Award, Activity, FileText, ChevronRight, CheckCircle, LayoutDashboard, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import AnnouncementsWidget from './AnnouncementsWidget';

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutDashboard size={32} color="var(--primary-color)" />
          <h1 style={{ margin: 0 }}>Student Dashboard</h1>
        </div>
        <p>Welcome back! Keep track of your academic journey.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <p>Current GWA</p>
            <h3>1.25</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p>Units Completed</p>
            <h3>86 / 164</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <p>Classes Today</p>
            <h3>3</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p>Pending Clearance</p>
            <h3>None</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ gridTemplateColumns: 'repeat(1, 1fr)', marginBottom: '24px' }}>
        <AnnouncementsWidget />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2><Clock size={20} /> Today's Classes</h2>
          <div className="list-container">
            <div className="timeline-item">
              <div className="timeline-dot">
                <BookOpen size={16} />
              </div>
              <div className="timeline-content">
                <h4>Software Engineering 1</h4>
                <p>Room 401 - Prof. Maria S.</p>
                <div className="timeline-time">09:00 AM - 10:30 AM</div>
              </div>
              <div className="timeline-line"></div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-dot">
                <FileText size={16} />
              </div>
              <div className="timeline-content">
                <h4>Information Management</h4>
                <p>Lab 2 - Prof. John D.</p>
                <div className="timeline-time">11:00 AM - 01:00 PM</div>
              </div>
              <div className="timeline-line"></div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">
                <Activity size={16} />
              </div>
              <div className="timeline-content">
                <h4>Physical Education</h4>
                <p>Gymnasium</p>
                <div className="timeline-time">02:30 PM - 04:30 PM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2><ChevronRight size={20} /> Quick Links</h2>
          <div className="list-container">
            <Link to="/academic-tracker" className="list-item">
              <div className="item-icon">
                <BookOpen size={20} />
              </div>
              <div className="item-content">
                <h4>Academic Tracker</h4>
                <p>View your grades and curriculum</p>
              </div>
            </Link>
            <Link to="/medical-records" className="list-item">
              <div className="item-icon">
                <Activity size={20} />
              </div>
              <div className="item-content">
                <h4>Medical Records</h4>
                <p>Check your health status and clearances</p>
              </div>
            </Link>
            <Link to="/events" className="list-item">
              <div className="item-icon">
                <Calendar size={20} />
              </div>
              <div className="item-content">
                <h4>Upcoming Events</h4>
                <p>See college activities and seminars</p>
              </div>
            </Link>
            <Link to="/achievements" className="list-item">
              <div className="item-icon">
                <Award size={20} />
              </div>
              <div className="item-content">
                <h4>My Achievements</h4>
                <p>Manage your certificates and awards</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;