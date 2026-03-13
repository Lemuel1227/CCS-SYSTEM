import React, { useState } from 'react';
import { 
  Activity, Calendar, Clock, User, HeartPulse, ShieldAlert,
  FileCheck, AlertCircle
} from 'lucide-react';
import './MyMedicalRecords.css';

const MOCK_STUDENT_ID = '2023-0001';

const MyMedicalRecords = () => {
  const [record] = useState(() => {
    try {
      const stored = localStorage.getItem('ccs_medical_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        const myRecord = parsed.find(r => r.studentId === MOCK_STUDENT_ID);
        if (myRecord) {
          return myRecord;
        }
      }
    } catch (error) {
      console.error('Error parsing medical records:', error);
    }
    
    // Fallback if not found in LocalStorage
    return { 
      id: '1', 
      studentId: MOCK_STUDENT_ID, 
      name: 'John Doe', 
      bloodType: 'O+', 
      conditions: 'Asthma', 
      lastCheckup: '2023-11-15', 
      status: 'Cleared' 
    };
  });

  const [history] = useState([
    { id: 'h1', date: '2023-11-15', type: 'Annual Checkup', doctor: 'Dr. Sarah Smith', notes: 'All clear. Inhaler prescription renewed.', status: 'Cleared' },
    { id: 'h2', date: '2023-05-22', type: 'Clinic Visit', doctor: 'Nurse Joy', notes: 'Treated for mild fever. Given paracetamol.', status: 'Sent Home' },
    { id: 'h3', date: '2022-10-10', type: 'Annual Checkup', doctor: 'Dr. Sarah Smith', notes: 'Asthma noted. Baseline set.', status: 'Cleared' }
  ]);

  if (!record) return <div className="medical-loading">Loading Health Profile...</div>;

  const isCleared = record.status === 'Cleared';
  const needsUpdate = record.status === 'Needs Update';

  return (
    <div className="student-medical-container">
      <div className="sm-header">
        <div className="sm-header-text">
          <h2>My Medical Records</h2>
          <p>View your health summary, clinic visits, and update requirements.</p>
        </div>
        
        {/* Dynamic Status Badging */}
        <div className={`sm-status-banner ${record.status.toLowerCase().replace(' ', '-')}`}>
          {isCleared && <FileCheck size={20} />}
          {needsUpdate && <AlertCircle size={20} />}
          {!isCleared && !needsUpdate && <Clock size={20} />}
          <div className="banner-text">
            <strong>Clearance Status: {record.status}</strong>
            <span>
              {isCleared ? 'You are cleared for all campus activities.' : 
               needsUpdate ? 'Please visit the clinic to update your medical file.' : 
               'Your medical status is currently under review.'}
            </span>
          </div>
        </div>
      </div>

      <div className="sm-grid">
        {/* Left Column: Health Profile */}
        <div className="sm-profile-card">
          <div className="card-header">
            <HeartPulse className="card-icon" />
            <h3>Health Profile</h3>
          </div>
          
          <div className="profile-details">
            <div className="profile-row">
              <span className="label">Student Name</span>
              <span className="value">{record.name}</span>
            </div>
            <div className="profile-row">
              <span className="label">Student ID</span>
              <span className="value">{record.studentId}</span>
            </div>
            <div className="profile-row divider"></div>
            <div className="profile-row">
              <span className="label">Blood Type</span>
              <span className="value blood-type-badge">{record.bloodType || 'Not Provided'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Pre-existing Conditions</span>
              <span className="value">{record.conditions || 'None reported'}</span>
            </div>
            <div className="profile-row">
              <span className="label">Last Checkup Date</span>
              <span className="value">{record.lastCheckup || 'Unknown'}</span>
            </div>
          </div>
          
          {needsUpdate && (
            <div className="sm-action-prompt">
              <ShieldAlert size={16} />
              <span>An updated physical examination is required to regain clearance.</span>
            </div>
          )}
        </div>

        {/* Right Column: Visit History */}
        <div className="sm-history-card">
          <div className="card-header">
            <Activity className="card-icon" />
            <h3>Clinic Visit History</h3>
          </div>
          
          <div className="history-timeline">
            {history.map((event) => (
              <div key={event.id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{event.type}</h4>
                    <span className="timeline-date">
                      <Calendar size={12} /> {event.date}
                    </span>
                  </div>
                  <p className="timeline-doctor">
                    <User size={12} /> Assisting: {event.doctor}
                  </p>
                  <div className="timeline-body">
                    <p>{event.notes}</p>
                    <span className={`visit-status ${event.status.toLowerCase().replace(' ', '-')}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMedicalRecords;